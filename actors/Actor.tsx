import { asset } from "$fresh/runtime.ts";

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { G, SOLAR_DIAMETER } from "../constants.ts";
import { CameraControl } from "./Camera.ts";
import { Clock } from "./Clock.ts";
import { OrbitalPath } from "./OrbitalPath.tsx";

const π = Math.PI;

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

  /** in milliseconds */
  orbitalOffset?: number;

  axialTilt?: number; // todo
  spinRate?: number; // todo
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
  mesh: THREE.Mesh;
  group?: THREE.Group;

  status: ActorStatus;

  currentOrbital: OrbitalPath;
  pastOrbital: OrbitalPath;

  trajectoryCurve: THREE.CatmullRomCurve3;
  trajectory: THREE.Line;

  orbitalPeriod?: number;

  lastOrbitalRadius?: number;
  lastOrbitalEccentricity?: number;
  lastOrbitalInclination?: number;
  lastPosition: THREE.Vector3;

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

    this.trajectoryCurve = new THREE.CatmullRomCurve3;
    this.trajectory = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({color: 0xffffff, fog: false, linewidth: 100, linecap: 'round'})
    );

    this.orbitalPeriod = 0;
    this.lastOrbitalRadius = params.orbitalRadius;
    this.lastOrbitalEccentricity = params.orbitalEccentricity;
    this.lastOrbitalInclination = params.orbitalInclination ?? 0.00001; // so low that it's basically 0
    this.lastPosition = new THREE.Vector3(0, 0, 0);

    this.acceleration = 0;
    this.elapsedWhileNavigating = 0;

    this.setOrbitalPeriod();
  }

  public spawn(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to spawn");

    const isCentralStar = this.mesh?.name === "star" && this.mesh.position.x + this.mesh.position.y + this.mesh.position.z === 0

    if (isCentralStar) {
      scene.add(this.mesh);
    } else {
      const orbitals = [this.currentOrbital.line, this.pastOrbital.line, this.trajectory];

      if (!this.group) scene.add(this.mesh, ...orbitals);
      else {
        this.group.add(this.mesh);
        if (this.params.isGroupAnchor) scene.add(this.group, ...orbitals);
        else scene.add(...orbitals);
      }
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

  public update(params?: Partial<Omit<ActorParams, 'clock'>>) {
    this.params = {...this.params, ...params};
    const { clock } = this.params;
    if (params && this.params.orbitalRadius !== params.orbitalRadius) this.setOrbitalPeriod();
    this.setSpeed()
    this.setPosition(clock);
    this.drawOrbitalPath(clock);

    // planet?.mesh ? planet.mesh.rotation.y = 0.8 * elapsed : null;
    // moon?.mesh.rotation.y = 0.015 * elapsed
    // group.rotation.y = 5 * elapsed
    // star.mesh.rotation.y = 0.01 * elapsed
  }

  public destroy(scene: THREE.Scene) {
    if (!this.mesh) throw new Error("No mesh to destroy");
    this.mesh.geometry.dispose();

    this.currentOrbital.destroy();
    this.pastOrbital.destroy();

    scene.remove(this.mesh);
    this.mesh.removeFromParent();
    this.status = ActorStatus.DESTROYED;

    // maybe spawn wreckage? if ship, else spawn resources?
  }

  public focus(camera: CameraControl) {
    if (!this.mesh) console.warn(`${this.params.label} couldn't be focused`);
    camera.setCameraFocus(this.mesh)
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
    const navigating = Boolean(this.acceleration && (
      major !== this.lastOrbitalRadius || e !== this.lastOrbitalEccentricity || inclination !== this.lastOrbitalInclination
    ))
    const common = {major, eccentricity: e, inclination, centralBody, navigating}
    /** I'm not sure why this is necessary, but it is. */
    const timeScaleAdjustment = navigating ? this.params.clock.timeScale : 1;

    if (major && e !== undefined) {
      const minor = major * Math.sqrt(1 - Math.pow(e, 2));
      const meanAnomaly = this.getAngularVelocity() * (elapsed + (this.params.orbitalOffset ?? 0)) / timeScaleAdjustment;
      const eccentricAnomaly = this.getEccentricAnomaly(meanAnomaly, meanAnomaly);
      const inclinationInRadians = inclination * (π / 180);

      return {
        ...common,
        // x: major * (Math.cos(eccentricAnomaly) - e)), // removing e makes it just work (still an ellipse)
        x: major * (Math.cos(eccentricAnomaly)),
        y: minor * Math.sin(eccentricAnomaly) * Math.sin(inclinationInRadians),
        z: minor * Math.sin(eccentricAnomaly) * Math.cos(inclinationInRadians),
        minor,
      }
    }

    return {x: 0, y: 0, z: 0, minor: 0, ...common};
  }

  private setPosition(clock: Clock) { // on every frame
    let x, y, z;
    const elapsed = clock.getElapsedTime();

    if (this.mesh) {
      const target = this.params.isGroupAnchor && this.group ? this.group : this.mesh;
      const {major, eccentricity, inclination, navigating, ...position} = this.calculatePosition(elapsed);
      x = position.x;
      y = position.y;
      z = position.z;

      const finalPosition = new THREE.Vector3(x, y, z);

      if (navigating && target.position.x && target.position.y && target.position.z) {
        const {distance, timeLeft} = this.getDistanceBetweenPositions(target.position, finalPosition);

        const t = Math.min(1, this.elapsedWhileNavigating / timeLeft);
        const deltaT = timeLeft * t;
        const {x: futureX, y: futureY, z: futureZ} = this.calculatePosition(elapsed + deltaT);

        // console.log(deltaT)
        // gets within 399 689 759 m before counting up again
        // console.log(x - lerp(target.position.x, futureX, t))

        if (clock.running()) {
          x = lerp(target.position.x, futureX, t);
          y = lerp(target.position.y, futureY, t);
          z = lerp(target.position.z, futureZ, t);
        }

        this.drawTrajectory(
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(futureX, futureY, futureZ)
        );
        this.mesh.lookAt(finalPosition);

        this.elapsedWhileNavigating += elapsed;

        // if (distance < 1) {
        if (distance < SOLAR_DIAMETER*100) {
          console.log('done navigating');
          // Update the last orbital parameters
          this.elapsedWhileNavigating = 0;
          this.lastOrbitalRadius = major;
          this.lastOrbitalEccentricity = eccentricity;
          this.lastOrbitalInclination = inclination;
          this.trajectory.visible = false;
        }
      }

      target.position.set(x, y, z);
    }
  }

  // in seconds
  private setOrbitalPeriod() {
    const { gravityWellMass, orbitalRadius: semiMajorAxis } = this.params;
    const μ = G * (gravityWellMass ?? 0);
    if (semiMajorAxis) {
      this.orbitalPeriod = 2 * π * Math.sqrt(Math.pow(semiMajorAxis, 3) / μ);
    }
  }

  private setSpeed() {
    const {mass, orbitalRadius = 0, energyOutput, exhaustVelocity} = this.params;

    const currentVelocity = this.getAngularVelocity() * orbitalRadius; // m/s
    // temporarily hardcoding target velocity to never be reached
    const targetVelocity = currentVelocity + 1; // m/s

    // if (this.targetDistance) {
    //   const a = (2 * this.targetDistance) / (this.startTime - this.endTime);
    //   targetVelocity = Math.sqrt(a * orbitalRadius);
    // }

    if (this.mesh?.name === "ship") {
      let thrust = 0;

      if (this.mesh?.name === "ship" && energyOutput && exhaustVelocity) {
        if (currentVelocity > targetVelocity) {
          thrust = -energyOutput / exhaustVelocity; // negative value for deceleration
          this.status = ActorStatus.DECELERATING;
        } else if (currentVelocity < targetVelocity) {
          thrust = energyOutput / exhaustVelocity;
          this.status = ActorStatus.ACCELERATING;
        } else {
          this.status = ActorStatus.STABLE;
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
      distance,
      middlePoint: {x: (x1 + x2) / 2, y: (y1 + y2) / 2, z: (z1 + z2) / 2},
      timeLeft: Math.abs(distance / this.acceleration),
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

  private drawTrajectory(start: THREE.Vector3, end: THREE.Vector3) {
    this.trajectoryCurve.points = [start, end];
    this.trajectoryCurve.updateArcLengths();
    const points = this.trajectoryCurve.getPoints(50);
    this.trajectory.geometry.setFromPoints(points);
    this.trajectory.geometry.computeBoundingSphere();
    this.trajectory.visible = true;
  }

  private drawOrbitalPath(clock: Clock) {
    if (
      this.mesh?.name === "star" &&
      /** no orbital drawn for unary systems */
      this.mesh.position.x + this.mesh.position.y + this.mesh.position.z === 0
    ) return;

    const elapsed = clock.getElapsedTime();
    const {navigating} = this.calculatePosition(elapsed);

    if (navigating) {
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

const lerp = (start: number, end: number, t: number) => (1 - t) * start + t * end;
