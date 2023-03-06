import * as THREE from "three"
import { PassiveRecord } from "./PassiveSensors.ts";

export class NavigationalComputer {
  navCompActive: boolean;

  constructor() {
    this.navCompActive = false;
  }

  toggleSensors() {
    this.navCompActive = !this.navCompActive;
  }

  setIntersectionTarget(setInBaseActor: () => void) {
    if (this.navCompActive) setInBaseActor()
  }

  plotIntercept(sensorData: PassiveRecord[], elapsed: number): PassiveRecord['position'] | null {
    const timeScaleAdjustment = 1;

    const elapsedTime = elapsed / timeScaleAdjustment; // Calculate elapsed time in seconds
    const positions = sensorData.map(data => new THREE.Vector3(data.position.x, data.position.y, data.position.z));
    const velocity = this.estimateInterceptVelocity(positions, elapsedTime); // Estimate velocity based on recent positions and elapsed time
    const newPosition = positions.at(-1)?.clone().add(velocity.clone().multiplyScalar(elapsedTime)); // Calculate new position based on estimated velocity and elapsed time

    return newPosition ? newPosition : null;
  }

  estimateInterceptVelocity(positions: THREE.Vector3[], elapsedTime: number) {
    if (positions.length < 2) return new THREE.Vector3(0, 0, 0);


    const totalDisplacement = new THREE.Vector3();
    for (let i = 1; i < positions.length; i++) {
      const displacement = new THREE.Vector3().subVectors(positions[i], positions[i - 1]);
      totalDisplacement.add(displacement);
    }
    const avgDisplacement = totalDisplacement.divideScalar(positions.length - 1);
    const velocity = avgDisplacement.divideScalar(elapsedTime);
    return velocity;
  }
}
