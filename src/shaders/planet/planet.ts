import vert from "./planet.vert";
import frag from "./planet.frag";

import { createProgramInfo, ProgramInfo, createBufferInfoFromArrays, resizeCanvasToDisplaySize, setBuffersAndAttributes, setUniforms, drawBufferInfo, FramebufferInfo } from "twgl.js";
import { Rgba, randomNormalizedRgba, updateDebugInfo } from "util";

export function getPlanetShader(gl: WebGLRenderingContext): ProgramInfo {
  return createProgramInfo(gl, [vert, frag]);
}

export interface PlanetUniforms {
  u_resolution: [number, number];
  u_scale: number;
  u_offset: number;
  u_landscale: number;
  u_cloudscale: number;
  u_landstart: Rgba;
  u_landstop: Rgba;
  u_oceanstart: Rgba;
  u_oceanstop: Rgba;
  u_cloudcolor: Rgba;
  u_landthreshold: number;
  u_cloudthreshold: number;
  u_rotation: [number, number];
  u_backgroundcolor: Rgba;
  u_time: number;
  u_mouse: [number, number];
}

export function getPlanetRenderer(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, source?: FramebufferInfo, destination?: FramebufferInfo): (now: number) => void {
  const planetShader = getPlanetShader(gl);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };
  const bufferInfo = createBufferInfoFromArrays(gl, arrays);
  const smoothScale = Math.random() * 0.09;
  const isSmooth = Math.random() < 0.1;
  const isEarth = !isSmooth && Math.random() < 0.1;
  const planetUniforms: PlanetUniforms = {
    u_resolution: [gl.canvas.width, gl.canvas.height],
    u_scale: !isSmooth ? Math.random() * 5 : smoothScale,
    u_offset: Math.random() * 8,
    u_landscale: !isSmooth ? Math.random() * 1.2 : smoothScale,
    u_cloudscale: !isSmooth ? Math.random() * 3 : smoothScale,
    u_landstart: !isEarth ? randomNormalizedRgba() : [0.607, 0.639, 0.482, 1],
    u_landstop: !isEarth ? randomNormalizedRgba() : [0.223, 0.282, 0.137, 1],
    u_oceanstart: !isEarth ? randomNormalizedRgba() : [0.117, 0.235, 0.447, 1],
    u_oceanstop: !isEarth ? randomNormalizedRgba() : [0.164, 0.321, 0.596, 1],
    u_cloudcolor: !isEarth ? randomNormalizedRgba() : [1, 1, 1, 1],
    u_landthreshold: 0.5,
    u_cloudthreshold: 0.6,
    u_rotation: [5, 5],
    u_backgroundcolor: [0, 0, 0, 0],
    u_time: 0,
    u_mouse: [0, 0],
  };

  let then = 0;

  const Mouse = {
    x: 0,
    y: 0,
  };

  document.body.addEventListener("mousemove", (evt) => {
    const rect = canvas.getBoundingClientRect();
    Mouse.x = evt.clientX - rect.left;
    Mouse.y = rect.height - (evt.clientY - rect.top) - 1;
    // console.log([Mouse.x / gl.canvas.width * 2 * Math.PI, Mouse.y / gl.canvas.height * 2 * Math.PI]);
  });

  return function renderloop(now: number) {
    resizeCanvasToDisplaySize(canvas);
    now *= 0.001;
    const deltaTime = now - then;
    then = now;
    updateDebugInfo(deltaTime, gl);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    planetUniforms.u_resolution = [gl.canvas.width, gl.canvas.height];
    planetUniforms.u_time = now;
    planetUniforms.u_mouse = [Mouse.x, Mouse.y];
    gl.useProgram(planetShader.program);
    setBuffersAndAttributes(gl, planetShader, bufferInfo);
    setUniforms(planetShader, planetUniforms);
    drawBufferInfo(gl, bufferInfo);
    requestAnimationFrame(renderloop);
  }
}
