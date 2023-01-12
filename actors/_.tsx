import * as THREE from "three";
import { G, SOLAR_RADIUS } from "../constants.ts";
import { Clock } from "./Clock.ts";

const π = Math.PI;

export interface _Params {
  clock: Clock;
  group?: THREE.Group;
  isGroupAnchor?: boolean;

  type?: "star" | "planet" | "moon";

  /** in kilograms */
  mass: number;
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

  relativeVelocity?: number;

  // axialTilt?: number;
  // axialRotation?: number;

  spin?: number;
}

export class _ {
  params: _Params;
  mesh?: THREE.Mesh;
  group?: THREE.Group;
  orbitalPeriod?: number;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, params: _Params) {
    this.params = params;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = params.type ?? "actor";
    this.group = params.group;

    this.orbitalPeriod = this.setOrbitalPeriod();
  }

  spawn(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to spawn");
    if (!this.group) scene.add(this.mesh);
    else {
      this.group.add(this.mesh);
      if (this.params.isGroupAnchor) scene.add(this.group);
    }
  }

  update(params?: _Params) {
    this.params = {...this.params, ...params};
    const {
      clock,
      orbitalRadius: major,
      orbitalEccentricity: e,
      isGroupAnchor,
    } = this.params;

    const orbitalPeriod = this.setOrbitalPeriod();
    const elapsed = clock.getElapsedTime();

    if (major && e !== undefined && orbitalPeriod && this.mesh) {
      const minor = major * Math.sqrt(1 - Math.pow(e, 2));
      const meanAnomaly = ((2 * π) / orbitalPeriod) * elapsed;
      const eccentricAnomaly = this.getEccentricAnomaly(meanAnomaly, meanAnomaly);

      if (isGroupAnchor && this.group) {
        this.group.position.set(
          10 * getDerivedRadius(major * (Math.cos(eccentricAnomaly) - e)),
          0,
          10 * getDerivedRadius(minor * Math.sin(eccentricAnomaly)),
        );
        this.group.rotation.y = 0.15 * elapsed; // this shouldn't be necessary :(
      } else if (this.group) {
        this.mesh.position.set(
          getDerivedRadius(major * (Math.cos(eccentricAnomaly) - e)),
          0,
          getDerivedRadius(minor * Math.sin(eccentricAnomaly))
        )
      } else {
        this.mesh.position.set(
          10 * getDerivedRadius(major * (Math.cos(eccentricAnomaly) - e)),
          0,
          10 * getDerivedRadius(minor * Math.sin(eccentricAnomaly)),
        );
      }
    }
  }

  destroy(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to destroy");
    this.mesh.geometry.dispose();
    scene.remove(this.mesh);
    this.mesh = undefined;

    // maybe spawn wreckage? if ship, else spawn resources?
  }

  setOrbitalPeriod() {
    const { gravityWellMass, orbitalRadius } = this.params;
    /** standard gravitational parameter of the central body in meters^3/s^2 */
    const μ = G * (gravityWellMass ?? 0);
    if (orbitalRadius) {
      this.orbitalPeriod = 2 * π * Math.sqrt(Math.pow(orbitalRadius, 3) / μ);
      return this.orbitalPeriod;
    }
  }

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
    const { orbitalEccentricity: e } = this.params;

    if (!e || !this.orbitalPeriod) return 0;
    const ENew = E + (M + e*Math.sin(E) - E)/(1 - e * Math.cos(E));

    return (Math.abs(ENew - E) > tolerance)
      ? this.getEccentricAnomaly(ENew, M)
      : ENew;
  }

  getLagrangePoints() {}

  /** returns collision force in newtons */
  getCollisionForcePotential(opponent: _) {
    const { mass: m1 } = this.params;
    const { mass: m2 } = opponent.params;
    if (m1 && m2 && this.mesh && opponent.mesh) {
      const { x: x1, y: y1, z: z1 } = this.mesh.position;
      const { x: x2, y: y2, z: z2 } = opponent.mesh.position;
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
      const force = G * m1 * m2 / Math.pow(distance, 2);
      const forceX = force * (x2 - x1) / distance;
      const forceY = force * (y2 - y1) / distance;
      const forceZ = force * (z2 - z1) / distance;
      return { force, forceX, forceY, forceZ };
    }
    return { force: 0, forceX: 0, forceY: 0, forceZ: 0 };
  }
}

/**
 * takes in a realworld measurement in meters and converts to
 * game logic where 1 unit = 1 solar radius
 */
export function getDerivedRadius(radius: number) {
  return radius / SOLAR_RADIUS;
}

/**
 * takes in a game logic measurement in solar radii and
 * converts to realworld meters
 */
export function getAppliedRadius(radius: number) {
  return radius * SOLAR_RADIUS;
}

