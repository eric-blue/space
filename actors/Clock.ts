import * as THREE from "three";

type TimeScale = 1000 | 10000 | 100000;

export class Clock {
  private clock: THREE.Clock;
  private time: number;
  private timeScale: TimeScale;

  constructor() {
    this.clock = new THREE.Clock();
    this.clock.autoStart = true
    this.time = 0;
    this.timeScale = 1000000;
  }

  getDelta(): number {
    return this.clock.getDelta() * this.timeScale;
  }

  getElapsedTime(): number {
    this.update();
    return this.time;
  }

  setTimeScale(timeScale: TimeScale): void {
    this.timeScale = timeScale;
  }

  update(): void {
    this.time += this.getDelta();
  }

  pause(): void {
    this.clock.stop();
  }

  resume(): void {
    this.clock.start();
  }
}
