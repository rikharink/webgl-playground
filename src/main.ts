import "./style/main.css";
import { getPlanetRenderer } from "./shaders/planet/planet";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const gl = canvas.getContext("webgl")!;

const planetRenderer = getPlanetRenderer(gl, canvas);
requestAnimationFrame(planetRenderer);