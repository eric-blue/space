import * as THREE from "three";
import { getDerivedRadius, _, _Params } from "./_.tsx";

import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

interface StarParams extends Omit<_Params, 'receiveShadow'|'type'> {
  color?: THREE.Color;
  intensity?: number;
}

// const textureLoader = new THREE.TextureLoader();
// const textureFlare0 = textureLoader.load( 'textures/lensflare/lensflare0.png' );
// const textureFlare3 = textureLoader.load( 'textures/lensflare/lensflare3.png' );

export class Star extends _ {
  declare params: StarParams;

  constructor(params: StarParams) {
    const derivedRadius = getDerivedRadius(params.radius);
    const geometry = new THREE.SphereGeometry(derivedRadius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: params.color ?? 0xffffff,
      fog: false,
    });
    super(geometry, material, {...params, type: 'star'});
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");

    const pointLight = new THREE.PointLight(0xffffff, this.params.intensity ?? 30, 100000, 0.5)
    pointLight.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    pointLight.castShadow = true
    // pointLight.shadow.mapSize.width = 1024
    // pointLight.shadow.mapSize.height = 1024
    // pointLight.shadow.camera.near = 0.1
    // pointLight.shadow.camera.far = 5

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(this.mesh.position.x, 0, this.mesh.position.z - 5)

    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(0, -0.5, 0);
    // scene.add(light);

    // addLight( 0.55, 0.9, 0.5, 5000, 0, - 1000 );
    // addLight( 0.08, 0.8, 0.5, 0, 0, - 1000 );
    // addLight( 0.995, 0.5, 0.9, 5000, 5000, - 1000 );

    function addLight( h: number, s: number, l: number, x: number, y: number, z: number ) {

      const light = new THREE.PointLight( 0xffffff, 1.5, 100000 );
      light.color.setHSL( h, s, l );
      light.position.set( x, y, z );
      scene.add( light );

      const lensflare = new Lensflare();
      // lensflare.addElement( new LensflareElement( textureFlare0, 700, 0, light.color ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) );
      light.add( lensflare );

    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.5), pointLight)
  }

}
