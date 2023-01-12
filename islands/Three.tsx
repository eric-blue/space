// import { asset } from "$fresh/runtime.ts";

import * as THREE from "three";
import { useEffect } from "preact/hooks";
import { Star } from "../actors/Star.ts";
import { Planetary } from "../actors/Planetary.ts";
import { SOLAR_MASS, SOLAR_RADIUS } from "../constants.ts";
import { CameraControl } from "../actors/Camera.ts";
import { Clock } from "../actors/Clock.ts";

const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader(new THREE.LoadingManager())

// const imageSrc = asset('/textures/skybox.png');

function init() {
  const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
  if (!canvas) return;

  // const cursor = { x: 0, y: 0 }
  // addEventListener('mousemove', (e) => {
  //   cursor.x = e.clientX / sizes.width - 0.5
  //   cursor.y = -(e.clientY / sizes.height - 0.5)
  // })

  const clock = new Clock();
  // @ts-expect-error
  window.CLOCK = clock;

  const cameraControl = new CameraControl({canvas})
  // const texture = textureLoader.load(imageSrc)

  const particlesGeometry = new THREE.BufferGeometry()
  const count = 50000
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100
  }

  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      size: 0.02,
      alphaTest: 0.001,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  )
  scene.add(particles)

  const star = new Star({
    clock,
    radius: SOLAR_RADIUS,
    mass: SOLAR_MASS,
  })
  star.spawn(scene);

  const mars = new Planetary({
    clock,
    type: "planet",
    radius: 3389500, // Mars standard
    mass: 6.39e23, // Mars standard
    gravityWellMass: 1.989e30, // Sun standard,
    orbitalRadius: 227939200, // Mars standard,
    orbitalEccentricity: 0.6,
    color: new THREE.Color(0xff0000),
  })
  mars.spawn(scene);

  const group = new THREE.Group()
  const common = {clock, group}
  const planet = new Planetary({
    ...common,
    type: "planet",
    isGroupAnchor: true,
    radius: 6371000, // Earth standard,
    mass: 5.972e24, // Earth standard,
    gravityWellMass: 1.989e30, // Sun standard,
    orbitalRadius: 149598023, // Earth standard,
    orbitalEccentricity: 0.3, // Earth standard,
    color: new THREE.Color(0x00ff00),
  })
  planet.spawn(scene);

  const moon = new Planetary({
    ...common,
    type: "moon",
    gravityWellMass: 5.972e24, // Earth standard,
    radius: 1737100, // Moon standard,
    mass: 7.348E22, // Moon standard,
    orbitalRadius: 184400000, // Moon standard,
    orbitalEccentricity: 0.6, // Moon standard,
    color: new THREE.Color(0xaaaaaa),
  })
  moon.spawn(scene);

  // const moon2 = new Planetary({
  //   ...common,
  //   type: "moon",
  //   gravityWellMass: 5.972e24, // Earth standard,
  //   radius: 1737100, // Moon standard,
  //   mass: 7.34767309e25, // Moon standard,
  //   orbitalRadius: 184400000, // Moon standard,
  //   orbitalEccentricity: 0.6, // Moon standard,
  //   color: new THREE.Color(0xaaaaaa),
  // })
  // moon2.spawn(scene);

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(800, 800, 1000, 1000),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x292929),
      wireframe: true,
      transparent: true,
      wireframeLinewidth: 0.5,
      opacity: 0.25,
    })
  )
  plane.rotation.x = -Math.PI * 0.5
  plane.position.y = -3
  plane.receiveShadow = true
  scene.add(plane)

  scene.fog = new THREE.Fog(0x292929, 10, 50)

  const axesHelper = new THREE.AxesHelper(3)
  scene.add(axesHelper)

  let sizes = { width: innerWidth, height: innerHeight }

  addEventListener('resize', () => {
    sizes = { width: innerWidth, height: innerHeight }
    cameraControl.camera.aspect = sizes.width / sizes.height
    cameraControl.camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  })

  addEventListener('dblclick', () => {
    // @ts-expect-error: safari needs an adult
    const full = document.fullscreenElement || document.webkitFullscreenElement
    // @ts-expect-error: safari needs an adult
    if (!full) canvas.requestFullscreen?.() || canvas.webkitRequestFullscreen()
    // @ts-expect-error: safari needs an adult
    else document.exitFullscreen?.() ?? document.webkitExitFullscreen
  })

  const renderer = new THREE.WebGLRenderer({canvas})
  renderer.setSize(sizes.width, sizes.height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor(0x292929)

  const tick = () => {
    const elapsed = clock.getElapsedTime()

    cameraControl.controls.update()
    mars.update()
    planet.update()
    moon.update()
    // moon2.update()


    // planet?.mesh ? planet.mesh.rotation.y = 0.8 * elapsed : null;
    // moon?.mesh.rotation.y = 0.015 * elapsed
    // group.rotation.y = 5 * elapsed
    // star.mesh.rotation.y = 0.01 * elapsed
    particles.rotation.y = -0.01 * elapsed

    cameraControl.setCameraFocus(planet.mesh)

    requestAnimationFrame(tick);

    renderer.render(scene, cameraControl.camera);
  }

  tick()
}

export default function HelloCruelWorld() {
  useEffect(() => { init() }, [])

  return <canvas class="webgl" style={{backgroundColor: "#292929"}}/>
}
