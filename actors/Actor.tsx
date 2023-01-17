import * as THREE from "three";

import { G, SOLAR_DIAMETER } from "../constants.ts";
import { Clock } from "./Clock.ts";

const π = Math.PI;

export type ActorType = "star" | "planet" | "moon" | "asteroid" | "ship";

export interface ActorParams {
  clock: Clock;
  textureLoader: THREE.TextureLoader;

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
}

export class Actor {
  params: ActorParams;
  mesh?: THREE.Mesh;
  group?: THREE.Group;

  orbitalPeriod?: number;

  lastOrbitalRadius?: number;
  lastOrbitalEccentricity?: number;
  lastOrbitalInclination?: number;
  lastX?: number;
  lastY?: number;
  lastZ?: number;

  acceleration: number;
  isNavigating: boolean;
  elapsedWhileNavigating: number;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, params: ActorParams) {
    this.params = params;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = params.type ?? "actor";
    this.group = params.group;

    this.orbitalPeriod = 0;
    this.lastOrbitalRadius = params.orbitalRadius;
    this.lastOrbitalEccentricity = params.orbitalEccentricity;
    this.lastOrbitalInclination = params.orbitalInclination;

    this.lastX;
    this.lastY;
    this.lastZ;

    this.acceleration = 0;
    this.isNavigating = false;
    this.elapsedWhileNavigating = 0;

    this.setOrbitalPeriod();
  }

  spawn(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to spawn");
    if (!this.group) scene.add(this.mesh);
    else {
      this.group.add(this.mesh);
      if (this.params.isGroupAnchor) scene.add(this.group);
    }

    this.update();
  }

  update(params?: Partial<Omit<ActorParams, 'clock'>>) {
    this.params = {...this.params, ...params};
    const { clock } = this.params;
    const elapsed = clock.getElapsedTime();

    this.setSpeed()
    this.setPosition(elapsed);
  }

  destroy(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to destroy");
    this.mesh.geometry.dispose();
    scene.remove(this.mesh);
    this.mesh.removeFromParent();
    this.mesh = undefined;

    // maybe spawn wreckage? if ship, else spawn resources?
  }

  setPosition(elapsed: number) { // on every frame
    const {
      orbitalRadius: major = 0,
      orbitalEccentricity: e = 0,
      orbitalInclination: inclination = 0.00001,
      isGroupAnchor,
    } = this.params;

    let x, y, z;

    if (major && e !== undefined && this.orbitalPeriod && this.mesh) {
      const minor = major * Math.sqrt(1 - Math.pow(e, 2));
      const angularVelocity = ((2 * π) / this.orbitalPeriod);
      const meanAnomaly = angularVelocity * elapsed;
      const eccentricAnomaly = this.getEccentricAnomaly(meanAnomaly, meanAnomaly);
      const inclinationInRadians = inclination * (π / 180);

      x = normalizeSolTo3(major * (Math.cos(eccentricAnomaly) - e));
      y = normalizeSolTo3(minor * Math.sin(eccentricAnomaly) * Math.sin(inclinationInRadians));
      z = normalizeSolTo3(minor * Math.sin(eccentricAnomaly) * Math.cos(inclinationInRadians));

      const finalPosition = new THREE.Vector3(x, y, z);

      if (this.acceleration && (
        major !== this.lastOrbitalRadius ||
        e !== this.lastOrbitalEccentricity ||
        inclination !== this.lastOrbitalInclination
      )) {
        this.isNavigating = true;

        const {distanceInThree: distance, distanceInSol} = this.getDistanceBetweenPositions(
          this.mesh.position,
          finalPosition
        );

        const transitionDuration = Math.abs(distanceInSol / this.acceleration) // speed in m/s
        const ratio = this.elapsedWhileNavigating / transitionDuration;
        const t = Math.min(1, ratio);

        if (this.lastX !== undefined && this.lastY !== undefined && this.lastZ !== undefined) {
          // TODO: add interpolation between current orbital arc and new orbital arc rather than just falling into place
          // need to target a future point in the new orbit based on projected time to reach it
          x = lerp(this.lastX, x, t);
          y = lerp(this.lastY, y, t);
          z = lerp(this.lastZ, z, t);
        }

        this.mesh.lookAt(finalPosition);

        this.elapsedWhileNavigating += elapsed;

        if (distance < 1) {
          this.isNavigating = false;
          this.elapsedWhileNavigating = 0;
        }

        this.lastX = x; this.lastY = y; this.lastZ = z;
      }

      if (!this.isNavigating) {
        // Update the last orbital parameters
        this.lastOrbitalRadius = major;
        this.lastOrbitalEccentricity = e;
        this.lastOrbitalInclination = inclination;

      }

      const target = isGroupAnchor && this.group ? this.group : this.mesh;
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
    // todo, targetVelocity should be based on the distance to the target

    if (this.mesh?.name === "ship" && energyOutput && exhaustVelocity) {
      let thrust;
      if (currentVelocity > targetVelocity) {
        thrust = -energyOutput / exhaustVelocity; // negative value for deceleration
      } else {
        thrust = energyOutput / exhaustVelocity;
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

    if (e === undefined || !this.orbitalPeriod) return 0;
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
      distanceInSol: normalize3ToSol(distance)
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
