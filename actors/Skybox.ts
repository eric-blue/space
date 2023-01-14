import * as THREE from "three";

const particlesGeometry = new THREE.BufferGeometry()
const count = 50000
const positions = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 1000
}
particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
)

export class Skybox {
  particles: THREE.Points<THREE.BufferGeometry,THREE.PointsMaterial>;
  constructor() {
    this.particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        size: 0.02,
        alphaTest: 0.001,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    )
  }

  spawn(scene: THREE.Scene) {
    scene.add(this.particles)
  }

  update() {
    this.particles.rotation.y -= 0.0005
  }
}

