import { Mixin } from "ts-mixer";
import { NavigationalComputer } from "./NavigationalComputer.ts";
import {PassiveSensors} from "./PassiveSensors.ts";

export class ShipComponents extends Mixin(
  PassiveSensors,
  NavigationalComputer,
) {

  report() {
    return {
      sensorsStatus: this.sensorsActive,
      navCompActive: this.navCompActive,
      // hull, etc
      // engines
      // nav computer
      // life support
      // weapons
    }
  }
}
