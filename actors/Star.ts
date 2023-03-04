import { asset } from "$fresh/runtime.ts";

import * as THREE from "three";
import { Actor, ActorParams } from "./Actor.tsx";

import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { MAX_BOUNDS } from "../constants.ts";

interface Params {
  color?: THREE.Color;
  intensity?: number;
}

export type StarParams = Params & ActorParams;

export class Star extends Actor<Params> {
  declare params: StarParams;

  constructor(params: StarParams) {
    const geometry = new THREE.SphereGeometry(params.radius, 50, 50);
    // const geometry = new THREE.PlaneGeometry(params.radius* 2,params.radius* 2, 50, 50);
    // const material = new THREE.MeshStandardMaterial({
    //   color: params.color ?? 0xffffff,
    // });

    const count = geometry.attributes.position.count
    const randoms = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random() * 100
    }
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

    const material = new THREE.RawShaderMaterial({
      fog: false,
      wireframe: true,
      vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;

        attribute vec3 position;
        attribute float aRandom;

        void main()
        {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.z += aRandom * 0.1;

          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;

        void main()
        {
          gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
        }
      `
    })

    console.log(geometry)

    super(geometry, material, {...params, type: 'star'});
  }

  spawn(scene: THREE.Scene) {
    super.spawn(scene);
    if (!this.mesh) throw new Error("No mesh to spawn");

    const {textureLoader} = this.params;

    const textureFlare0 = textureLoader?.load( asset('/textures/lensflare0.png') );
    const textureFlare3 = textureLoader?.load( asset('/textures/lensflare3.png') );

    const pointLight = new THREE.PointLight(0xffffff, this.params.intensity ?? 1000000, MAX_BOUNDS, 0.5)
    pointLight.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    pointLight.castShadow = true
    pointLight.shadow.normalBias = 0.05

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1000000)
    directionalLight.position.set(this.mesh.position.x, 0, this.mesh.position.z)

    const addLight = ( h: number, s: number, l: number ) => {
      const light = new THREE.PointLight( 0xffffff, 500000, MAX_BOUNDS );
      light.color.setHSL( h, s, l );
      light.castShadow = true

      if (this.mesh) light.position.set(
        this.mesh.position.x, this.mesh.position.y, this.mesh.position.z
      );

      scene.add( light );

      const lensflare = new Lensflare();
      // lensflare.addElement( new LensflareElement( textureFlare0, 500, 0, light.color ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.2 ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.3 ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.35 ) );
      // lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.4 ) );
      light.add( lensflare );
    }

    addLight( 0.995, 0.5, 0.9 );

    scene.add(new THREE.AmbientLight(0xffffff, 1), pointLight)
  }
}
