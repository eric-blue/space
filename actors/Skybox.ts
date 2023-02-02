import * as THREE from "three";

const particlesGeometry = new THREE.BufferGeometry()
const count = 50000
const positions = new Float32Array(count * 3)
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 50000
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

export class Skybox {
  particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhongMaterial>;

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

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000, 2000, 2000),
      new THREE.MeshPhongMaterial({
        // color: new THREE.Color(424242),
        color: new THREE.Color(0x424242),
        wireframe: true,
        wireframeLinewidth: 1,
      })
    )

    this.plane.rotation.x = -Math.PI * 0.5
    this.plane.position.y = -3
  }

  spawn(scene: THREE.Scene) {
    scene.add(this.particles, this.plane)
  }

  update() {
    this.particles.rotation.y += 0.0005
  }
}

