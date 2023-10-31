import { SerialPort } from 'serialport';
import { SerialPortTest } from './SerialPortTest.js';
import { ReadlineParser }  from '@serialport/parser-readline';
import { Readable } from 'stream';
import utils from './Utils.js';
import config from '../config.js';
console.log(config)

class GPS extends Readable {
  constructor(opts = {mockdata: false}) {
    opts.objectMode = true;
    super(opts)
    this._queue = [];
    const portOptions = { path: config.gps.path, baudRate: 9600 };
    if (opts.mockdata || config.gps.mockdata) {
      console.log('Using mock data')
      this._port = new SerialPortTest(portOptions)
    } else {
      this._port = new SerialPort(portOptions)
    }
    this._port.on('error', (err) => {
      console.log('GPS error: ', err.message)
    })

    this._parser = this._port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
    this._parser.on('data', (data) => {
      if (data.match(/\$GPRMC/i)) {
        const point = utils.GPRMCtoPoint(data);
        console.log(point);
        if (point.lat && point.lng) {
          const result = this.push(point);
          if (!result) this.this._queue.push(point);
        }
      }
    })
  }
 
  _read() {
    // The consumer is ready for more data
    if (this._queue.length) {
      this.push(this.this._queue.shift())
    }
  }
 
  _destroy() {
    this._port.close()
    this.this._queue = null
  }
}

export { GPS };
