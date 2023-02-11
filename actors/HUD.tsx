import * as THREE from "three";

import { CameraControl } from "./Camera.ts";
import { Clock } from "./Clock.ts";

// TODO: redo this with https://github.com/felixmariotto/three-mesh-ui/blob/master/examples/interactive_button.js

interface HUDParams {
  cameraControl: CameraControl;
  clock: Clock;
  sizes: { width: typeof window.innerWidth, height: typeof window.innerHeight }
}

export class HeadsUPDisplay {
  cameraControl: CameraControl;
  clock: Clock;
  headsUpDisplay: THREE.Group;

  constructor(params: HUDParams) {
    this.cameraControl = params.cameraControl;
    this.clock = params.clock;
    const { width, height } = params.sizes;

    this.headsUpDisplay = new THREE.Group();

    // add bottom toolbar geometry to the HUD
    const bottomToolbar = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height / 10),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    // bottomToolbar.position.set(0, -height / 2, 0);

    // add clickable button to the bottom toolbar
    const button = new THREE.Mesh(
      new THREE.PlaneGeometry(width / 10, height / 10),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    // button.position.set(width / 2, -height / 2, 0);

    // const buttonText = new TroikaText();
    // buttonText.text = 'Hello world!';
    // buttonText.fontSize = 0.2;
    // (buttonText as unknown as THREE.Object3D).position.z = -2;
    // buttonText.color = 0x9966FF;
    // buttonText.sync();

    // button.children.push(buttonText as unknown as THREE.Object3D);
    bottomToolbar.children.push(button);

    this.headsUpDisplay.position.set(0, -height / 2, 2);

    this.headsUpDisplay.add(bottomToolbar);
  }

  spawn() {
    // this.cameraControl.camera.add(this.headsUpDisplay);
  }
}
