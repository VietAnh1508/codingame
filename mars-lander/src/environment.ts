import {
  MAP_HEIGHT,
  MAP_WIDTH,
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
  ship: Ship,
  startPos: Point,
  endPos: Point,
  terrain: Point[],
  landingZone: LandingZone,
): ShipStatus {
  if (isShipFlyOffTheMap(endPos)) {
    return ShipStatus.CRASHED;
  }

  if (isShipClashOnTheTerrain(startPos, endPos, terrain)) {
    return getLandOrCrashStatus(ship, startPos, endPos, landingZone);
  }

  return ShipStatus.FLYING;
}

export function isShipFlyOffTheMap({ x, y }: Point): boolean {
  return x < 0 || x > MAP_WIDTH || y < 0 || y > MAP_HEIGHT;
}

export function getLandOrCrashStatus(
  ship: Ship,
  startPos: Point,
  endPos: Point,
  landingZone: LandingZone,
): ShipStatus {
  if (
    areSegmentsIntersect(
      startPos,
      endPos,
      landingZone.start,
      landingZone.end,
    ) &&
    ship.rotationAngle === 0 &&
    Math.abs(ship.hSpeed) <= SAFE_HORIZONTAL_SPEED &&
    Math.abs(ship.vSpeed) <= SAFE_VERTICAL_SPEED
  ) {
    return ShipStatus.LANDED;
  }

  return ShipStatus.CRASHED;
}

function isShipClashOnTheTerrain(
  shipCurPos: Point,
  shipNextPos: Point,
  terrain: Point[],
): boolean {
  for (let i = 0; i < terrain.length - 1; i++) {
    const currentPoint = terrain[i];
    const nextPoint = terrain[i + 1];
    if (!currentPoint || !nextPoint) {
      continue;
    }

    if (
      areSegmentsIntersect(shipCurPos, shipNextPos, currentPoint, nextPoint)
    ) {
      return true;
    }
  }
  return false;
}

function areSegmentsIntersect(
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

function direction(pi: Point, pj: Point, pk: Point): number {
  return (pk.x - pi.x) * (pj.y - pi.y) - (pj.x - pi.x) * (pk.y - pi.y);
}

