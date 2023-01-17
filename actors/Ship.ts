import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { normalizeSolTo3, Actor, ActorParams } from "./Actor.tsx";

interface ShipParams extends ActorParams {
  color?: THREE.Color;

  width: number;
  height: number;
  depth: number;
}

export class Ship extends Actor {
  declare params: ShipParams;

  constructor(params: ShipParams) {
    const dimensions = {
      width: normalizeSolTo3(params.width / 2) * 2 * ARTIFICIAL_SCALE_FACTOR * 100,
      height: normalizeSolTo3(params.height / 2) * 2 * ARTIFICIAL_SCALE_FACTOR * 100,
      depth: normalizeSolTo3(params.depth / 2) * 2 * ARTIFICIAL_SCALE_FACTOR * 100,
    }

    const geometry = new THREE.BoxGeometry(dimensions.depth, dimensions.height, dimensions.width);
    const material = new THREE.MeshStandardMaterial({ color: params.color ?? 0xffffff, });
    super(geometry, material, params);
  }

  update(params?: Partial<Omit<ActorParams, "clock">> | undefined): void {
    super.update(params);
    if (!this.mesh) throw new Error("No mesh to update");

    this.mesh.lookAt(this.group?.position ?? new THREE.Vector3(0,0,0));
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
      // random number between 10000000 and 24000000000
      orbitalRadius: Math.floor(Math.random() * (24000000000 - 100000000 + 1) + 10000000),
    });
  }
}
