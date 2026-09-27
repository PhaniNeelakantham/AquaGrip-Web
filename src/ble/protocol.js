// Must match xiao_sensor_firmware_ble.ino exactly -- these UUIDs and the
// byte layout below are the contract between the firmware and the app.
export const DEVICE_NAME = "AquaGrip";
export const SERVICE_UUID = "a495ff10-c5b1-4b44-b512-1370f02d74de";
export const DATA_CHAR_UUID = "a495ff11-c5b1-4b44-b512-1370f02d74de";
export const STATUS_CHAR_UUID = "a495ff12-c5b1-4b44-b512-1370f02d74de";

// The data characteristic is 5 little-endian float32s, in this order:
// force_psi, qw, qx, qy, qz (20 bytes total -- see the firmware's header
// comment for why that size was chosen).
export function decodeReading(dataView) {
  return {
    forcePsi: dataView.getFloat32(0, true),
    qw: dataView.getFloat32(4, true),
    qx: dataView.getFloat32(8, true),
    qy: dataView.getFloat32(12, true),
    qz: dataView.getFloat32(16, true),
  };
}

const textDecoder = new TextDecoder();

export function decodeStatus(dataView) {
  return textDecoder.decode(dataView);
}
