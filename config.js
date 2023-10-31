const config = {
  gps: {
    path: '/dev/ttyAMA0', // use '/dev/ttyACM0' for USB
    mockdata: false       // for testing without GPS. Uses data/test-data.txt
  },
  buzzer: {
    pin: 7,
    mockhardware: false   // for testing on laptop without hardware
  }
 };

export default config;