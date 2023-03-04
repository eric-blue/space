import * as THREE from "three";
import CameraControls from 'camera-controls';
import { MAX_BOUNDS } from "../constants.ts";

CameraControls.install( { THREE: THREE } );

interface CameraControlParams {
  canvas: HTMLCanvasElement | null;
}

export class CameraControl {
  camera: THREE.PerspectiveCamera;
  controls: CameraControls;
  enableTracking: boolean;
  lastTracked: THREE.Mesh | null;
  keyState: { shiftRight: boolean; shiftLeft: boolean; controlRight: boolean; controlLeft: boolean; };

  constructor(params: CameraControlParams) {
    this.camera = new THREE.PerspectiveCamera(
      MAX_BOUNDS * 0.1,
      window.innerWidth / window.innerHeight,
      1,
      MAX_BOUNDS
    );
    this.camera.position.set(0, 0, 300000);

    this.controls = new CameraControls(this.camera, params.canvas as HTMLElement)

    this.enableTracking = true
    this.lastTracked = null // should default to player actor

    this.keyState = {shiftRight: false, shiftLeft: false, controlRight: false, controlLeft: false};

    const updateConfig = () => {
      if ( this.keyState.shiftRight || this.keyState.shiftLeft ) {
        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
      } else if ( this.keyState.controlRight || this.keyState.controlLeft ) {
        this.controls.mouseButtons.left = CameraControls.ACTION.DOLLY;
      } else {
        this.controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
      }
    }

    addEventListener( 'keydown', ( event ) => {
      if ( event.code === 'ShiftRight'   ) this.keyState.shiftRight   = true;
      if ( event.code === 'ShiftLeft'    ) this.keyState.shiftLeft    = true;
      if ( event.code === 'ControlRight' ) this.keyState.controlRight = true;
      if ( event.code === 'ControlLeft'  ) this.keyState.controlLeft  = true;
      updateConfig();
    } );

    addEventListener( 'keyup', ( event ) => {
      if ( event.code === 'ShiftRight'   ) this.keyState.shiftRight   = false;
      if ( event.code === 'ShiftLeft'    ) this.keyState.shiftLeft    = false;
      if ( event.code === 'ControlRight' ) this.keyState.controlRight = false;
      if ( event.code === 'ControlLeft'  ) this.keyState.controlLeft  = false;
      updateConfig();
    } );

    addEventListener('resize', () => {
      const sizes = { width: innerWidth, height: innerHeight };
      this.camera.aspect = sizes.width / sizes.height
      this.camera.updateProjectionMatrix()
    })
  }

  update(delta: number) {
    if (this.enableTracking) this.setCameraFocus();
    this.controls.update(delta);
  }

  setCameraFocus(mesh?: THREE.Mesh) {
    if (mesh) this.lastTracked = mesh;
    const target = mesh || this.lastTracked;
    const position = new THREE.Vector3();

    target?.parent?.getObjectById(target.id)?.getWorldPosition(position);

    this.controls.moveTo(position.x, position.y, position.z, true);
    if (mesh) this.controls.dollyTo(2);

    const min = target?.geometry.boundingSphere?.radius ? target?.geometry.boundingSphere?.radius * 1.9 : 0 ?? 0;

    this.controls.minDistance = min || 100000;
    this.controls.maxDistance = 50000000000;
  }
}
