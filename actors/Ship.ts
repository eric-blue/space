import * as THREE from "three";
import { Mixin } from 'ts-mixer';

import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { Actor, ActorParams } from "./Actor.ts";
import { CameraControl } from "./Camera.ts";
import {ShipComponents} from "./ship-components/index.ts";

const SCALE_F = ARTIFICIAL_SCALE_FACTOR * 100;

interface Params {
  color?: THREE.Color;
  width: number;
  height: number;
  depth: number;
  cameraControl: CameraControl;
}

export type ShipParams = Params & ActorParams;

export class Ship extends Mixin(Actor<Params>, ShipComponents) {
  declare params: ShipParams;

  constructor(params: ShipParams) {
    const { color = 0xffffff, width, height, depth } = params;
    const dimensions = {
      width: width / 2 * SCALE_F,
      height: height / 2 * SCALE_F,
      depth: depth / 2 * SCALE_F,
    };

    const geometry = new THREE.BoxGeometry(dimensions.depth, dimensions.height, dimensions.width);
    const material = new THREE.MeshStandardMaterial({ color });

    super(geometry, material, {
      ...params,
      onPlotIntercept: (targetMesh) => {
        // console.log(this.getRecentSensorData(targetMesh.uuid))
        return this.plotIntercept(this.getRecentSensorData(targetMesh.uuid), params.clock.getElapsedTime())
      }
    });

    addEventListener('ship-click', () => this.navigate());
  }

  update(params?: Partial<Omit<ActorParams, "clock">> | undefined): void {
    super.update(params);
    if (!this.mesh) throw new Error("No mesh to update");

    this.mesh.lookAt(this.group?.position ?? new THREE.Vector3(0, 0, 0));

    this.updateSensors(this.params.clock.getElapsedTime(), this.params.scene, this.mesh);
  }

  spawn() {
    super.spawn();
    if (!this.mesh) throw new Error("No mesh to spawn");
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.spawnSensors(this.params.scene);
  }

  navigate() {
    if (!this.mesh) throw new Error("No mesh to navigate");

    const otherShip = this.params.scene.children.find(
      (child) => child instanceof THREE.Mesh && child.name === "ship" && child.uuid !== this.mesh.uuid
    ) as THREE.Mesh|undefined;

    if (otherShip) this.setIntersectionTarget(() => { this.interceptionTarget = otherShip });

    // this.update({
    //   orbitalRadius: Math.floor(Math.random() * ((MAX_BOUNDS ?? 2400000000000) - 100000000 + 1) + 10000000),
    //   orbitalInclination: Math.floor(Math.random() * (360 - 0 + 1) + 0),
    //   orbitalEccentricity: Math.floor(Math.random() * (100 - 0 + 0.99) + 0) / 100,
    // });
  }
}
