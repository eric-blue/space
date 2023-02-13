import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR, MAX_BOUNDS } from "../constants.ts";
import { Actor, ActorParams } from "./Actor.tsx";

const SCALE_F = ARTIFICIAL_SCALE_FACTOR * 100;

interface Params {
  color?: THREE.Color;
  width: number;
  height: number;
  depth: number;
}

export type ShipParams = Params & ActorParams;

export class Ship extends Actor<Params> {
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

    super(geometry, material, params);
  }

  update(params?: Partial<Omit<ActorParams, "clock">> | undefined): void {
    super.update(params);
    if (!this.mesh) throw new Error("No mesh to update");

    this.mesh.lookAt(this.group?.position ?? new THREE.Vector3(0, 0, 0));
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  navigate() {
    if (!this.mesh) throw new Error("No mesh to navigate");

    this.update({
      orbitalRadius: Math.floor(Math.random() * ((MAX_BOUNDS ?? 2400000000000) - 100000000 + 1) + 10000000),
      orbitalInclination: Math.floor(Math.random() * (360 - 0 + 1) + 0),
      orbitalEccentricity: Math.floor(Math.random() * (100 - 0 + 0.99) + 0) / 100,
    });
  }
}
