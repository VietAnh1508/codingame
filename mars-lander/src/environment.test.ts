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
    it("should flying high in the air", () => {
      const from = { x: 2000, y: 1000 };
      const to = { x: 2010, y: 980 };
      const result = checkShipStatus(
        initShipState,
        from,
        to,
        terrain,
        landingZone,
      );
      expect(result).toBe(ShipStatus.FLYING);
    });

    it("should soft landing on pad", () => {
      const shipState: Ship = {
        ...initShipState,
        vSpeed: -20,
        rotationAngle: 0,
      };
      const from = { x: 2000, y: 110 };
      const to = { x: 2005, y: 90 };
      const result = checkShipStatus(shipState, from, to, terrain, landingZone);
      expect(result).toBe(ShipStatus.LANDED);
    });

    it("should crash when landing too fast on pad", () => {
      const shipState: Ship = {
        ...initShipState,
        vSpeed: -50,
        rotationAngle: 0,
      };
      const from = { x: 2000, y: 110 };
      const to = { x: 2005, y: 90 };
      const result = checkShipStatus(shipState, from, to, terrain, landingZone);
      expect(result).toBe(ShipStatus.CRASHED);
    });

    it("should crash when tilt on pad", () => {
      const shipState: Ship = {
        ...initShipState,
        vSpeed: -20,
        rotationAngle: 15,
      };
      const from = { x: 2000, y: 110 };
      const to = { x: 2005, y: 90 };
      const result = checkShipStatus(shipState, from, to, terrain, landingZone);
      expect(result).toBe(ShipStatus.CRASHED);
    });

    it("should crash when hitting the slope", () => {
      const from = { x: 500, y: 320 };
      const to = { x: 510, y: 290 };
      const result = checkShipStatus(
        initShipState,
        from,
        to,
        terrain,
        landingZone,
      );
      expect(result).toBe(ShipStatus.CRASHED);
    });

    it("should crash when hitting the spike", () => {
      const from = { x: 4950, y: 1460 };
      const to = { x: 5050, y: 1460 };
      const result = checkShipStatus(
        initShipState,
        from,
        to,
        terrain,
        landingZone,
      );
      expect(result).toBe(ShipStatus.CRASHED);
    });

    it("should land sucessfully when landing on the pad edge", () => {
      const from = { x: 2970, y: 110 };
      const to = { x: 3010, y: 95 };
      const result = checkShipStatus(
        initShipState,
        from,
        to,
        terrain,
        landingZone,
      );
      expect(result).toBe(ShipStatus.LANDED);
    });

    it("should crash when landing on the pad edge, but hitting the slope first", () => {
      const from = { x: 3040, y: 135 };
      const to = { x: 2990, y: 90 };
      const result = checkShipStatus(
        initShipState,
        from,
        to,
        terrain,
        landingZone,
      );
      expect(result).toBe(ShipStatus.CRASHED);
    });

    it("should crash when flying off the side", () => {
      const from = { x: 6990, y: 1000 };
      const to = { x: 7010, y: 1000 };
      const result = checkShipStatus(
        initShipState,
        from,
        to,
        terrain,
        landingZone,
      );
      expect(result).toBe(ShipStatus.CRASHED);
    });
  });
});

