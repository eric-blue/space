import * as THREE from "three";
import CameraControls from 'camera-controls';

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
      100,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(0, 0, 5);

    this.controls = new CameraControls(this.camera, params.canvas as HTMLElement)
    this.enableTracking = true
    this.lastTracked = null // should default to player actor

    this.keyState = {
      shiftRight  : false,
      shiftLeft   : false,
      controlRight: false,
      controlLeft : false,
    };

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
  }

  update(delta: number) {
    if (this.enableTracking) this.setCameraFocus();
    this.controls.update(delta);
  }

  setCameraFocus(mesh?: THREE.Mesh) {
    if (mesh) this.lastTracked = mesh;
    const target = mesh || this.lastTracked
    const objectPosition = new THREE.Vector3();

    target?.parent?.getObjectById(target.id)?.getWorldPosition(objectPosition);

    this.controls.moveTo(
      objectPosition.x,
      objectPosition.y,
      objectPosition.z,
    )

    // this.controls.setLookAt(
    //   objectPosition.x + 2,
    //   objectPosition.y + 0.5,
    //   objectPosition.z,
    //   0,0,0
    // )
  }
}
