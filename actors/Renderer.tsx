import * as THREE from "three";

interface RendererParams {
  canvas: HTMLCanvasElement;
}

export class Renderer {
  renderer: THREE.WebGLRenderer;

  constructor(params: RendererParams) {
    const sizes = { width: innerWidth, height: innerHeight };

    this.renderer = new THREE.WebGLRenderer({
      canvas: params.canvas,
      antialias: true,
      // logarithmicDepthBuffer: true,
      powerPreference: "high-performance"
    })
    this.renderer.setSize(sizes.width, sizes.height)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(0x292929)
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    addEventListener('resize', () => {
      const sizes = { width: innerWidth, height: innerHeight };
      this.renderer.setSize(sizes.width, sizes.height)
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    })
  }
}
