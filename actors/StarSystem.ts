import * as THREE from "three";

import type { ActorParams } from "./Actor.ts";
import { Clock } from "./Clock.ts";
import { Planetary } from "./Planetary.ts";
import { Ship } from "./Ship.ts";
import { Star } from "./Star.ts";

export interface OrbitalMember extends Omit<ActorParams, 'scene'|'clock'|'color'|'textureLoader'> {
  color?: string
}
export type OrbitalGroup = OrbitalMember | OrbitalMember[] | OrbitalGroup[]
export type StarSystem = OrbitalGroup[]

interface SystemParams {
  starSystemData: StarSystem;
  scene: THREE.Scene;
  clock: Clock;
  textureLoader: THREE.TextureLoader
}

export class System {
  celestials: (Ship|Star|Planetary)[];

  constructor(params: SystemParams) {
    this.celestials = buildSystem(params.starSystemData, params.scene, params.clock, params.textureLoader);
  }

  spawn() {
    this.celestials.forEach((celestial) => celestial.spawn());
  }

  update() {
    this.celestials.forEach((celestial) => celestial.update());
  }
}

const buildSystem = (data: StarSystem, scene: THREE.Scene, clock: Clock, textureLoader: THREE.TextureLoader) => {
  const system: (Star|Planetary|Ship)[] = [];

  function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  data.forEach((celestial) => {
    if ("type" in celestial) {
      const color = new THREE.Color(celestial.color);
      const params = {scene, clock, textureLoader, ...celestial, color};
      if (celestial.type === "star") system.push(new Star(params));
      else system.push(new Planetary({orbitalOffset: rand(100000, 99999999999999), ...params}));

    } else {
      const group = new THREE.Group();

      (celestial as OrbitalGroup[]).forEach((orbitalMember, i) => {
        if ("type" in orbitalMember) {
          const color = new THREE.Color(orbitalMember.color);
          const params = {group, isGroupAnchor: i === 0 ? true : false, scene, clock, textureLoader, ...orbitalMember, color}

          if (orbitalMember.type === "star") system.push(new Star(params))
          else system.push(new Planetary({orbitalOffset: rand(100000, 99999999), ...params}))
        }
        else {
          // sub orbitalGroup like wreckage/satellites orbiting a moon
        }
      });
    }
  });

  return system;
}
