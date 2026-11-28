import { checkShipStatus } from "./environment";
import { calculateNextState } from "./ship-engine";
import {
  LandingZone,
  Move,
  Point,
  Ship,
  ShipStatus,
  SimulationResult,
  TraceStep,
} from "./types";

export function simulate(
  ship: Ship,
  moveList: Move[],
  terrain: Point[],
  landingZone: LandingZone,
  onStep?: (traceStep: TraceStep) => void,
): SimulationResult {
  let currentState: Ship = { ...ship };
  let shipStatus = ShipStatus.FLYING;
  onStep?.({ step: 0, ship: currentState, status: shipStatus });

  for (const [i, move] of moveList.entries()) {
    const nextState = calculateNextState(currentState, move);
    shipStatus = checkShipStatus(currentState, nextState, terrain, landingZone);

    if (shipStatus !== ShipStatus.FLYING) {
      onStep?.({ step: i + 1, ship: nextState, status: shipStatus });

      // TODO: return the touching point instead of the end-of-turn point
      return {
        state: nextState,
        status: shipStatus,
      };
    }

    currentState = nextState;
    onStep?.({ step: i + 1, ship: currentState, status: shipStatus });
  }

  return {
    state: currentState,
    status: shipStatus,
  };
}
