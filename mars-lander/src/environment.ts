import {
  MAP_BOTTOM_BORDER,
  MAP_LEFT_BORDER,
  MAP_RIGHT_BORDER,
  MAP_TOP_BORDER,
  SAFE_HORIZONTAL_SPEED,
  SAFE_VERTICAL_SPEED,
} from "./constants";
import { LandingZone, Point, Ship, ShipStatus } from "./types";

export function findLandingZone(terrain: Point[]): LandingZone {
  let landingZoneStart: Point | null = null;
  let landingZoneEnd: Point | null = null;

  for (let i = 0; i < terrain.length - 1; i++) {
    const currentPoint = terrain[i];
    const nextPoint = terrain[i + 1];
    if (!currentPoint || !nextPoint) {
      continue;
    }

    if (currentPoint.y === nextPoint.y) {
      landingZoneStart = currentPoint;
      landingZoneEnd = nextPoint;
      break;
    }
  }

  if (!landingZoneStart || !landingZoneEnd) {
    throw new Error("No landing zone found in the terrain.");
  }

  return { start: landingZoneStart, end: landingZoneEnd };
}

export function checkShipStatus(
  curShipState: Ship,
  newShipState: Ship,
  terrain: Point[],
  landingZone: LandingZone,
): ShipStatus {
  if (isShipFlyOffTheMap(newShipState)) {
    return ShipStatus.CRASHED;
  }

  if (doesShipHitTerrain(curShipState, newShipState, terrain)) {
    return getLandOrCrashStatus(curShipState, newShipState, landingZone);
  }

  return ShipStatus.FLYING;
}

export function isShipFlyOffTheMap({ x, y }: Ship): boolean {
  // TODO: not sure if x=6999.5 is off the border or not, to check later
  return (
    x < MAP_LEFT_BORDER ||
    x > MAP_RIGHT_BORDER ||
    y < MAP_BOTTOM_BORDER ||
    y > MAP_TOP_BORDER
  );
}

export function getLandOrCrashStatus(
  curShipState: Ship,
  newShipState: Ship,
  landingZone: LandingZone,
): ShipStatus {
  const curShipPos = getShipPosition(curShipState);
  const newShipPos = getShipPosition(newShipState);

  // TODO: can be improved by checking the speeds when the ship actually touches the ground
  if (
    doSegmentsTouch(
      curShipPos,
      newShipPos,
      landingZone.start,
      landingZone.end,
    ) &&
    newShipState.rotationAngle === 0 &&
    Math.abs(newShipState.hSpeed) <= SAFE_HORIZONTAL_SPEED &&
    Math.abs(newShipState.vSpeed) <= SAFE_VERTICAL_SPEED
  ) {
    return ShipStatus.LANDED;
  }

  return ShipStatus.CRASHED;
}

function doesShipHitTerrain(
  curShipState: Ship,
  newShipState: Ship,
  terrain: Point[],
): boolean {
  const oldShipPos = getShipPosition(curShipState);
  const newShipPos = getShipPosition(newShipState);

  for (let i = 0; i < terrain.length - 1; i++) {
    const currentPoint = terrain[i];
    const nextPoint = terrain[i + 1];
    if (!currentPoint || !nextPoint) {
      continue;
    }

    if (doSegmentsTouch(oldShipPos, newShipPos, currentPoint, nextPoint)) {
      return true;
    }
  }
  return false;
}

function doSegmentsTouch(a1: Point, a2: Point, b1: Point, b2: Point) {
  return (
    areSegmentsStraddling(a1, a2, b1, b2) &&
    doBoundingBoxesOverlap(a1, a2, b1, b2)
  );
}

function areSegmentsStraddling(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point,
): boolean {
  const d1 = direction(b1, b2, a1);
  const d2 = direction(b1, b2, a2);
  const d3 = direction(a1, a2, b1);
  const d4 = direction(a1, a2, b2);

  return d1 * d2 <= 0 && d3 * d4 <= 0;
}

function direction(A: Point, B: Point, C: Point): number {
  return (C.x - A.x) * (B.y - A.y) - (B.x - A.x) * (C.y - A.y);
}

function doBoundingBoxesOverlap(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point,
): boolean {
  const xOverlap =
    Math.max(a1.x, a2.x) >= Math.min(b1.x, b2.x) &&
    Math.max(b1.x, b2.x) >= Math.min(a1.x, a2.x);
  const yOverlap =
    Math.max(a1.y, a2.y) >= Math.min(b1.y, b2.y) &&
    Math.max(b1.y, b2.y) >= Math.min(a1.y, a2.y);

  return xOverlap && yOverlap;
}

function getShipPosition({ x, y }: Ship): Point {
  return { x, y };
}
