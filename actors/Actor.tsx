import { asset } from "$fresh/runtime.ts";

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { G, SOLAR_DIAMETER } from "../constants.ts";
import { Clock } from "./Clock.ts";
import { OrbitalPath } from "./OrbitalPath.tsx";

const π = Math.PI;
const radialPoints = 361 * 20; // one more to close the loop

export type ActorType = "star" | "planet" | "moon" | "asteroid" | "ship";

export interface ActorParams {
  clock: Clock;
  textureLoader?: THREE.TextureLoader;
  gltfLoader?: GLTFLoader;

  group?: THREE.Group;
  isGroupAnchor?: boolean;

  type: ActorType;
  label: string;

  /** in kilograms */
  mass: number;

  energyOutput?: number; // joules
  exhaustVelocity?: number; // m/s

  gravityWellMass?: number;

  /** in meters */
  radius: number;

  /**
   * in meters.
   * semi-major axis, orbital radius as it's widest
   * distance from the center of the orbit to the object
   */
  orbitalRadius?: number;
  /** degrees from the ecliptic */
  orbitalInclination?: number;
  /**
   * eccentricity of the orbit, a value between 0 and 1
   * where 0 is a perfect circle and 1 is a parabola
   * example: Mars has an eccentricity of 0.0934
   */
  orbitalEccentricity?: number;

  // axialTilt?: number;
  // axialRotation?: number;

  spinRate?: number; // todo

  clickable?: boolean;
}

export enum ActorStatus {
  STABLE = "stable",
  ACCELERATING = "accelerating",
  DECELERATING = "decelerating",
  DESTROYED = "destroyed",
}

export class Actor<
  T = Record<string | number | symbol, never>
