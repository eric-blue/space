import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { normalizeSolTo3, Actor, ActorParams } from "./Actor.tsx";

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
      width: normalizeSolTo3(width / 2) * SCALE_F,
      height: normalizeSolTo3(height / 2) * SCALE_F,
      depth: normalizeSolTo3(depth / 2) * SCALE_F,
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

    console.log("navigating", this.acceleration, this.params);

    this.update({
      orbitalRadius: Math.floor(Math.random() * (2400000000000 - 100000000 + 1) + 10000000),
    });
  }
}
