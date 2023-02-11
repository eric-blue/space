import { SOLAR_MASS, SOLAR_RADIUS } from "../constants.ts";
import { StarSystem } from "../islands/Three.tsx";

export const sol: StarSystem = [
  {
    label: "Sol",
    type: "star",
    mass: SOLAR_MASS, // Sun standard,
    radius: SOLAR_RADIUS, // Sun standard,
    energyOutput: 3.846e26, // Sun standard,
    color: "#ffffff"
  },
  [
    {
      label: "Mercury",
      type: "planet",
      isGroupAnchor: true,
      radius: 2440000, // Mercury standard,
      mass: 3.3011e23, // Mercury standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 57909050e3, // Mercury standard,
      orbitalEccentricity: 0.205, // Mercury standard,
      orbitalInclination: 7.005, // Mercury standard,
      color: "#aaffaa"
    },
  ],
  [
    {
      label: "Venus",
      type: "planet",
      isGroupAnchor: true,
      radius: 6051800, // Venus standard,
      mass: 4.8685e24, // Venus standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 108208000e3, // Venus standard,
      orbitalEccentricity: 0.007, // Venus standard,
      orbitalInclination: 3.39, // Venus standard,
      color: "#aaffaa"
    },
  ],
  [
    {
      label: "Earth",
      type: "planet",
      isGroupAnchor: true,
      radius: 6371000, // Earth standard,
      mass: 5.972e24, // Earth standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 149598023000, // Earth standard,
      orbitalEccentricity: 0.0167, // Earth standard,
      orbitalInclination: 0, // Earth standard,
      color: "#00ff00",
    },
    {
      label: "Luna",
      type: "moon",
      gravityWellMass: 5.972e24, // Earth standard,
      radius: 1737100, // Moon standard,
      mass: 7.348E22, // Moon standard,
      orbitalRadius: 384748000, // Moon standard,
      orbitalEccentricity: 0.0549, // Moon standard,
      orbitalInclination: 5.145, // Moon standard,
      color: "#aaffaa"
    }
  ],
  [
    {
      label: "Mars",
      type: "planet",
      isGroupAnchor: true,
      radius: 3389500, // Mars standard,
      mass: 6.4185e23, // Mars standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 227943824000, // Mars standard,
      orbitalEccentricity: 0.0934, // Mars standard,
      orbitalInclination: 1.85, // Mars standard,
      color: '#a52a2a'
    },
    {
      label: "Phobos",
      type: "moon",
      gravityWellMass: 6.4185e23, // Mars standard,
      radius: 11266.7, // Phobos standard,
      mass: 1.0659e16, // Phobos standard,
      orbitalRadius: 9376000, // Phobos standard,
      orbitalEccentricity: 0.0151, // Phobos standard,
      orbitalInclination: 1.075, // Phobos standard,
      color: "#aaffaa"
    },
    {
      label: "Deimos",
      type: "moon",
      gravityWellMass: 6.4185e23, // Mars standard,
      radius: 6200, // Deimos standard,
      mass: 1.4762e15, // Deimos standard,
      orbitalRadius: 23460e3, // Deimos standard,
      orbitalEccentricity: 0.0002, // Deimos standard,
      orbitalInclination: 1.075, // Deimos standard,
      color: "#aaffaa"
    }
  ],
  [
    {
      label: "Jupiter",
      type: "planet",
      isGroupAnchor: true,
      radius: 69911000, // Jupiter standard,
      mass: 1.898e27, // Jupiter standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 778340821e3, // Jupiter standard,
      orbitalEccentricity: 0.048, // Jupiter standard,
      orbitalInclination: 1.305, // Jupiter standard,
      color: '#a52a2a'
    },
    {
      label: "Io",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 1821600, // Io standard,
      mass: 8.9319e22, // Io standard,
      orbitalRadius: 421700e3, // Io standard,
      orbitalEccentricity: 0.0041, // Io standard,
      orbitalInclination: 0.04, // Io standard,
      color: "#aaffaa"
    },
    {
      label: "Europa",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 1560800, // Europa standard,
      mass: 4.7998e22, // Europa standard,
      orbitalRadius: 671100e3, // Europa standard,
      orbitalEccentricity: 0.009, // Europa standard,
      orbitalInclination: 0.47, // Europa standard,
      color: "#aaffaa"
    },
    {
      label: "Ganymede",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 2634100, // Ganymede standard,
      mass: 1.4819e23, // Ganymede standard,
      orbitalRadius: 1070400e3, // Ganymede standard,
      orbitalEccentricity: 0.0013, // Ganymede standard,
      orbitalInclination: 0.2, // Ganymede standard,
      color: "#aaffaa"
    },
    {
      label: "Callisto",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 2410300, // Callisto standard,
      mass: 1.0759e23, // Callisto standard,
      orbitalRadius: 1882700e3, // Callisto standard,
      orbitalEccentricity: 0.0074, // Callisto standard,
      orbitalInclination: 0.21, // Callisto standard,
      color: "#aaffaa"
    },
    {
      label: "Amalthea",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 83500, // Amalthea standard,
      mass: 1.66e19, // Amalthea standard,
      orbitalRadius: 181400e3, // Amalthea standard,
      orbitalEccentricity: 0.001, // Amalthea standard,
      orbitalInclination: 0.3, // Amalthea standard,
      color: "#aaffaa"
    },
    // Leda, Ersa, Himalia, S/2018 J 2, Pandia, Lysithea, Elara, S/2011 J 3, Dia, Carpo†, Valetudo†, Euporie, S/2003 J 18, S/2021 J 1, Eupheme, S/2010 J 2, S/2016 J 1, Mneme, Euanthe, S/2003 J 16, Harpalyke, Orthosie, Helike, Praxidike, S/2017 J 3, S/2003 J 12, S/2017 J 7, Thelxinoe, Thyone, S/2003 J 2, Ananke, Iocaste, Hermippe, S/2017 J 9, S/2016 J 3, Philophrosyne, Pastihee, S/2017 J 8, S/2003 J 24, Eurydome, S/2011 J 2, S/2003 J 4, Chaldene, S/2017 J 2, Isonoe, Kallichore, Erinome, Kale, Eirene, Aitne, Eukelade, Arche, Taygete, S/2011 J 1, Carme, Herse, S/2003 J 19, S/2010 J 1, S/2003 J 9, S/2017 J 5, S/2017 J 6, Kalyke, Hegemone, Pasiphae, Sponde, S/2003 J 10, Megaclite, Cyllene, Sinope, S/2017 J 1, Aoede, Autonoe, Callirrhoe, S/2003 J 23, Kore
    {
      label: "Metis",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 49400, // Metis standard,
      mass: 6.7e18, // Metis standard,
      orbitalRadius: 128900e3, // Metis standard,
      orbitalEccentricity: 0.0001, // Metis standard,
      orbitalInclination: 0.3, // Metis standard,
      color: "#aaffaa"
    },
    {
      label: "Adrastea",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 15000,
      mass: 2.8e18,
      orbitalRadius: 129000e3,
      orbitalEccentricity: 0,
      orbitalInclination: 0.34
    },
    {
      label: "Thebe",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 48000,
      mass: 7.1e18,
      orbitalRadius: 221800e3,
      orbitalEccentricity: 0,
      orbitalInclination: 0.30
    },
    {
      label: "Themisto",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 3000,
      mass: 3.8e16,
      orbitalRadius: 1545000e3,
      orbitalEccentricity: 0.038,
      orbitalInclination: 0.34
    },
    {
      label: "Leda",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 16000,
      mass: 4.5e18,
      orbitalRadius: 116700e3,
      orbitalEccentricity: 0,
      orbitalInclination: 0.19
    },
    {
      label: "Ersa",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 2000,
      mass: 1.4e17,
      orbitalRadius: 116700e3,
      orbitalEccentricity: 0,
      orbitalInclination: 0.19
    },
    {
      label: "Himalia",
      type: "moon",
      gravityWellMass: 1.898e27, // Jupiter standard,
      radius: 90000,
      mass: 2e19,
      orbitalRadius: 11445000e3,
      orbitalEccentricity: 0.001,
      orbitalInclination: 0.13
    },
  ],
  [
    {
      label: "Saturn",
      type: "planet",
      isGroupAnchor: true,
      radius: 58232000, // Saturn standard,
      mass: 5.6834e26, // Saturn standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 1426725400e3, // Saturn standard,
      orbitalEccentricity: 0.056, // Saturn standard,
      orbitalInclination: 2.485, // Saturn standard,
      color: "#aaffaa"
    },
  ],
  [
    {
      label: "Uranus",
      type: "planet",
      isGroupAnchor: true,
      radius: 25362000, // Uranus standard,
      mass: 8.6810e25, // Uranus standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 2876679082e3, // Uranus standard,
      orbitalEccentricity: 0.047, // Uranus standard,
      orbitalInclination: 0.772, // Uranus standard,
      color: "#aaffaa"
    },
  ],
  [
    {
      label: "Neptune",
      type: "planet",
      isGroupAnchor: true,
      radius: 24622000, // Neptune standard,
      mass: 1.0243e26, // Neptune standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 4498252900e3, // Neptune standard,
      orbitalEccentricity: 0.009, // Neptune standard,
      orbitalInclination: 1.77, // Neptune standard,
      color: "#aaffaa"
    }
  ],
  [
    {
      label: "Pluto",
      type: "planet",
      isGroupAnchor: true,
      radius: 1188000, // Pluto standard,
      mass: 1.303e22, // Pluto standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 5913520000e3, // Pluto standard,
      orbitalEccentricity: 0.248, // Pluto standard,
      orbitalInclination: 17.15, // Pluto standard,
      color: "#aaffaa"
    }
  ],
  [
    {
      label: "Ceres",
      type: "planet",
      isGroupAnchor: true,
      radius: 469730, // Ceres standard,
      mass: 9.393e20, // Ceres standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 413000000e3, // Ceres standard,
      orbitalEccentricity: 0.076, // Ceres standard,
      orbitalInclination: 10.59, // Ceres standard,
      color: "#aaffaa"
    }
  ],
  [
    {
      label: "Pallas",
      type: "planet",
      isGroupAnchor: true,
      radius: 237000, // Pallas standard,
      mass: 2.06e20, // Pallas standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 413000000e3, // Pallas standard,
      orbitalEccentricity: 0.076, // Pallas standard,
      orbitalInclination: 34.83, // Pallas standard,
      color: "#aaffaa"
    }
  ],
  [
    {
      label: "Vesta",
      type: "planet",
      isGroupAnchor: true,
      radius: 265000, // Vesta standard,
      mass: 2.59e20, // Vesta standard,
      gravityWellMass: SOLAR_MASS, // Sun standard,
      orbitalRadius: 413000000e3, // Vesta standard,
      orbitalEccentricity: 0.076, // Vesta standard,
      orbitalInclination: 5.35, // Vesta standard,
      color: "#aaffaa"
    }
  ],
];
