import * as THREE from "three";
import { useEffect } from "preact/hooks";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Two options for Fleet Engagements
  // - snapshot and overlay to find collisions
  // - physics engine => import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat'; https://rapier.rs/docs/user_guides/javascript/getting_started_js

import { CameraControl } from "../actors/Camera.ts";
import { Clock } from "../actors/Clock.ts";
import { HeadsUPDisplay } from "../actors/HUD.tsx";
import { Skybox } from "../actors/Skybox.ts";
import { Ship } from "../actors/Ship.ts";

import { sol as starSystemData } from "../db/sol.ts"; // should be dynamic based on scenario
import { MAX_BOUNDS, SOLAR_DIAMETER } from "../constants.ts";
import { Renderer } from "../actors/Renderer.tsx";
import { Mouse } from "../actors/Mouse.ts";
import { System } from "../actors/StarSystem.tsx";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x292929, 0.01*SOLAR_DIAMETER, MAX_BOUNDS/500);

const textureLoader = new THREE.TextureLoader(new THREE.LoadingManager());
const gltfLoader = new GLTFLoader();

function init() {
  const canvas = document.querySelector<HTMLCanvasElement>('.webgl');
  if (!canvas) return;

  const cameraControl = new CameraControl({canvas})
  const clock = new Clock();

  const mouse = new Mouse({cameraControl});

  const HUD = new HeadsUPDisplay({cameraControl, clock});
  // HUD.spawn(); idk

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
    exhaustVelocity: 10000, // m/s
    orbitalOffset: 1000000,
    gravityWellMass: 1.989e30, // Sun standard, todo: this should be detected by closest planetary/satellite
    orbitalRadius: 149598023000 - 20000000, // near Earth,
    orbitalEccentricity: 0.8,
    color: new THREE.Color(0xffff00),
  })
  kolkata.spawn(scene);

  const system = new System({starSystemData, clock, textureLoader});
  system.spawn(scene);

  const {renderer} = new Renderer({canvas});

  requestAnimationFrame(() => {
    system.celestials.find((planet) => planet.params.label === "Earth")?.focus(cameraControl)
    // kolkata.focus(cameraControl)
  })

  const tick = () => {
    const elapsed = clock.getElapsedTime();

    system.update();
    skybox.update();
    kolkata.update();

    cameraControl.update(elapsed);

    const touchableMeshes = [kolkata.mesh, ...system.celestials.map((celestial) => celestial.mesh)];
    mouse.update(touchableMeshes);

    requestAnimationFrame(tick);

    renderer.render(scene, cameraControl.camera);
  }

  tick()
}

export default function HelloCruelWorld() {
  useEffect(() => { init() }, [])

  return <canvas class="webgl" style={{backgroundColor: "#292929"}} draggable={true}/>
}

