import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { normalizeSolTo3, Actor, ActorParams } from "./Actor.tsx";

interface Params {
  color?: THREE.Color;
}

export type PlanetaryParams = Params & ActorParams;

export class Planetary extends Actor<Params> {
  declare params: PlanetaryParams;

  constructor(params: PlanetaryParams) {
    const derivedRadius = normalizeSolTo3(params.radius) * ARTIFICIAL_SCALE_FACTOR;
    const geometry = new THREE.SphereGeometry(derivedRadius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: params.color ?? 0xffffff, fog: false, });
    super(geometry, material, params);
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  update() {
    super.update();
    if (!this.mesh) throw new Error("No mesh to update");
    this.mesh.rotation.y += 0.001; // TODO: make this calc
  }
}
