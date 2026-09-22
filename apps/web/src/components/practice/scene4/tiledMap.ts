// Small, pure helpers for reading Tiled (.tmj) map JSON: locating a named
// object on a named layer, reading a custom property off an object, and
// testing whether a point falls inside an object's rectangle. Extracted out
// of CommuteGame.tsx because none of this depends on scene/game state.

export interface TiledProperty {
  name: string;
  value: unknown;
}

export interface TiledObject {
  id: number;
  name: string;
  properties?: TiledProperty[];
  height?: number;
  width?: number;
  x: number;
  y: number;
}

export interface TiledLayer {
  name: string;
  objects?: TiledObject[];
}

export interface Scene4MapData {
  height: number;
  layers: TiledLayer[];
  properties?: TiledProperty[];
  tileheight: number;
  tilewidth: number;
  width: number;
}

export function propertyValue(object: TiledObject | undefined, name: string) {
  return object?.properties?.find((property) => property.name === name)?.value;
}

export function objectByName(
  map: Scene4MapData,
  layerName: string,
  objectName: string,
) {
  return map.layers
    .find((layer) => layer.name === layerName)
    ?.objects?.find((object) => object.name === objectName);
}

export function containsPoint(
  object: TiledObject | undefined,
  x: number,
  y: number,
) {
  if (!object) return false;
  return (
    x >= object.x &&
    x <= object.x + (object.width ?? 0) &&
    y >= object.y &&
    y <= object.y + (object.height ?? 0)
  );
}
