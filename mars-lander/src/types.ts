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
