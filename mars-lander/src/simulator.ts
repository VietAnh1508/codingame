import { checkShipStatus } from "./environment";
import { calculateNextState } from "./ship-engine";
import {
  LandingZone,
  Move,
  Point,
  Ship,
  ShipStatus,
  SimulationResult,
} from "./types";

export function simulate(
  ship: Ship,
  moveList: Move[],
  terrain: Point[],
  landingZone: LandingZone,
): SimulationResult {
  let currentState: Ship = { ...ship };
  let shipStatus = ShipStatus.FLYING;

  for (const move of moveList) {
    const nextState = calculateNextState(currentState, move);
    shipStatus = checkShipStatus(currentState, nextState, terrain, landingZone);

    if (shipStatus !== ShipStatus.FLYING) {
      // TODO: return the touching point instead of the end-of-turn point
      return {
        state: nextState,
        status: shipStatus,
      };
    }

    currentState = nextState;
  }

  return {
    state: currentState,
    status: shipStatus,
  };
}

