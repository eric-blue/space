// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { useEffect } from "preact/hooks";

// function init() {
//   // Set up the canvas
//   const canvas = document.querySelector('.webgl');
//   if (!canvas) return;

//   // Set up the scene
//   const scene = new THREE.Scene();

//   // Check for collisions between ships in the two given fleets
//   function checkCollisions(fleet1: Fleet, fleet2: Fleet) {
//     for (const ship1 of fleet1.ships) {
//       for (const ship2 of fleet2.ships) {
//         if (ship1.isCollidingWith(ship2)) {
//           // Handle the collision
//         }
//       }
//     }
//   }

//   function playerIsGivingCommands() {
//     return true
//   }
//   function engagementIsOver() {
//     return false
//   }

//   // Fleet class
//   class Fleet {
//     commandShip: null|CommandShip;
//     ships: (Ship|CommandShip)[];

//     constructor() {
//       this.commandShip = null;
//       this.ships = [];
//     }

//     create() {
//       // Create the command ship and add it to the fleet
//       this.commandShip = new CommandShip();
//       this.commandShip.create();
//       this.ships.push(this.commandShip);

//       // Create the other ships in the fleet
//       for (let i = 0; i < 10; i++) {
//         const ship = new Ship();
//         ship.create();
//         this.ships.push(ship);
//       }
//     }

//     update() {
//       // Update the position of each ship in the fleet
//       for (const ship of this.ships) {
//         ship.update();
//       }

//       // Check if the player is giving any commands to the fleet
//       if (playerIsGivingCommands()) {
//         // Set the navigation path for the fleet
//         this.setNavigationPath();

//         // Set the formation for the fleet
//         this.setFormation();

//         // Set the target for each ship in the fleet
//         this.setTargets();

//         // Make any last minute changes before the engagement
//         this.makeLastMinuteChanges();
//       }

//       // If the engagement is over, re-position the fleet, set up new navigation, resupply and stopover, and designate ships for repair
//       if (engagementIsOver()) {
//         this.reposition();
//         this.setUpNewNavigation();
//         this.resupplyAndStopover();
//         this.designateShipsForRepair();
//       }
//     }

//     setNavigationPath() {
//       // Set the navigation path for the fleet based on the player's commands
//     }

//     setFormation() {
//       // Set the formation for the fleet based on the player's commands
//     }

//     setTargets() {
//       // Set the target for each ship in the fleet based on the player's commands
//     }

//     makeLastMinuteChanges() {
//       // Make any last minute changes to the fleet's tactics before the engagement
//     }

//     reposition() {
//       // Reposition the fleet based on the outcome of the engagement and the player's commands
//     }

//     setUpNewNavigation() {
//       // Set up a new navigation path for the fleet based on the player's commands
//     }

//     resupplyAndStopover() {
//       // Have the fleet resupply and stop over at a nearby space station or planet
//     }

//     designateShipsForRepair() {
//       // Designate any damaged ships in the fleet for repair
//     }
//   }

//   // SolarSystem class
//   class SolarSystem {
//     create() {
//       // Create the sun
//       const sun = new Sun();
//       sun.create();
//       this.add(sun);

//       // Create the planets
//       for (let i = 0; i < 8; i++) {
//         const planet = new Planet();
//         planet.create();
//         this.add(planet);
//       }

//       // Create the asteroids
//       for (let i = 0; i < 1000; i++) {
//         const asteroid = new Asteroid();
//         asteroid.create();
//         this.add(asteroid);
//       }
//     }

//     add(object) {
//       // Add the object to the solar system
//       scene.add(object);
//     }
//   }

//   // Sun class
//   class Sun {
//     create() {
//       // Create the sun and add it to the scene
//       const geometry = new THREE.SphereGeometry(0.5, 32, 32);
//       const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//       const mesh = new THREE.Mesh(geometry, material);
//       scene.add(mesh);
//     }
//   }

//   // Planet class
//   class Planet {
//     create() {
//       // Create the planet and add it to the scene
//       const geometry = new THREE.SphereGeometry(0.25, 32, 32);
//       const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//       const mesh = new THREE.Mesh(geometry, material);

//       // spawn GravityWell

//       scene.add(mesh);
//     }
//   }

//   // Asteroid class
//   class Asteroid {
//     create() {
//       // Create the asteroid and add it to the scene
//       const geometry = new THREE.SphereGeometry(0.1, 32, 32);
//       const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
//       const mesh = new THREE.Mesh(geometry, material);

//       // spawn singular orbital

//       scene.add(mesh);
//     }
//   }

//   class Orbital {
//     // * for intensity of gravity well
//     create() {
//       // add orbital ring
//     }
//   }

//   class GravityWell {
//     create() {
//       // add many orbital rings based on intensity
//     }
//   }

//   // Ship class
//   class Ship {
//     startTime: number;
//     mesh: THREE.Mesh;

//     create() {
//       // Create the ship and add it to the scene
//       const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
//       const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
//       const mesh = new THREE.Mesh(geometry, material);
//       scene.add(mesh);
//     }
//     update() {
//       // Update the position of the ship based on orbital mechanics and the fleet's navigation path
//       const elapsedTime = Date.now() - this.startTime;
//       const radius = 1;
//       const angle = elapsedTime / 1000;
//       this.mesh.position.x = radius * Math.cos(angle);
//       this.mesh.position.z = radius * Math.sin(angle);
//     }

//     isCollidingWith(otherShip: Ship) {
//       // Check if the ship is colliding with the other ship
//       const distance = this.mesh.position.distanceTo(otherShip.mesh.position);
//       return distance < 0.5;
//     }
//   }

//   // CommandShip class
//   class CommandShip extends Ship {
//     create() {
//       // Create the command ship and add it to the scene
//       const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
//       const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
//       const mesh = new THREE.Mesh(geometry, material);
//       scene.add(mesh);
//     }

//     update() {
//       // Update the position of the command ship based on orbital mechanics and the fleet's navigation path
//       const elapsedTime = Date.now() - this.startTime;
//       const radius = 1;
//       const angle = elapsedTime / 1000;
//       this.mesh.position.x = radius * Math.cos(angle);
//       this.mesh.position.z = radius * Math.sin(angle);
//     }
//   }

//   // Set up the camera
//   const fov = 75;
//   const aspect = canvas.clientWidth / canvas.clientHeight;
//   const near = 0.1;
//   const far = 1000;
//   const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//   camera.position.z = 5;

//   // Set up the solar system
//   const solarSystem = new SolarSystem();
//   solarSystem.create();

//   // Set up the fleets
//   const playerFleet = new Fleet();
//   playerFleet.create();

//   const enemyFleet = new Fleet();
//   enemyFleet.create();

//   // Set up the gameplay loop
//   function animate() {
//     // Update the fleets
//     playerFleet.update();
//     enemyFleet.update();

//     // Check for collisions between ships
//     checkCollisions(playerFleet, enemyFleet);

//     // Render the scene
//     renderer.render(scene, camera);

//     // Request the next frame
//     requestAnimationFrame(animate);
//   }

//   // Start the gameplay loop
//   animate();
// }


export default function Game() {
//   useEffect(() => { init() }, [])

  return <canvas class="webgl"/>
}