> extends THREE.EventDispatcher {
  params: ActorParams;
  mesh?: THREE.Mesh;
  group?: THREE.Group;

  status: ActorStatus;

  currentOrbital: OrbitalPath;
  pastOrbital: OrbitalPath;

  trajectory: THREE.Line;

  orbitalPeriod?: number;

  lastOrbitalRadius?: number;
  lastOrbitalEccentricity?: number;
  lastOrbitalInclination?: number;
  lastX?: number;
  lastY?: number;
  lastZ?: number;

  acceleration: number;
  elapsedWhileNavigating: number;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, params: ActorParams & T) {
    super()
    this.params = params;
    this.status = ActorStatus.STABLE;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = params.type ?? "actor";

    this.group = params.group;

    this.currentOrbital = new OrbitalPath;
    this.pastOrbital = new OrbitalPath({
      color: new THREE.Color(0xffff00),
      visible: false,
    });

    this.trajectory = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({color: 0xffffff})
    );

    this.orbitalPeriod = 0;
    this.lastOrbitalRadius = params.orbitalRadius;
    this.lastOrbitalEccentricity = params.orbitalEccentricity;
    this.lastOrbitalInclination = params.orbitalInclination ?? 0.00001; // so low that it's basically 0

    this.lastX;
    this.lastY;
    this.lastZ;

    this.acceleration = 0;
    this.elapsedWhileNavigating = 0;

    this.setOrbitalPeriod();
  }

  spawn(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to spawn");
    const orbitals = [this.currentOrbital.line, this.pastOrbital.line, this.trajectory];

    if (!this.group) scene.add(this.mesh, ...orbitals);
    else {
      this.group.add(this.mesh);
      if (this.params.isGroupAnchor) scene.add(this.group, ...orbitals);
      else scene.add(...orbitals);
    }

    // this.params.gltfLoader?.load(
    //   asset('/models/opensourceasset.gltf'),
    //   (gltf) =>
    //   {
    //     // gltf.scene.scale.set(0.025, 0.025, 0.025)
    //     scene.add(gltf.scene)
    //   }
    // )

    // todo: spawn actor at specific degree of orbit rather than at 0

    this.update();
  }

  update(params?: Partial<Omit<ActorParams, 'clock'>>) {
    this.params = {...this.params, ...params};
    const { clock } = this.params;

    if (params) console.log(params)

    if (params && this.params.orbitalRadius !== params.orbitalRadius) this.setOrbitalPeriod();
    this.setSpeed()
    if (this.mesh?.name === "ship") this.drawOrbitalPath(clock);
    this.setPosition(clock);
  }

  destroy(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to destroy");
    this.mesh.geometry.dispose();
    this.currentOrbital.destroy();
    this.pastOrbital.destroy();

    scene.remove(this.mesh);
    this.mesh.removeFromParent();
    this.mesh = undefined;
    this.status = ActorStatus.DESTROYED;

    // maybe spawn wreckage? if ship, else spawn resources?
  }

  calculatePosition(elapsed = 1) {
    const {
      orbitalRadius: major = 0,
      orbitalEccentricity: e = 0,
      orbitalInclination: inclination = 0.00001, // so low that it's basically 0
      isGroupAnchor,
    } = this.params;
    const zero = new THREE.Vector3(0, 0, 0);
    const centralBody = !isGroupAnchor ? this.group?.position ?? zero : zero;
    const isNavigating = Boolean(this.acceleration && (
      major !== this.lastOrbitalRadius ||
      e !== this.lastOrbitalEccentricity ||
      inclination !== this.lastOrbitalInclination
    ))

    if (major && e !== undefined) {
      const minor = major * Math.sqrt(1 - Math.pow(e, 2));
      const meanAnomaly = this.getAngularVelocity() * elapsed / this.params.clock.timeScale;
      const eccentricAnomaly = this.getEccentricAnomaly(meanAnomaly, meanAnomaly);
      const inclinationInRadians = inclination * (π / 180);

      return {
        // x: normalizeSolTo3(major * (Math.cos(eccentricAnomaly) - e)), // removing e makes it just work (still an ellipse)
        x: normalizeSolTo3(major * (Math.cos(eccentricAnomaly))),
        y: normalizeSolTo3(minor * Math.sin(eccentricAnomaly) * Math.sin(inclinationInRadians)),
        z: normalizeSolTo3(minor * Math.sin(eccentricAnomaly) * Math.cos(inclinationInRadians)),
        major, minor, eccentricity: e, inclination, centralBody, isNavigating
      }
    }

    return {x: 0, y: 0, z: 0, major, minor: 0, eccentricity: e, inclination, centralBody, isNavigating};
  }

  setPosition(clock: Clock) { // on every frame
    let x, y, z;
    const elapsed = clock.getElapsedTime();

    if (this.mesh) {
      const {major, eccentricity, inclination, ...position} = this.calculatePosition(elapsed);
      x = position.x;
      y = position.y;
      z = position.z;

      const finalPosition = new THREE.Vector3(x, y, z);

      if (this.acceleration && (
        major !== this.lastOrbitalRadius ||
        eccentricity !== this.lastOrbitalEccentricity ||
        inclination !== this.lastOrbitalInclination
      )) {
        const {distanceInSol} = this.getDistanceBetweenPositions(
          this.mesh.position,
          finalPosition
        );

        if (this.lastX !== undefined && this.lastY !== undefined && this.lastZ !== undefined) {
          const duration = Math.abs(distanceInSol / this.acceleration); // speed in m/s
          const t = Math.min(1, this.elapsedWhileNavigating / duration);
          const deltaT = duration * t;
          const {x: futureX, y: futureY, z: futureZ} = this.calculatePosition(elapsed + deltaT);

          this.drawTrajectory(
            new THREE.Vector3(this.lastX, this.lastY, this.lastZ),
            new THREE.Vector3(futureX, futureY, futureZ)
          );

          if (clock.running()) {
            x = lerp(this.lastX, futureX, t);
            y = lerp(this.lastY, futureY, t);
            z = lerp(this.lastZ, futureZ, t);
          }
        }

        this.mesh.lookAt(finalPosition);

        this.elapsedWhileNavigating += elapsed;

        if (distanceInSol <= 0) {
          console.log('done navigating');
          // Update the last orbital parameters
          this.elapsedWhileNavigating = 0;
          this.lastOrbitalRadius = major;
          this.lastOrbitalEccentricity = eccentricity;
          this.lastOrbitalInclination = inclination;
          this.scrapTrajectory();
        }
      }

      this.lastX = x; this.lastY = y; this.lastZ = z;
      const target = this.params.isGroupAnchor && this.group ? this.group : this.mesh;
      target?.position.set(x, y, z);
    }

    // @ts-ignore debug
    if (!window.MAXPOSITION || window.MAXPOSITION < Math.abs(x)) window.MAXPOSITION = Math.abs(x);
  }

  // in seconds
  setOrbitalPeriod() {
    const { gravityWellMass, orbitalRadius: semiMajorAxis } = this.params;
    const μ = G * (gravityWellMass ?? 0);
    if (semiMajorAxis) {
      this.orbitalPeriod = 2 * π * Math.sqrt(Math.pow(semiMajorAxis, 3) / μ);
    }
  }

  setSpeed() {
    const {mass, orbitalRadius = 0, energyOutput, exhaustVelocity} = this.params;

    const currentVelocity = this.getAngularVelocity() * orbitalRadius; // m/s
    const targetVelocity = currentVelocity; // m/s

    // if (this.targetDistance) {
    //   const a = (2 * this.targetDistance) / (this.startTime - this.endTime);
    //   targetVelocity = Math.sqrt(a * orbitalRadius);
    // }

    if (this.mesh?.name === "ship" && energyOutput && exhaustVelocity) {
      let thrust = 0;

      if (this.mesh?.name === "ship" && energyOutput && exhaustVelocity) {
        if (currentVelocity > targetVelocity) {
          thrust = -energyOutput / exhaustVelocity; // negative value for deceleration
          this.status = ActorStatus.DECELERATING;
        // } else if (currentVelocity < targetVelocity) {
        } else {
          thrust = energyOutput / exhaustVelocity;
          this.status = ActorStatus.ACCELERATING;
        // } else {
          // this.status = ActorStatus.STABLE;
        }
      }

      this.acceleration = thrust / mass; // m/s^2
    } else {
      this.acceleration = 0; // TODO non-ship object via collision force
    }
  }

  // radians/second
  getAngularVelocity() {
    return this.orbitalPeriod ? 2 * π / this.orbitalPeriod : 0;
  }

  /**
   * A recursive function to calculate the eccentric anomaly
   * @param E a guess at the eccentric anomaly
   * @returns the eccentric anomaly
   */
  getEccentricAnomaly(E: number, M: number): number {
    const tolerance = 1e-6;
    const { orbitalEccentricity: e = 0 } = this.params;

    if (e === undefined) return 0;
    const ENew = E + (M + e*Math.sin(E) - E)/(1 - e * Math.cos(E));

    return (Math.abs(ENew - E) > tolerance)
      ? this.getEccentricAnomaly(ENew, M)
      : ENew;
  }

  getLagrangePoints(secondaryBody: Actor) {
    const { mass: m1 } = this.params;
    const { mass: m2 } = secondaryBody.params;
    if (m1 && m2) {
      const a = (m2 / (3 * m1)) ** (1/3);
      const b = (m1 / (3 * m2)) ** (1/3);
      return {
        L1: a - b,
        L2: -a - b,
        L3: a + b,
        L4: -a + b
      };
    }
    return { L1: 0, L2: 0, L3: 0, L4: 0 };
  }

  getDistanceBetweenPositions(position1: THREE.Vector3, position2: THREE.Vector3) {
    const { x: x1, y: y1, z: z1 } = position1;
    const { x: x2, y: y2, z: z2 } = position2;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    return {
      distanceInThree: distance,
      distanceInSol: normalize3ToSol(distance),
    };
  }

  /** returns collision force in newtons */
  getCollisionForcePotential(opponent: Actor) {
    // this doesnt take into account real world units
    // const { mass: m1 } = this.params;
    // const { mass: m2 } = opponent.params;
    // if (m1 && m2 && this.mesh && opponent.mesh) {
    //   const { x: x1, y: y1, z: z1 } = this.mesh.position;
    //   const { x: x2, y: y2, z: z2 } = opponent.mesh.position;
    //   const distance = getDistanceBetweenPositions(this.mesh.position, opponent.mesh.position); need to convert to SOL UNITS
    //   const force = G * m1 * m2 / Math.pow(distance, 2);
    //   const forceX = force * (x2 - x1) / distance;
    //   const forceY = force * (y2 - y1) / distance;
    //   const forceZ = force * (z2 - z1) / distance;
    //   return { force, forceX, forceY, forceZ };
    // }
    // return { force: 0, forceX: 0, forceY: 0, forceZ: 0 };
  }

  drawTrajectory(start: THREE.Vector3, end: THREE.Vector3) {
    const curve = new THREE.CatmullRomCurve3([start, end]);
    const points = curve.getPoints(50);
    this.trajectory.geometry.setFromPoints(points);
    this.trajectory.visible = true;
  }

  scrapTrajectory() {
    // this.trajectory.geometry.setFromPoints([]);
    this.trajectory.visible = false;
  }

  drawOrbitalPath(clock: Clock) {
    const elapsed = clock.getElapsedTime();
    const { isNavigating } = this.calculatePosition(elapsed);

    if (isNavigating) {
      if (this.pastOrbital.line.visible !== true) {
        this.pastOrbital.duplicate(this.currentOrbital);
        this.pastOrbital.line.visible = true;
      }
    } else {
      this.pastOrbital.line.visible = false;
    }

    this.currentOrbital.draw(this.calculatePosition(1));
  }
}

/**
 * takes in a realworld measurement in meters and converts to
 * game logic where 1 unit = 1 solar radius
 * @example
 * normalizeSolTo3(695700000) // 1
 */
export function normalizeSolTo3(unit: number) {
  return unit / SOLAR_DIAMETER;
}

/**
 * takes in a game logic measurement in solar radii and converts to
 * realworld meters
 * @example
 * normalize3ToSol(1) // 695700000
 */
export function normalize3ToSol(unit: number) {
  return unit * SOLAR_DIAMETER;
}

const lerp = (start: number, end: number, t: number) => (1 - t) * start + t * end;
