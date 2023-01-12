import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const cameraOffset = new THREE.Vector3(0, 1, -3);

interface CameraControlParams {
  canvas: HTMLCanvasElement | null;
}

export class CameraControl {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;

  constructor(params: CameraControlParams) {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.controls = new OrbitControls(this.camera, params.canvas as HTMLElement)
    this.controls.enableDamping = true
  }

  setCameraFocus(mesh?: THREE.Mesh) {
    const objectPosition = new THREE.Vector3();
    mesh?.getWorldPosition(objectPosition);

    this.camera.position.copy(objectPosition).add(cameraOffset);
    this.controls.target = objectPosition
  }
}
