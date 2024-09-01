import { Coord } from "@/app/lib/definitions";

export function pointToCoord(str: string): Coord {
  if (str === undefined || str === "") return { longitude: -99, latitude: -99 };

  const coordsMatch = str.match(/Point\((-?[0-9\.]*)\ (-?[0-9\.]*)\)/) ?? [
    0, 0, 0,
  ];
  const coord: Coord = {
    longitude: Number(coordsMatch[1]),
    latitude: Number(coordsMatch[2]),
  };

  return coord;
}

export function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
