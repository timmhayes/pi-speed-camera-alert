import rpio from "rpio";
import { exec } from 'child_process';
import config from '../config.js';

// create asychronous sleep function and call stack
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class Buzzer {
  constructor(opts) {
    this.mock = config.buzzer.mockhardware || opts.mockhardware;
    this.pin = config.buzzer.pin || opts.pin;
    console.log('Buzzer pin', this.pin, 'mock', this.mock);
    rpio.on('warn', (e) => {
      console.log('RPIO warning:', e)
      this.mock = true;
    });
    rpio.open(this.pin, rpio.OUTPUT, rpio.LOW);
  }

  async beep(ms = 100) {
    if (!this.mock) {
      rpio.write(this.pin, rpio.HIGH);
      await sleep(ms);
      rpio.write(this.pin, rpio.LOW);
    } else {
      exec('powershell.exe [console]::beep(500,' + ms +')');
    }
  }

  async beepNTimes(n, msOn = 100, msOff = 0) {
    const stack = Array.from(Array(n).keys());
    for (let i of stack) {
      await this.beep(msOn);
      if (msOff) await sleep(msOff);
    }
  }
}

export { Buzzer };