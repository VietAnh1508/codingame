// Copied from Codingame

import { findLandingZone } from "./environment";
import { Point, Ship } from "./types";

const N: number = parseInt(readline()); // the number of points used to draw the surface of Mars.
const terrain: Point[] = [];
for (let i = 0; i < N; i++) {
  var inputs: string[] = readline().split(" ");
  const landX: number = parseInt(inputs[0]!); // X coordinate of a surface point. (0 to 6999)
  const landY: number = parseInt(inputs[1]!); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
  terrain.push({ x: landX, y: landY });
}

const landingZone = findLandingZone(terrain);

// game loop
while (true) {
  var inputs: string[] = readline().split(" ");
  const X: number = parseInt(inputs[0]!);
  const Y: number = parseInt(inputs[1]!);
  const HS: number = parseInt(inputs[2]!); // the horizontal speed (in m/s), can be negative.
  const VS: number = parseInt(inputs[3]!); // the vertical speed (in m/s), can be negative.
  const F: number = parseInt(inputs[4]!); // the quantity of remaining fuel in liters.
  const R: number = parseInt(inputs[5]!); // the rotation angle in degrees (-90 to 90).
  const P: number = parseInt(inputs[6]!); // the thrust power (0 to 4).

  const ship: Ship = {
    x: X,
    y: Y,
    vSpeed: VS,
    hSpeed: HS,
    fuel: F,
    rotationAngle: R,
    thrustPower: P,
  };

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');

  // R P. R is the desired rotation angle. P is the desired thrust power.
  console.log("-20 3");
}

