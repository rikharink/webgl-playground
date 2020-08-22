export type Rgba = [number, number, number, number];

export function randomNormalizedRgba(rng?: () => number, alpha?: number): Rgba {
    rng = rng ?? Math.random;
    return [rng(), rng(), rng(), alpha ?? 1];
}

export function warmColor(rng?: () => number, alpha?: number): Rgba {
    rng = rng ?? Math.random;
    const red = Math.min(1, rng() + 0.6);
    const blue = rng() * 0.6;
    const green = rng();
    return [red, blue, green, alpha ?? 1];
}

export function coolColor(rng?: () => number, alpha?: number): Rgba {
    rng = rng ?? Math.random;
    const red = rng() * 0.6;
    const blue = Math.min(1, rng() + 0.6);
    const green = rng();
    return [red, blue, green, alpha ?? 1];
}

let debug: HTMLDivElement | undefined;
let avgFPS = 60;
let alpha = 0.9;
let dt = 0;
let fpsText = "";

export function updateDebugInfo(deltaTime: number, gl: WebGLRenderingContext) {
  if (!debug) {
    debug = document.createElement("div");
    debug.id = "debug";
    debug.style.position = "absolute";
    debug.style.top = "8px";
    debug.style.left = "8px";
    debug.style.backgroundColor = "#FFFFFFD0";
    debug.style.border = "2px solid black";
    debug.style.borderRadius = "4px";
    debug.style.padding = "16px 16px";

    document.body.appendChild(debug);
  }
  dt += deltaTime;
  avgFPS = alpha * avgFPS + (1.0 - alpha) * (1 / deltaTime);
  if (dt > 1) {
    dt = 0;
    fpsText = `${avgFPS.toFixed(1)} fps`;
  }
  debug.innerText = `${fpsText}`;
}