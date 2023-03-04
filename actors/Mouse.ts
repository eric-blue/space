import * as THREE from "three";
import { CameraControl } from "./Camera.ts";

interface MouseParams {
  cameraControl: CameraControl;
}

export class Mouse {
  params: MouseParams;
  topIntersect: THREE.Mesh|null;
  mouse: THREE.Vector2;
  raycaster: THREE.Raycaster;

  constructor(params: MouseParams) {
    this.params = params;
    this.topIntersect = null;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    addEventListener('mousemove', (event) => this.mouseMove(event));

    addEventListener('click', (event) => {
      // if (event.shiftKey && this.topIntersect?.name === "ship") kolkata.navigate();
    });

    addEventListener('dblclick', () => {
      if (this.topIntersect) params.cameraControl.setCameraFocus(this.topIntersect);
    });
  }

  update(intersects: THREE.Mesh[]) {
    this.raycaster.setFromCamera(this.mouse, this.params.cameraControl.camera);

    for (const intersect of this.raycaster.intersectObjects(intersects)) {
      this.topIntersect = intersect.object.type === "Mesh" ? intersect.object as THREE.Mesh : null;
    }
  }

  mouseMove(event: MouseEvent) {
    const sizes = { width: innerWidth, height: innerHeight };
    this.mouse.x = (event.clientX / sizes.width) * 2 - 1;
    this.mouse.y = -(event.clientY / sizes.height) * 2 + 1;
  }
}
