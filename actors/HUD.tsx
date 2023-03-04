import * as THREE from "three";

import { CameraControl } from "./Camera.ts";
import { Clock } from "./Clock.ts";

import ThreeMeshUI from 'three-mesh-ui';

interface HUDParams {
  cameraControl: CameraControl;
  clock: Clock;
}

export class HeadsUPDisplay {
  cameraControl: CameraControl;
  clock: Clock;
  headsUpDisplay: ThreeMeshUI.Block;

  constructor(params: HUDParams) {
    this.cameraControl = params.cameraControl;
    this.clock = params.clock;
    const sizes = { width: innerWidth, height: innerHeight };

    this.headsUpDisplay = new ThreeMeshUI.Block({
      justifyContent: 'center',
      contentDirection: 'row-reverse',
      // fontFamily: FontJSON,
      // fontTexture: FontImage,
      fontSize: 0.07,
      padding: 0.02,
      borderRadius: 0.11,
      width: sizes.width,
      height: sizes.height
    });


    this.headsUpDisplay.position.set( 0, 0.6, -1.2 );
    this.headsUpDisplay.rotation.x = -0.55;
    // @ts-expect-error idk
    this.cameraControl.camera.add(this.headsUpDisplay);

    // BUTTONS

    // We start by creating objects containing options that we will use with the two buttons,
    // in order to write less code.

    const buttonOptions = {
      width: 0.4,
      height: 0.15,
      justifyContent: 'center',
      offset: 0.05,
      margin: 0.02,
      borderRadius: 0.075
    };

    // Options for component.setupState().
    // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

    const hoveredStateAttributes = {
      state: 'hovered',
      attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x999999 ),
        backgroundOpacity: 1,
        fontColor: new THREE.Color( 0xffffff )
      },
    };

    const idleStateAttributes = {
      state: 'idle',
      attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x666666 ),
        backgroundOpacity: 0.3,
        fontColor: new THREE.Color( 0xffffff )
      },
    };

    // Buttons creation, with the options objects passed in parameters.

    const buttonNext = new ThreeMeshUI.Block( buttonOptions );
    const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );

    // Add text to buttons

    buttonNext.add(
      new ThreeMeshUI.Text( { content: 'next' } )
    );

    buttonPrevious.add(
      new ThreeMeshUI.Text( { content: 'previous' } )
    );

    // Create states for the buttons.
    // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

    const selectedAttributes = {
      offset: 0.02,
      backgroundColor: new THREE.Color( 0x777777 ),
      fontColor: new THREE.Color( 0x222222 )
    };

    // @ts-expect-error
    buttonNext.setupState( {
      state: 'selected',
      attributes: selectedAttributes,
      // onSet: () => {

      //   currentMesh = ( currentMesh + 1 ) % 3;
      //   showMesh( currentMesh );

      // }
    } );

    // @ts-expect-error
    buttonNext.setupState( hoveredStateAttributes );
    // @ts-expect-error
    buttonNext.setupState( idleStateAttributes );

    // @ts-expect-error
    buttonPrevious.setupState( {
      state: 'selected',
      attributes: selectedAttributes,
      // onSet: () => {

      //   currentMesh -= 1;
      //   if ( currentMesh < 0 ) currentMesh = 2;
      //   showMesh( currentMesh );

      // }
    } );
    // @ts-expect-error
    buttonPrevious.setupState( hoveredStateAttributes );
    // @ts-expect-error
    buttonPrevious.setupState( idleStateAttributes );

    this.headsUpDisplay.add(buttonNext, buttonPrevious);
  }

  spawn() {
  }
}
