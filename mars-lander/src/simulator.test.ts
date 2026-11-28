import { describe, expect, it } from "vitest";
import { findLandingZone } from "./environment";
import { simulate } from "./simulator";
import { Point, Ship, ShipStatus, TraceStep } from "./types";

const COMPARED_DECIMAL_PLACE = 0; // CodinGame shows values in integer

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

    assertResult(state, finalState);
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

    assertResult(state, finalState);
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

    assertResult(state, finalState);
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

    assertResult(state, finalState);
  });

  it("should record the trace in 10 turns", () => {
    const move = {
      rotationAngle: -20,
      thrustPower: 3,
    };

    const planMoves = 10;
    const moveList = Array.from({ length: planMoves }, () => ({ ...move }));

    const trace: TraceStep[] = [];
    const { state, status } = simulate(
      initialState,
      moveList,
      terrain,
      landingZone,
      (traceStep) => trace.push(traceStep),
    );
    expect(status).toEqual(ShipStatus.FLYING);

    expect(trace.map((t) => t.step)).toEqual(
      Array.from({ length: planMoves + 1 }).map((_, i) => i),
    );
    expect(trace[0]?.ship).toEqual(initialState);
    expect(trace.at(-1)?.status).toEqual(status);
    expect(trace.at(-1)?.ship).toEqual(state);
  });

  it("should record the trace when crashed", () => {
    const move = {
      rotationAngle: 0,
      thrustPower: 0,
    };

    const firstState = {
      ...initialState,
      vSpeed: -20,
    };

    const moveList = Array.from({ length: 38 }, () => ({ ...move }));

    const trace: TraceStep[] = [];
    const { state, status } = simulate(
      firstState,
      moveList,
      terrain,
      landingZone,
      (traceStep) => trace.push(traceStep),
    );

    // it should be crashed at turn 33 because of hitting the terrain
    expect(status).toEqual(ShipStatus.CRASHED);

    const crashTurn = 33;
    expect(trace.map((t) => t.step)).toEqual(
      Array.from({ length: crashTurn + 1 }).map((_, i) => i),
    );
    expect(trace[0]?.ship).toEqual(firstState);
    expect(trace.at(-1)?.status).toEqual(status);
    expect(trace.at(-1)?.ship).toEqual(state);
  });
});

function assertResult(actual: Ship, expected: Ship) {
  expect(actual.x).toBeCloseTo(expected.x, COMPARED_DECIMAL_PLACE);
  expect(actual.y).toBeCloseTo(expected.y, COMPARED_DECIMAL_PLACE);
  expect(actual.hSpeed).toBeCloseTo(expected.hSpeed, COMPARED_DECIMAL_PLACE);
  expect(actual.vSpeed).toBeCloseTo(expected.vSpeed, COMPARED_DECIMAL_PLACE);
  expect(actual.fuel).toEqual(expected.fuel);
  expect(actual.rotationAngle).toEqual(expected.rotationAngle);
  expect(actual.thrustPower).toEqual(expected.thrustPower);
}
