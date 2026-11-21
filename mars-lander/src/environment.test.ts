import { describe, expect, it } from "vitest";
import { checkShipStatus, findLandingZone } from "./environment";
import { LandingZone, Ship, ShipStatus } from "./types";

describe("environment", () => {
  const terrain = [
    { x: 0, y: 100 },
    { x: 1000, y: 500 },
    { x: 1500, y: 100 },
    { x: 3000, y: 100 },
    { x: 3500, y: 500 },
    { x: 3700, y: 200 },
    { x: 5000, y: 1500 },
    { x: 5800, y: 300 },
    { x: 6000, y: 100 },
    { x: 6999, y: 2000 },
  ];

  const landingZone = findLandingZone(terrain);

  const initShipState: Ship = {
    x: 0,
    y: 0,
    hSpeed: 0,
    vSpeed: 0,
    fuel: 500,
    rotationAngle: 0,
    thrustPower: 0,
  };

  describe("findLandingZone", () => {
    it("should find the correct landing zone", () => {
      const expectedLandingZone: LandingZone = {
        start: {
          x: 1500,
          y: 100,
        },
        end: {
          x: 3000,
          y: 100,
        },
      };

      const landingZone = findLandingZone(terrain);
      expect(landingZone).toEqual(expectedLandingZone);
    });
  });

  describe("checkShipStatus", () => {
    it.each([
      {
        name: "should be flying high in the air",
        curShipState: {
          ...initShipState,
          x: 2000,
          y: 1000,
        },
        newShipState: {
          ...initShipState,
          x: 2010,
          y: 980,
        },
        shipStatus: ShipStatus.FLYING,
      },
      {
        name: "should land softly on the pad when speeds are under limit",
        curShipState: {
          ...initShipState,
          x: 2000,
          y: 110,
        },
        newShipState: {
          ...initShipState,
          x: 2005,
          y: 90,
          vSpeed: -30,
          hSpeed: -18,
        },
        shipStatus: ShipStatus.LANDED,
      },
      {
        name: "should land softly on the pad when speeds are at limit",
        curShipState: {
          ...initShipState,
          x: 2000,
          y: 110,
        },
        newShipState: {
          ...initShipState,
          x: 2005,
          y: 90,
          vSpeed: -40,
          hSpeed: 20,
        },
        shipStatus: ShipStatus.LANDED,
      },
      {
        name: "should crash when moving too fast vertically on the pad",
        curShipState: {
          ...initShipState,
          x: 2000,
          y: 110,
        },
        newShipState: {
          ...initShipState,
          x: 2005,
          y: 90,
          vSpeed: -50,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should crash when moving too fast horizontally on the pad",
        curShipState: {
          ...initShipState,
          x: 2000,
          y: 110,
        },
        newShipState: {
          ...initShipState,
          x: 2005,
          y: 90,
          hSpeed: -30,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should crash when tilted on the pad",
        curShipState: {
          ...initShipState,
          x: 2000,
          y: 110,
        },
        newShipState: {
          ...initShipState,
          x: 2005,
          y: 90,
          rotationAngle: 15,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should crash when hitting the slope",
        curShipState: {
          ...initShipState,
          x: 500,
          y: 320,
        },
        newShipState: {
          ...initShipState,
          x: 510,
          y: 290,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should crash when hitting the spike",
        curShipState: {
          ...initShipState,
          x: 4950,
          y: 1460,
        },
        newShipState: {
          ...initShipState,
          x: 5050,
          y: 1460,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should land successfully when landing on the pad edge",
        curShipState: {
          ...initShipState,
          x: 2970,
          y: 110,
        },
        newShipState: {
          ...initShipState,
          x: 3010,
          y: 95,
        },
        shipStatus: ShipStatus.LANDED,
      },
      {
        name: "should crash when landing on the pad edge, but hitting the slope first",
        curShipState: {
          ...initShipState,
          x: 3040,
          y: 135,
        },
        newShipState: {
          ...initShipState,
          x: 2990,
          y: 90,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should crash when flying off the side",
        curShipState: {
          ...initShipState,
          x: 6990,
          y: 1000,
        },
        newShipState: {
          ...initShipState,
          x: 7010,
          y: 1000,
        },
        shipStatus: ShipStatus.CRASHED,
      },
      {
        name: "should be flying when the ship moves in line with the slope but still above the ground",
        curShipState: {
          ...initShipState,
          x: 875,
          y: 600,
        },
        newShipState: {
          ...initShipState,
          x: 900,
          y: 580,
        },
        shipStatus: ShipStatus.FLYING,
      },
      {
        name: "should crash when the ship moves in line with the slope and touches the ground",
        curShipState: {
          ...initShipState,
          x: 1100,
          y: 420,
        },
        newShipState: {
          ...initShipState,
          x: 1150,
          y: 380,
        },
        shipStatus: ShipStatus.CRASHED,
      },
    ])("$name", ({ curShipState, newShipState, shipStatus }) => {
      const result = checkShipStatus(
        curShipState,
        newShipState,
        terrain,
        landingZone,
      );
      expect(result).toBe(shipStatus);
    });
  });
});

