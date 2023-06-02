import { Color, RenderContext } from "@wwtelescope/engine";

declare module "@wwtelescope/engine" {
  export class Grids {
    static drawAltAzGrid(renderContext: RenderContext, opacity: number, drawColor: Color): void;
    static _makeAltAzGridText(): void;
    static _altAzTextBatch: Text3dBatch | null;
  }

  export class Text3dBatch {
    constructor(height: number);
    add(text: Text3d): void;
    draw(renderContext: RenderContext, opacity: number, color: Color): void;
  }

  export class Text3d {
    constructor(center: Vector3d, up: Vector3d, text: string, fontsize: number, scale: number);
  }

  export class Vector3d {
    static create(x: number, y: number, z: number): Vector3d;
  }

  export class Texture {}

  export class PushPin {
    static getPushPinTexture(pinId: number): Texture;
  }

  export class Coordinates {
    static raDecTo3d(ra: number, dec: number): Vector3d;
  }

}
