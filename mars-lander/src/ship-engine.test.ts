import { describe, expect, it } from "vitest";
import {
  calculateHorizontalAcceleration,
  calculateNextState,
  calculateVerticalAcceleration,
  changeThrustPower,
  rotateAngle,
} from "./ship-engine";

describe("ship-engine", () => {
  it("should return the correct state after 10 iterations", () => {
    const initialState = {
      x: 2500,
      y: 2700,
      hSpeed: 0,
      vSpeed: 0,
      fuel: 550,
      rotationAngle: 0,
      thrustPower: 0,
    };

    const move = {
      rotationAngle: -20,
      thrustPower: 3,
    };

    const expectedState = {
      x: 2541,
      y: 2630,
      hSpeed: 9,
      vSpeed: -12,
      fuel: 523,
      rotationAngle: -20,
      thrustPower: 3,
    };

    let nextState = initialState;
    for (let i = 0; i < 10; i++) {
      nextState = calculateNextState(nextState, move);
    }

    expect(Math.round(nextState.x)).toEqual(expectedState.x);
    expect(Math.round(nextState.y)).toEqual(expectedState.y);
    expect(Math.round(nextState.hSpeed)).toEqual(expectedState.hSpeed);
    expect(Math.round(nextState.vSpeed)).toEqual(expectedState.vSpeed);
    expect(nextState.fuel).toEqual(expectedState.fuel);
    expect(nextState.rotationAngle).toEqual(expectedState.rotationAngle);
    expect(nextState.thrustPower).toEqual(expectedState.thrustPower);
  });

  it.each([
    {
      currentAngle: 0,
      targetAngle: 90,
      expectedAngle: 15,
    },
    {
      currentAngle: 80,
      targetAngle: 90,
      expectedAngle: 90,
    },
    {
      currentAngle: 10,
      targetAngle: -90,
      expectedAngle: -5,
    },
    {
      currentAngle: 0,
      targetAngle: 5,
      expectedAngle: 5,
    },
    {
      currentAngle: 85,
      targetAngle: 95,
      expectedAngle: 90,
    },
  ])(
    "should change tilt angle correctly from: $currentAngle to: $targetAngle",
    ({ currentAngle, targetAngle, expectedAngle }) => {
      const result = rotateAngle(currentAngle, targetAngle);
      expect(result).toBe(expectedAngle);
    },
  );

  it.each([
    {
      currentPower: 0,
      currentFuel: 10,
      targetPower: 4,
      expectedPower: 1,
    },
    {
      currentPower: 3,
      currentFuel: 10,
      targetPower: 4,
      expectedPower: 4,
    },
    {
      currentPower: 4,
      currentFuel: 10,
      targetPower: 0,
      expectedPower: 3,
    },
    {
      currentPower: 3,
      currentFuel: 10,
      targetPower: 5,
      expectedPower: 4,
    },
    {
      currentPower: 1,
      currentFuel: 10,
      targetPower: -1,
      expectedPower: 0,
    },
    {
      currentPower: 3,
      currentFuel: 1,
      targetPower: 4,
      expectedPower: 4,
    },
    {
      currentPower: 3,
      currentFuel: 0,
      targetPower: 2,
      expectedPower: 0,
    },
    {
      currentPower: 4,
      currentFuel: 2,
      targetPower: 4,
      expectedPower: 4,
    },
  ])(
    "should change thrust power correctly from $currentPower to $targetPower, given $currentFuel fuel",
    ({ currentPower, currentFuel, targetPower, expectedPower }) => {
      const result = changeThrustPower(currentPower, targetPower, currentFuel);
      expect(result).toBe(expectedPower);
    },
  );

  it.each([
    {
      rotateAngle: 0,
      thrustPower: 4,
      expectedVerticalAcceleration: 0.289,
      expectedHorizontalAcceleration: 0,
    },
    {
      rotateAngle: 90,
      thrustPower: 4,
      expectedVerticalAcceleration: -3.711,
      expectedHorizontalAcceleration: -4,
    },
    {
      rotateAngle: -90,
      thrustPower: 4,
      expectedVerticalAcceleration: -3.711,
      expectedHorizontalAcceleration: 4,
    },
    {
      rotateAngle: 30,
      thrustPower: 3,
      expectedVerticalAcceleration: -1.113,
      expectedHorizontalAcceleration: -1.5,
    },
  ])(
    "should calculate vertical and horizontal acceleration correctly for rotateAngle: $rotateAngle and thrustPower: $thrustPower",
    ({
      rotateAngle,
      thrustPower,
      expectedVerticalAcceleration,
      expectedHorizontalAcceleration,
    }) => {
      const verticalAcceleration = calculateVerticalAcceleration(
        rotateAngle,
        thrustPower,
      );
      expect(verticalAcceleration).toBeCloseTo(expectedVerticalAcceleration, 3);

      const horizontalAcceleration = calculateHorizontalAcceleration(
        rotateAngle,
        thrustPower,
      );
      expect(horizontalAcceleration).toBeCloseTo(
        expectedHorizontalAcceleration,
        3,
      );
    },
  );
});

