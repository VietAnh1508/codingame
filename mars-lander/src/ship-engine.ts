import {
  GRAVITY,
  MAX_ROTATION_ANGLE,
  MAX_ROTATION_ANGLE_PER_TURN,
  MAX_THRUST_POWER,
  MAX_THRUST_POWER_PER_TURN,
  MIN_THRUST_POWER,
} from "./constants";
import { Move, Ship } from "./types";

export function calculateNextState(ship: Ship, move: Move): Ship {
  const newRotationAngle = rotateAngle(ship.rotationAngle, move.rotationAngle);

  const newThrustPower = changeThrustPower(
    ship.thrustPower,
    move.thrustPower,
    ship.fuel,
  );

  const horizontalAcceleration = calculateHorizontalAcceleration(
    newRotationAngle,
    newThrustPower,
  );
  const verticalAcceleration = calculateVerticalAcceleration(
    newRotationAngle,
    newThrustPower,
  );

  const newHSpeed = ship.hSpeed + horizontalAcceleration;
  const newVSpeed = ship.vSpeed + verticalAcceleration;

  const nextX = calculateNextPosition(
    ship.x,
    ship.hSpeed,
    horizontalAcceleration,
  );
  const nextY = calculateNextPosition(
    ship.y,
    ship.vSpeed,
    verticalAcceleration,
  );

  const newFuel = Math.max(0, ship.fuel - newThrustPower);

  return {
    hSpeed: newHSpeed,
    vSpeed: newVSpeed,
    x: nextX,
    y: nextY,
    fuel: newFuel,
    rotationAngle: newRotationAngle,
    thrustPower: newThrustPower,
  };
}

export function rotateAngle(currentAngle: number, targetAngle: number): number {
  let finalAngle = changeControlValue(
    currentAngle,
    targetAngle,
    MAX_ROTATION_ANGLE_PER_TURN,
  );

  if (Math.abs(finalAngle) > MAX_ROTATION_ANGLE) {
    finalAngle = MAX_ROTATION_ANGLE * Math.sign(finalAngle);
  }
  return finalAngle;
}

export function changeThrustPower(
  currentPower: number,
  targetPower: number,
  fuel: number,
): number {
  if (fuel === 0) {
    return 0;
  }

  let finalPower = changeControlValue(
    currentPower,
    targetPower,
    MAX_THRUST_POWER_PER_TURN,
  );

  if (finalPower >= MAX_THRUST_POWER) {
    finalPower = MAX_THRUST_POWER;
  } else if (finalPower <= MIN_THRUST_POWER) {
    finalPower = MIN_THRUST_POWER;
  }

  return finalPower;
}

function changeControlValue(
  currentValue: number,
  targetValue: number,
  maxChangePerTurn: number,
): number {
  const difference = targetValue - currentValue;
  if (Math.abs(difference) <= maxChangePerTurn) {
    return targetValue;
  }
  return currentValue + Math.sign(difference) * maxChangePerTurn;
}

export function calculateVerticalAcceleration(
  rotateAngle: number,
  thrustPower: number,
): number {
  return Math.cos(degToRad(rotateAngle)) * thrustPower - GRAVITY;
}

export function calculateHorizontalAcceleration(
  rotateAngle: number,
  thrustPower: number,
): number {
  return -Math.sin(degToRad(rotateAngle)) * thrustPower;
}

function degToRad(degrees: number) {
  return degrees * (Math.PI / 180);
}

function calculateNextPosition(
  currentPosition: number,
  speed: number,
  acceleration: number,
): number {
  return currentPosition + (speed + acceleration / 2);
}
