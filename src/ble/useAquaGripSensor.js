import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEVICE_NAME,
  SERVICE_UUID,
  DATA_CHAR_UUID,
  STATUS_CHAR_UUID,
  decodeReading,
  decodeStatus,
} from "./protocol";
import { startMockReadings } from "./mockReadings";

const ZERO_READING = { forcePsi: 0, qw: 1, qx: 0, qy: 0, qz: 0 };

// Talks to the AquaGrip ESP32 over Web Bluetooth, or (with mock: true)
// generates a fake reading stream instead -- both paths expose the exact
// same shape, so game/tracker code never needs to know which one is active.
export function useAquaGripSensor({ mock = false } = {}) {
  const [connectionState, setConnectionState] = useState("disconnected"); // disconnected | connecting | connected
  const [reading, setReading] = useState(ZERO_READING);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);

  const deviceRef = useRef(null);
  const stopMockRef = useRef(null);
  // Games read the newest sample from this ref every animation frame, so
  // they never wait for (or trigger) a React re-render to get sensor data.
  const readingRef = useRef(ZERO_READING);

  const publish = useCallback((next) => {
    readingRef.current = next;
    setReading(next);
  }, []);

  const disconnect = useCallback(() => {
    if (stopMockRef.current) {
      stopMockRef.current();
      stopMockRef.current = null;
    }
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;
    setConnectionState("disconnected");
  }, []);

  const connect = useCallback(async () => {
    setError(null);

    if (mock) {
      setConnectionState("connecting");
      stopMockRef.current?.(); // never run two demo streams at once
      stopMockRef.current = startMockReadings(publish);
      setStatus("MOCK");
      setConnectionState("connected");
      return;
    }

    if (!navigator.bluetooth) {
      setError("Web Bluetooth isn't available in this browser. Use Chrome or Edge.");
      return;
    }

    try {
      setConnectionState("connecting");

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: DEVICE_NAME }],
        optionalServices: [SERVICE_UUID],
      });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        setConnectionState("disconnected");
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);

      const dataChar = await service.getCharacteristic(DATA_CHAR_UUID);
      await dataChar.startNotifications();
      dataChar.addEventListener("characteristicvaluechanged", (event) => {
        publish(decodeReading(event.target.value));
      });

      const statusChar = await service.getCharacteristic(STATUS_CHAR_UUID);
      await statusChar.startNotifications();
      statusChar.addEventListener("characteristicvaluechanged", (event) => {
        setStatus(decodeStatus(event.target.value));
      });

      setConnectionState("connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setConnectionState("disconnected");
    }
  }, [mock, publish]);

  // Disconnect cleanly if the component using this hook unmounts.
  useEffect(() => disconnect, [disconnect]);

  return { connectionState, reading, readingRef, status, error, connect, disconnect };
}
