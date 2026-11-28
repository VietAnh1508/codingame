export type Point = {
  x: number;
  y: number;
};

export type LineSegment = {
  start: Point;
  end: Point;
};

export type LandingZone = LineSegment;

export type Ship = {
  x: number;
  y: number;
  hSpeed: number;
  vSpeed: number;
  fuel: number;
  rotationAngle: number;
  thrustPower: number;
};

export type Move = {
  rotationAngle: number;
  thrustPower: number;
};

export enum ShipStatus {
  FLYING,
  CRASHED,
  LANDED,
}

export type SimulationResult = {
  state: Ship;
  status: ShipStatus;
};

export type TraceStep = {
  step: number; // 0 = start, k = state after k moves
  ship: Ship;
  status: ShipStatus;
};
