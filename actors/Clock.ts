import * as THREE from "three";

type TimeScale = 10 | 100 | 1000;

export class Clock {
  private clock: THREE.Clock;
  private time: number;
  timeScale: TimeScale;

  constructor() {
    this.clock = new THREE.Clock();
    this.clock.autoStart = true
    this.time = 0;
    this.timeScale = 1000;
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

  running() {
    return this.clock.running;
  }

  pause(): void {
    this.clock.stop();
  }

  resume(): void {
    this.clock.start();
  }

  stepBackward(step: number): void {
    this.time -= step;
  }

  stepForward(step: number): void {
    this.time += step;
  }
}
