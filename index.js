import { GPS } from './src/GPS.js';
import { CameraTracker }  from './src/CameraTracker.js';

(async () => {
  const tracker = new CameraTracker();
  const gps = new GPS({mockdata: false});
  gps.on('data', location => {
    tracker.updateLocation(location);
    console.log(tracker.activeCameras.length, 'active cameras');
  });

  const shutdown = () => {
    console.log('shutting down...');
    gps.destroy();
    process.exit();
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

})();
