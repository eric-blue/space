import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { getDerivedRadius, _, _Params } from "./_.tsx";

interface PlanetaryParams extends _Params {
  color?: THREE.Color;
}

export class Planetary extends _ {
  declare params: PlanetaryParams;

  constructor(params: PlanetaryParams) {
    const derivedRadius = getDerivedRadius(params.radius);
    const geometry = new THREE.SphereGeometry(derivedRadius * ARTIFICIAL_SCALE_FACTOR, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: params.color ?? 0xffffff });
    super(geometry, material, params);
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}
