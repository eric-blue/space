import { asset } from "$fresh/runtime.ts";

import * as THREE from "three";
import { normalizeSolTo3, _, _Params } from "./_.tsx";

import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

export interface StarParams extends Omit<_Params, 'receiveShadow'> {
  color?: THREE.Color;
  intensity?: number;
}

export class Star extends _ {
  declare params: StarParams;

  constructor(params: StarParams) {
    const derivedRadius = normalizeSolTo3(params.radius);
    const geometry = new THREE.SphereGeometry(derivedRadius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: params.color ?? 0xffffff,
      visible: false,
      fog: false,
    });
    super(geometry, material, {...params, type: 'star'});
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");

    const {textureLoader} = this.params;

    const textureFlare0 = textureLoader.load( asset('/textures/lensflare0.png') );
    const textureFlare3 = textureLoader.load( asset('/textures/lensflare3.png') );

    const pointLight = new THREE.PointLight(0xffffff, this.params.intensity ?? 30, 100000, 0.5)
    pointLight.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    pointLight.castShadow = true

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(this.mesh.position.x, 0, this.mesh.position.z - 5)

    const addLight = ( h: number, s: number, l: number ) => {
      const light = new THREE.PointLight( 0xffffff, 1.5, 10000 );
      light.color.setHSL( h, s, l );
      light.castShadow = true

      if (this.mesh) light.position.set(
        this.mesh.position.x, this.mesh.position.y, this.mesh.position.z
      );

      scene.add( light );

      const lensflare = new Lensflare();
      lensflare.addElement( new LensflareElement( textureFlare0, 700, 0, light.color ) );
      lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.2 ) );
      lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.3 ) );
      lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.35 ) );
      lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.4 ) );
      light.add( lensflare );
    }

    addLight( 0.995, 0.5, 0.9 );

    scene.add(new THREE.AmbientLight(0xffffff, 0.5), pointLight)
  }

}
