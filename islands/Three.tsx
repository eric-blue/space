import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// Two options for Fleet Engagements
  // - snapshot and overlay to find collisions
  // - physics engine => import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat'; https://rapier.rs/docs/user_guides/javascript/getting_started_js

import { useEffect } from "preact/hooks";
import { Star } from "../actors/Star.ts";
import { Planetary } from "../actors/Planetary.ts";
import { CameraControl } from "../actors/Camera.ts";
import { Clock } from "../actors/Clock.ts";
import { HeadsUPDisplay } from "../actors/HUD.tsx";
import { Skybox } from "../actors/Skybox.ts";
import { Ship } from "../actors/Ship.ts";
import { ActorParams } from "../actors/Actor.tsx";

import { sol } from "../db/sol.ts";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x292929, 0.01, 3000);

const textureLoader = new THREE.TextureLoader(new THREE.LoadingManager());
const gltfLoader = new GLTFLoader();

export interface OrbitalMember extends Omit<ActorParams, 'clock'|'color'|'textureLoader'> {
  color?: string
}
export type OrbitalGroup = OrbitalMember | OrbitalMember[] | OrbitalGroup[]
export type StarSystem = OrbitalGroup[]

function init() {
  const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
  if (!canvas) return;

  const cameraControl = new CameraControl({canvas})
  // @ts-expect-error clock
  const clock = window.CLOCK = new Clock();

  let sizes = { width: innerWidth, height: innerHeight }

  addEventListener('resize', () => {
    sizes = { width: innerWidth, height: innerHeight }
    cameraControl.camera.aspect = sizes.width / sizes.height
    cameraControl.camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  })

  const raycaster = new THREE.Raycaster();
  let topIntersect: THREE.Mesh|null = null;

  const mouse = new THREE.Vector2();
  addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;
  });

  addEventListener('click', (event) => {
    console.log(topIntersect)
    if (event.shiftKey && topIntersect?.name === "ship") {
      kolkata.navigate()
    }
  })

  const HUD = new HeadsUPDisplay({cameraControl, clock, sizes});
  HUD.spawn();

  const skybox = new Skybox;
  skybox.spawn(scene);

  const kolkata = new Ship({
    clock,
    textureLoader,
    gltfLoader,
    label: "The Kolkata",
    type: "ship",
    width: 682,
    height: 682,
    depth: 2406,
    radius: 682/2,
    mass: 24000000000,
    energyOutput: 1e16, // joules
    // exhaustVelocity: 100000, // m/s
    exhaustVelocity: 1000, // m/s - why is this faster than above?
    gravityWellMass: 1.989e30, // Sun standard, todo: this should be detected by closest planetary/satellite
    orbitalRadius: 149598023000, // Earth standard,
    orbitalEccentricity: 0.8,
    color: new THREE.Color(0xffff00),
    clickable: true,
  })
  kolkata.spawn(scene);

  // @ts-expect-error for make debug good
  window.SYSTEM = {
    [kolkata['params']['label'].replaceAll(" ", "")]: {
      ...kolkata, focus: () => cameraControl.setCameraFocus(kolkata.mesh),
      navigate: () => kolkata.navigate(),
    },
  }

  const system = buildSystem(sol, clock, textureLoader)
  system?.forEach((celestial) => {
    celestial.spawn?.(scene)

    // @ts-expect-error for make debug good
    window.SYSTEM[[celestial['params']['label']]] = {
      ...celestial, focus: () => cameraControl.setCameraFocus(celestial.mesh),
    }
  })

  // addEventListener('dblclick', () => {
  //   // @ts-expect-error: safari needs an adult
  //   const full = document.fullscreenElement || document.webkitFullscreenElement
  //   // @ts-expect-error: safari needs an adult
  //   if (!full) canvas.requestFullscreen?.() || canvas.webkitRequestFullscreen()
  //   // @ts-expect-error: safari needs an adult
  //   else document.exitFullscreen?.() ?? document.webkitExitFullscreen
  // })

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x292929)
  renderer.physicallyCorrectLights = true;
  // renderer.outputEncoding = THREE.sRGBEncoding;

  cameraControl.setCameraFocus(kolkata.mesh)

  const tick = () => {
    const elapsed = clock.getElapsedTime()

    system?.forEach((celestial) => celestial.update())

    skybox.update()
    kolkata.update()

    cameraControl.update(elapsed)

    // planet?.mesh ? planet.mesh.rotation.y = 0.8 * elapsed : null;
    // moon?.mesh.rotation.y = 0.015 * elapsed
    // group.rotation.y = 5 * elapsed
    // star.mesh.rotation.y = 0.01 * elapsed

    raycaster.setFromCamera(mouse, cameraControl.camera);
    const intersects = raycaster.intersectObjects(
      [kolkata.mesh as THREE.Mesh, ...system?.map((celestial) => celestial.mesh as THREE.Mesh)] ?? []
    );
    for (const intersect of intersects) {
      // if (intersect.object.userData.clickable) {
      topIntersect = intersect.object.type === "Mesh" ? intersect.object as THREE.Mesh : null;
    }

    requestAnimationFrame(tick);

    renderer.render(scene, cameraControl.camera);
  }

  tick()
}

export default function HelloCruelWorld() {
  useEffect(() => { init() }, [])

  return <canvas class="webgl" style={{backgroundColor: "#292929"}} draggable={true}/>
}

const buildSystem = (data: StarSystem, clock: Clock, textureLoader: THREE.TextureLoader) => {
  const system: (Star|Planetary|Ship)[] = [];

  data.forEach((celestial) => {
    if ("type" in celestial) {
      const color = new THREE.Color(celestial.color);
      const params = {clock, textureLoader, ...celestial, color};
      if (celestial.type === "star") system.push(new Star(params));
      else system.push(new Planetary(params));

    } else {
      const group = new THREE.Group();

      (celestial as OrbitalGroup[]).forEach((orbitalMember, i) => {
        if ("type" in orbitalMember) {
          const color = new THREE.Color(orbitalMember.color);
          const params = {group, isGroupAnchor: i === 0 ? true : false, clock, textureLoader, ...orbitalMember, color}

          if (orbitalMember.type === "star") system.push(new Star(params))
          else system.push(new Planetary(params))
        }
        else {
          // sub orbitalGroup
        }
      });
    }
  });

  return system;
}
