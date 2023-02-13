import * as THREE from "three";
import { MAX_BOUNDS, SOLAR_DIAMETER } from "../constants.ts";

const particlesGeometry = new THREE.BufferGeometry()
const count = 50000
const positions = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 50000 * SOLAR_DIAMETER
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

export class Skybox {
  particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhongMaterial>;

  constructor() {
    this.particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        size: SOLAR_DIAMETER,
        alphaTest: 0.001,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(MAX_BOUNDS, MAX_BOUNDS, 2000, 2000),
      new THREE.MeshPhongMaterial({
        color: 0x424242,
        wireframe: true,
        wireframeLinewidth: 1,
      })
    )

    this.plane.rotation.x = -Math.PI * 0.5
    this.plane.position.y = SOLAR_DIAMETER
  }

  spawn(scene: THREE.Scene) {
    scene.add(this.particles, this.plane)
  }

  update() {
    this.particles.rotation.y += 0.000005
  }
}

