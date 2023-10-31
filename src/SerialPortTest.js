import path from 'path';
const rootPath = path.dirname(fileURLToPath(import.meta.url));
import { readFile } from 'fs';
import { fileURLToPath } from 'url';

import config from '../config.js';
import { SerialPortMock } from 'serialport';
SerialPortMock.binding.createPort(config.gps.path)

const processData = (text) => {
  const lines =  text.split('\n')
  const startTime = lines[0].split(',')[0];
  return lines.map(line => {
    const [time, ...data] = line.split(',');
    return {
      time: time - startTime,
      data: data.join(',')
    }
  });
}

class SerialPortTest extends SerialPortMock {
  constructor(opts = {}) {
    super(opts)
    this._feed = [];
    this._startTime = Date.now();
    readFile(path.join(rootPath, '../data/test-data.txt'), 'utf8', (err, data) => {
      if (err) throw err;
      this._feed = processData(data);
      this.pushData()
    });
  }

  pushData = () => {
    const elapsed = Date.now() - this._startTime;
    while (this._feed.length && this._feed[0].time < elapsed) {
      const line = this._feed.shift();
      this.port.emitData(line.data + '\r\n');
    }
    if (this._feed.length) {
      setTimeout(() => {
        this.pushData(this._feed);
      }, this._feed[0].time - elapsed);
    }

  }
}

export { SerialPortTest };