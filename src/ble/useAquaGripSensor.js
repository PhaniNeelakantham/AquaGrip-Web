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

// Placeholder until the first real sample arrives (not a measurement).
export const ZERO_READING = { forcePsi: 0, qw: 1, qx: 0, qy: 0, qz: 0 };

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
  // When the newest sample arrived; games use it to notice a silent link
  // (Android can take several seconds to report a dropped connection).
  const lastDataAtRef = useRef(0);

  const publish = useCallback((next) => {
    readingRef.current = next;
    lastDataAtRef.current = performance.now();
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

  // Stable listeners, so reconnecting can remove the old ones first and a
  // characteristic never ends up delivering each sample twice.
  const onData = useCallback((event) => publish(decodeReading(event.target.value)), [publish]);
  const onStatus = useCallback((event) => setStatus(decodeStatus(event.target.value)), []);
  const onDrop = useCallback(() => setConnectionState("disconnected"), []);

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

    // After a dropped link, reconnect to the same AquaGrip directly instead
    // of making the player pick it from Chrome's device list again.
    const reusing = deviceRef.current !== null;
    try {
      setConnectionState("connecting");

      let device = deviceRef.current;
      if (!device) {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ name: DEVICE_NAME }],
          optionalServices: [SERVICE_UUID],
        });
        deviceRef.current = device;
      }
      device.removeEventListener("gattserverdisconnected", onDrop);
      device.addEventListener("gattserverdisconnected", onDrop);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);

      const dataChar = await service.getCharacteristic(DATA_CHAR_UUID);
      dataChar.removeEventListener("characteristicvaluechanged", onData);
      dataChar.addEventListener("characteristicvaluechanged", onData);
      await dataChar.startNotifications();

      const statusChar = await service.getCharacteristic(STATUS_CHAR_UUID);
      statusChar.removeEventListener("characteristicvaluechanged", onStatus);
      statusChar.addEventListener("characteristicvaluechanged", onStatus);
      await statusChar.startNotifications();

      setConnectionState("connected");
    } catch (err) {
      // If the remembered device can't be reached, the next try shows the picker.
      if (reusing) deviceRef.current = null;
      setError(err instanceof Error ? err.message : String(err));
      setConnectionState("disconnected");
    }
  }, [mock, publish, onData, onStatus, onDrop]);

  // Disconnect cleanly if the component using this hook unmounts.
  useEffect(() => disconnect, [disconnect]);

  return { connectionState, reading, readingRef, lastDataAtRef, status, error, connect, disconnect };
}
