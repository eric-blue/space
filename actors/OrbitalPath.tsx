import * as THREE from "three";
import { Actor, normalizeSolTo3 } from "./Actor.tsx";

const π = Math.PI;
const radialPoints = 361 * 20; // one more to close the loop

interface Params {
  color?: THREE.Color;
  visible?: boolean;
}

// deno-lint-ignore no-empty-interface
interface Config extends ReturnType<InstanceType<typeof Actor>['calculatePosition']> {}

export class OrbitalPath {
  params?: Params;

  line: THREE.Line;
  path: Float32Array;
  pathAttribute: THREE.Float32BufferAttribute;

  constructor(params?: Params) {
    this.params = params ?? {};

    this.line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: this.params?.color ?? 0x424242,
        transparent: true,
        opacity: 0.5,
        depthWrite: true,
        fog: false,
      }),
    );
    this.line.visible = this.params?.visible ?? true,
    this.line.name = "orbital path";

    this.path = new Float32Array(radialPoints * 3);
    this.pathAttribute = new THREE.Float32BufferAttribute(this.path, 3);
  }

  spawn(config: Config) {
    this.draw(config);
  }

  destroy() {
    this.line.geometry.dispose();
  }

  draw({inclination, major, minor, centralBody}: Config) {
    if (major) {
      const inclinationInRadians = inclination * (π / 180);
      const radiusX = normalizeSolTo3(major);
      const radiusY = normalizeSolTo3(minor);

      for (let i = 0; i < radialPoints; i++) {
        const theta = (i * Math.PI) / 180 / 20;
        const x = centralBody.x + radiusX * Math.cos(theta);
        const y = centralBody.y + radiusY * Math.sin(theta) * Math.sin(inclinationInRadians);
        const z = centralBody.z + radiusY * Math.sin(theta) * Math.cos(inclinationInRadians);
        this.pathAttribute.setXYZ(i, x, y, z);
      }

      this.pathAttribute.needsUpdate = true;
      this.line.geometry.setAttribute("position", this.pathAttribute);
      this.line.geometry.computeBoundingSphere();
    }
  }

  duplicate(orbitalPath: OrbitalPath) {
    this.path.set(orbitalPath.path);
    this.pathAttribute.copy(orbitalPath.pathAttribute);
    this.pathAttribute.needsUpdate = true;
    this.line.geometry.setAttribute("position", this.pathAttribute);
    this.line.geometry.computeBoundingSphere();
  }
}
