import path from 'path';
import { fileURLToPath } from 'url';
import utils from './Utils.js';
import { readFile } from 'fs/promises';
import { Buzzer } from './Buzzer.js';
const rootPath = path.dirname(fileURLToPath(import.meta.url));

class CameraTracker {
  constructor() {
    this.cameraList = [];
    this.loadCameraList();
    this.activeCameras = [];
    this.receivingGPSData = false;
    this.buzzer = new Buzzer();
  }

  async loadCameraList() {
    try {
      const data = await readFile(path.join(rootPath, '../data/cameras.json'), 'utf8');
      const cameras = JSON.parse(data);
      this.cameraList = cameras.map(camera => {
        return {...camera, id: camera.lat + '_' + camera.lng};
      })
      console.log('loaded camera list', this.cameraList.length, 'cameras');
    } catch (error) {
      console.error('Error loading camera list:', error);
    }
  }

  updateLocation(location) {
    if (!this.receivingGPSData) {
      this.receivingGPSData = true;
      this.buzzer.beepNTimes(2, 200, 100);
      console.log('beep')
    }
    const lastActiveCameras = [...this.activeCameras];
    this.activeCameras = [];
    for (let camera of this.cameraList) {
      const position = utils.positionBetweenPoints(location, camera);
      if (position.distance < 0.25) {
        this.activeCameras.push({...camera, ...position});
      }
    }
    this.activeCameras = this.activeCameras.map(camera => {
      const match = lastActiveCameras.find(lastCamera => lastCamera.id === camera.id);
      if (match) {
        // merge with previous data
        camera = {
          ...match,
          ...camera,
          updated: match.updated + 1,
          positionIncremented: camera.distance - match.distance,
        };
        if (!camera.ignore && camera.positionIncremented > 0 && !camera.passed) {
          // have passed and driving away from camera
          console.log('beeeeeeep')
          this.buzzer.beep(1000);
          camera.passed = true;
        }
      } else {
        // first time seeing this camera | ignore if in the wrong direction
        const ignore = camera.bearing && Math.abs(camera.direction - camera.bearing) > 135;
        if (!ignore) {
          console.log('beep beep beep')
          this.buzzer.beepNTimes(3, 200, 200);
        }
        camera = {...camera, updated: 0, ignore, passed: false};
      }
      console.log(camera)
      return camera;
    });
  }

}

export { CameraTracker };