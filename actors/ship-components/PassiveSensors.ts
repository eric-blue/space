import * as THREE from "three";
import { MAX_BOUNDS } from "../../constants.ts";

export interface PassiveRecord {
  position: {x: number, y: number, z: number};
  timestamp: number;
}

export class PassiveSensors {
  sensorsActive: boolean;
  lightReadings: {
    [uuid: string]: PassiveRecord[];
  };

  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  private cameraHelper: THREE.CameraHelper;


  constructor() {
    this.sensorsActive = true;
    this.lightReadings = {};

    this.raycaster = new THREE.Raycaster();
    // todo: should update on screen resize
    this.camera = new THREE.PerspectiveCamera(90, 1, 1, MAX_BOUNDS);
    this.cameraHelper = new THREE.CameraHelper(this.camera);
  }

  spawnSensors(scene: THREE.Scene) {
    scene.add(this.cameraHelper)
  }

  toggleSensors() {
    this.cameraHelper.visible = !this.cameraHelper.visible
  }


  updateSensors(elapsed: number, scene: THREE.Scene, mesh: THREE.Mesh) {
    if (this.sensorsActive) {
      this.camera.position.copy(mesh.position);
      this.camera.lookAt(scene.position);
      this.camera.rotation.y = 90

      // this should be updated to watch for all sorts of objects, projectiles, planets, etc
      const ships = scene.children.filter(
        (child) => child.type === "Mesh" && child.name === "ship" && child.uuid !== mesh.uuid
      );

      for (const ship of ships) {
        const direction = new THREE.Vector3().subVectors(ship.position, this.camera.position).normalize();
        this.raycaster.set(this.camera.position, direction);
        const intersects = this.raycaster.intersectObject(ship);

        for (const { object } of intersects) {
          if (!this.lightReadings[ship.uuid]) this.lightReadings[ship.uuid] = [];
          this.lightReadings[ship.uuid].push({ position: object.position, timestamp: elapsed });
        }
      }
    }
  }

  getRecentSensorData(uuid?: string) {
    if (!uuid) return []
    return this.lightReadings[uuid]?.slice(-12) ?? []
  }
}
