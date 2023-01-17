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
      radius: 2440, // Mercury standard,
      mass: 3.3011e23, // Mercury standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 57909050e3, // Mercury standard,
      orbitalEccentricity: 0.205, // Mercury standard,
      orbitalInclination: 7.005, // Mercury standard,
      color: "#aaaaaa"
    },
  ],
  [
    {
      label: "Venus",
      type: "planet",
      isGroupAnchor: true,
      radius: 6051.8, // Venus standard,
      mass: 4.8685e24, // Venus standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 108208000e3, // Venus standard,
      orbitalEccentricity: 0.007, // Venus standard,
      orbitalInclination: 3.39, // Venus standard,
      color: "#aaaaaa"
    },
  ],
  [
    {
      label: "Earth",
      type: "planet",
      isGroupAnchor: true,
      radius: 6371000, // Earth standard,
      mass: 5.972e24, // Earth standard,
      gravityWellMass: 1.989e30, // Sun standard,
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
      orbitalRadius: 384000000, // Moon standard,
      orbitalEccentricity: 0.0549, // Moon standard,
      orbitalInclination: 5.145, // Moon standard,
      color: "#aaaaaa"
    }
  ],
  [
    {
      label: "Mars",
      type: "planet",
      isGroupAnchor: true,
      radius: 3389.5, // Mars standard,
      mass: 6.4185e23, // Mars standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 227943824e3, // Mars standard,
      orbitalEccentricity: 0.0934, // Mars standard,
      orbitalInclination: 1.85, // Mars standard,
      color: "#aaaaaa"
    },
  ],
  [
    {
      label: "Jupiter",
      type: "planet",
      isGroupAnchor: true,
      radius: 69911, // Jupiter standard,
      mass: 1.898e27, // Jupiter standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 778340821e3, // Jupiter standard,
      orbitalEccentricity: 0.048, // Jupiter standard,
      orbitalInclination: 1.305, // Jupiter standard,
      color: "#aaaaaa"
    },
  ],
  [
    {
      label: "Saturn",
      type: "planet",
      isGroupAnchor: true,
      radius: 58232, // Saturn standard,
      mass: 5.6834e26, // Saturn standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 1426725400e3, // Saturn standard,
      orbitalEccentricity: 0.056, // Saturn standard,
      orbitalInclination: 2.485, // Saturn standard,
      color: "#aaaaaa"
    },
  ],
  [
    {
      label: "Uranus",
      type: "planet",
      isGroupAnchor: true,
      radius: 25362, // Uranus standard,
      mass: 8.6810e25, // Uranus standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 2876679082e3, // Uranus standard,
      orbitalEccentricity: 0.047, // Uranus standard,
      orbitalInclination: 0.772, // Uranus standard,
      color: "#aaaaaa"
    },
  ],
  [
    {
      label: "Neptune",
      type: "planet",
      isGroupAnchor: true,
      radius: 24622, // Neptune standard,
      mass: 1.0243e26, // Neptune standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 4498252900e3, // Neptune standard,
      orbitalEccentricity: 0.009, // Neptune standard,
      orbitalInclination: 1.77, // Neptune standard,
      color: "#aaaaaa"
    }
  ],
  [
    {
      label: "Pluto",
      type: "planet",
      isGroupAnchor: true,
      radius: 1188, // Pluto standard,
      mass: 1.303e22, // Pluto standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 5913520000e3, // Pluto standard,
      orbitalEccentricity: 0.248, // Pluto standard,
      orbitalInclination: 17.15, // Pluto standard,
      color: "#aaaaaa"
    }
  ],
  [
    {
      label: "Ceres",
      type: "planet",
      isGroupAnchor: true,
      radius: 469.73, // Ceres standard,
      mass: 9.393e20, // Ceres standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 413000000e3, // Ceres standard,
      orbitalEccentricity: 0.076, // Ceres standard,
      orbitalInclination: 10.59, // Ceres standard,
      color: "#aaaaaa"
    }
  ],
  [
    {
      label: "Pallas",
      type: "planet",
      isGroupAnchor: true,
      radius: 237.0, // Pallas standard,
      mass: 2.06e20, // Pallas standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 413000000e3, // Pallas standard,
      orbitalEccentricity: 0.076, // Pallas standard,
      orbitalInclination: 34.83, // Pallas standard,
      color: "#aaaaaa"
    }
  ],
  [
    {
      label: "Vesta",
      type: "planet",
      isGroupAnchor: true,
      radius: 265.0, // Vesta standard,
      mass: 2.59e20, // Vesta standard,
      gravityWellMass: 1.989e30, // Sun standard,
      orbitalRadius: 413000000e3, // Vesta standard,
      orbitalEccentricity: 0.076, // Vesta standard,
      orbitalInclination: 5.35, // Vesta standard,
      color: "#aaaaaa"
    }
  ],
];
