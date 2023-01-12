import * as THREE from "three";
import { ARTIFICIAL_SCALE_FACTOR } from "../constants.ts";
import { getDerivedRadius, _, _Params } from "./_.tsx";

interface StarParams extends Omit<_Params, 'receiveShadow'|'type'> {
  color?: THREE.Color;
  intensity?: number;
}

export class Star extends _ {
  declare params: StarParams;

  constructor(params: StarParams) {
    const derivedRadius = getDerivedRadius(params.radius);
    const geometry = new THREE.SphereGeometry(derivedRadius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: params.color ?? 0xffffff });
    super(geometry, material, {...params, type: 'star'});
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");

    const pointLight = new THREE.PointLight(0xffffff, this.params.intensity ?? 3, 100, 2)
    pointLight.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 1024
    pointLight.shadow.mapSize.height = 1024
    pointLight.shadow.camera.near = 0.1
    pointLight.shadow.camera.far = 5

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 0, 1)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5), pointLight)
  }


}
