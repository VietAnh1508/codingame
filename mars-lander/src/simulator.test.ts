import { describe, expect, it } from "vitest";
import { findLandingZone } from "./environment";
import { simulate } from "./simulator";
import { Point, ShipStatus } from "./types";

describe("simulator", () => {
  const initialState = {
    x: 2500,
    y: 2700,
    hSpeed: 0,
    vSpeed: 0,
    fuel: 550,
    rotationAngle: 0,
    thrustPower: 0,
  };

  const terrain: Point[] = [
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

  it("should be still flying when no move is provided", () => {
    const finalState = { ...initialState };

    const { state, status } = simulate(initialState, [], terrain, landingZone);
    expect(status).toEqual(ShipStatus.FLYING);

    expect(Math.round(state.x)).toEqual(finalState.x);
    expect(Math.round(state.y)).toEqual(finalState.y);
    expect(Math.round(state.hSpeed)).toEqual(finalState.hSpeed);
    expect(Math.round(state.vSpeed)).toEqual(finalState.vSpeed);
    expect(state.fuel).toEqual(finalState.fuel);
    expect(state.rotationAngle).toEqual(finalState.rotationAngle);
    expect(state.thrustPower).toEqual(finalState.thrustPower);
  });

  it("should be still flying after 10 turns", () => {
    const move = {
      rotationAngle: -20,
      thrustPower: 3,
    };

    const finalState = {
      x: 2541,
      y: 2630,
      hSpeed: 9,
      vSpeed: -12,
      fuel: 523,
      rotationAngle: -20,
      thrustPower: 3,
    };

    // apply the same move, just to verify the final state
    const moveList = Array.from({ length: 10 }, () => ({ ...move }));

    const { state, status } = simulate(
      initialState,
      moveList,
      terrain,
      landingZone,
    );
    expect(status).toEqual(ShipStatus.FLYING);

    expect(Math.round(state.x)).toEqual(finalState.x);
    expect(Math.round(state.y)).toEqual(finalState.y);
    expect(Math.round(state.hSpeed)).toEqual(finalState.hSpeed);
    expect(Math.round(state.vSpeed)).toEqual(finalState.vSpeed);
    expect(state.fuel).toEqual(finalState.fuel);
    expect(state.rotationAngle).toEqual(finalState.rotationAngle);
    expect(state.thrustPower).toEqual(finalState.thrustPower);
  });

  it("should be crashed after 38 turns", () => {
    const move = {
      rotationAngle: 0,
      thrustPower: 0,
    };

    const finalState = {
      x: 2500,
      // set the final point at the end-of-turn point, not when the ship touching the terrain
      // TODO: change this later if updating the simulator to return touching point
      y: 21,
      hSpeed: 0,
      vSpeed: -141,
      fuel: 550,
      rotationAngle: 0,
      thrustPower: 0,
    };

    const moveList = Array.from({ length: 38 }, () => ({ ...move }));

    const { state, status } = simulate(
      initialState,
      moveList,
      terrain,
      landingZone,
    );
    expect(status).toEqual(ShipStatus.CRASHED);

    expect(Math.round(state.x)).toEqual(finalState.x);
    expect(Math.round(state.y)).toEqual(finalState.y);
    expect(Math.round(state.hSpeed)).toEqual(finalState.hSpeed);
    expect(Math.round(state.vSpeed)).toEqual(finalState.vSpeed);
    expect(state.fuel).toEqual(finalState.fuel);
    expect(state.rotationAngle).toEqual(finalState.rotationAngle);
    expect(state.thrustPower).toEqual(finalState.thrustPower);
  });

  it("should be crashed early when it hitting the terrain", () => {
    const move = {
      rotationAngle: 0,
      thrustPower: 0,
    };

    const finalState = {
      x: 2500,
      // set the final point at the end-of-turn point, not when the ship touching the terrain
      // TODO: change this later if updating the simulator to return touching point
      y: 19,
      hSpeed: 0,
      vSpeed: -142,
      fuel: 550,
      rotationAngle: 0,
      thrustPower: 0,
    };

    const moveList = Array.from({ length: 38 }, () => ({ ...move }));

    const { state, status } = simulate(
      { ...initialState, vSpeed: -20 },
      moveList,
      terrain,
      landingZone,
    );

    // it should be crashed at turn 33 because of hitting the terrain
    expect(status).toEqual(ShipStatus.CRASHED);

    expect(Math.round(state.x)).toEqual(finalState.x);
    expect(Math.round(state.y)).toEqual(finalState.y);
    expect(Math.round(state.hSpeed)).toEqual(finalState.hSpeed);
    expect(Math.round(state.vSpeed)).toEqual(finalState.vSpeed);
    expect(state.fuel).toEqual(finalState.fuel);
    expect(state.rotationAngle).toEqual(finalState.rotationAngle);
    expect(state.thrustPower).toEqual(finalState.thrustPower);
  });
});
