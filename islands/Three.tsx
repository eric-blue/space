// import { asset } from "$fresh/runtime.ts";

import * as THREE from "three";
import { useEffect } from "preact/hooks";
import { Star } from "../actors/Star.ts";
import { Planetary } from "../actors/Planetary.ts";
import { SOLAR_MASS, SOLAR_RADIUS } from "../constants.ts";
import { CameraControl } from "../actors/Camera.ts";
import { Clock } from "../actors/Clock.ts";
import { Skybox } from "../actors/Skybox.ts";
import { Ship } from "../actors/Ship.ts";
import { _Params } from "../actors/_.tsx";
import { sol } from "../db/sol.ts";

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x292929, 10, 20)
const textureLoader = new THREE.TextureLoader(new THREE.LoadingManager())

// const imageSrc = asset('/textures/skybox.png');

export interface OrbitalMember extends Omit<_Params, 'clock'|'color'> {
  color?: string
}
export type OrbitalGroup = OrbitalMember | OrbitalMember[] | OrbitalGroup[]
export type StarSystem = (Omit<Star['params'], 'clock'>|OrbitalGroup)[]

function init() {
  const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
  if (!canvas) return;

  // const cursor = { x: 0, y: 0 }
  // addEventListener('mousemove', (e) => {
  //   cursor.x = e.clientX / sizes.width - 0.5
  //   cursor.y = -(e.clientY / sizes.height - 0.5)
  // })

  const cameraControl = new CameraControl({canvas})
  const clock = new Clock();
  // @ts-expect-error
  window.CLOCK = clock;

  // const texture = textureLoader.load(imageSrc)

  const skybox = new Skybox;
  skybox.spawn(scene);

  const system: Star[] = []
  sol.map((celestial) => {
    if ("type" in celestial) system.push(new Star({clock, ...celestial, color: new THREE.Color(celestial.color)}))
  })
  system?.forEach((celestial) => celestial.spawn(scene))

  // const star = new Star({
  //   clock,
  //   radius: SOLAR_RADIUS,
  //   mass: SOLAR_MASS,
  // })
  // star.spawn(scene);

  // const mars = new Planetary({
  //   clock,
  //   type: "planet",
  //   radius: 3389500, // Mars standard
  //   mass: 6.39e23, // Mars standard
  //   gravityWellMass: 1.989e30, // Sun standard,
  //   orbitalRadius: 227939200000, // Mars standard,
  //   orbitalEccentricity: 0.6,
  //   color: new THREE.Color(0xff0000),
  // })
  // mars.spawn(scene);

  // const group = new THREE.Group()
  // const common = {clock, group}
  // const earth = new Planetary({
  //   ...common,
  //   type: "planet",
  //   isGroupAnchor: true,
  //   radius: 6371000, // Earth standard,
  //   mass: 5.972e24, // Earth standard,
  //   gravityWellMass: 1.989e30, // Sun standard,
  //   orbitalRadius: 149598023000, // Earth standard,
  //   orbitalEccentricity: 0.3, // Earth standard,
  //   color: new THREE.Color(0x00ff00),
  // })
  // earth.spawn(scene);

  // const moon = new Planetary({
  //   ...common,
  //   type: "moon",
  //   gravityWellMass: 5.972e24, // Earth standard,
  //   radius: 1737100, // Moon standard,
  //   mass: 7.348E22, // Moon standard,
  //   orbitalRadius: 184400000, // Moon standard,
  //   orbitalEccentricity: 0.6, // Moon standard,
  //   color: new THREE.Color(0xaaaaaa),
  // })
  // moon.spawn(scene);

  // const moon2 = new Planetary({
  //   ...common,
  //   type: "moon",
  //   gravityWellMass: 5.972e24, // Earth standard,
  //   radius: 1737100, // Moon standard,
  //   mass: 7.34767309e25, // Moon standard,
  //   orbitalRadius: 384400000, // Moon standard,
  //   orbitalEccentricity: 0.6, // Moon standard,
  //   color: new THREE.Color(0xffff00),
  // })
  // moon2.spawn(scene);

  const ship1 = new Ship({
    clock,
    type: "ship",
    width: 682,
    height: 682,
    depth: 2406,
    radius: 682/2,
    mass: 24000000000,
    energyOutput: 1e16, // joules
    exhaustVelocity: 100000, // m/s
    gravityWellMass: 1.989e30, // Sun standard,
    orbitalRadius: 14959802300*2, // Earth standard,
    orbitalEccentricity: 0.8,
    color: new THREE.Color(0xffff00),
  })
  ship1.spawn(scene);

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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x292929)

  cameraControl.setCameraFocus(ship1.mesh)

  // // @ts-expect-error
  // window.CAMERACONTROL = {
  //   earth: () => cameraControl.setCameraFocus(earth.mesh),
  //   moon: () => cameraControl.setCameraFocus(moon.mesh),
  //   mars: () => cameraControl.setCameraFocus(mars.mesh),
  //   star: () => cameraControl.setCameraFocus(star.mesh),
  //   ship: () => cameraControl.setCameraFocus(ship1.mesh),
  //   navigate: () => ship1.navigate()
  // }

  const tick = () => {
    const elapsed = clock.getElapsedTime()

    // mars.update()
    // earth.update()
    // moon.update()
    // moon2.update()
    skybox.update()
    ship1.update()

    cameraControl.update(elapsed)

    // planet?.mesh ? planet.mesh.rotation.y = 0.8 * elapsed : null;
    // moon?.mesh.rotation.y = 0.015 * elapsed
    // group.rotation.y = 5 * elapsed
    // star.mesh.rotation.y = 0.01 * elapsed

    requestAnimationFrame(tick);

    renderer.render(scene, cameraControl.camera);
  }

  tick()
}

export default function HelloCruelWorld() {
  useEffect(() => { init() }, [])

  return <canvas class="webgl" style={{backgroundColor: "#292929"}} draggable={true}/>
}
