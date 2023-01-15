import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { getDerivedRadius, _, _Params } from "./_.tsx";

interface ShipParams extends _Params {
  color?: THREE.Color;

  width: number;
  height: number;
  depth: number;
}

export class Ship extends _ {
  declare params: ShipParams;

  constructor(params: ShipParams) {
    const dimensions = {
      width: getDerivedRadius(params.width / 2) * 2 * ARTIFICIAL_SCALE_FACTOR * 100,
      height: getDerivedRadius(params.height / 2) * 2 * ARTIFICIAL_SCALE_FACTOR * 100,
      depth: getDerivedRadius(params.depth / 2) * 2 * ARTIFICIAL_SCALE_FACTOR * 100,
    }

    const geometry = new THREE.BoxGeometry(dimensions.depth, dimensions.height, dimensions.width);
    const material = new THREE.MeshStandardMaterial({ color: params.color ?? 0xffffff, });
    super(geometry, material, params);
  }

  update(params?: Partial<Omit<_Params, "clock">> | undefined): void {
    super.update(params);
    if (!this.mesh) throw new Error("No mesh to update");

    this.mesh.lookAt(new THREE.Vector3(0,0,0));
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
      orbitalRadius: Math.floor(Math.random() * (24000000000 - 10000000 + 1) + 10000000),
    });
  }
}
