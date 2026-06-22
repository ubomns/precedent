import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
import { Scene } from "three/src/scenes/Scene.js";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { BufferAttribute } from "three/src/core/BufferAttribute.js";
import { Points } from "three/src/objects/Points.js";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial.js";
import { Clock } from "three/src/core/Clock.js";
import { AdditiveBlending } from "three/src/constants.js";

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aAngle;
  attribute float aOpacity;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    // Drift upward and outward from the center. The loop length (20s) is long
    // enough to feel ambient rather than mechanical.
    float t = mod(uTime * aSpeed, 20.0);
    vec3 pos = position;
    pos.y += t * 0.35;
    pos.x += cos(aAngle) * t * 0.18;
    pos.z += sin(aAngle) * t * 0.18;

    // Wrap particles back down so the field never empties.
    if (pos.y > 6.0) {
      pos.y -= 12.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Size attenuation: farther particles shrink. Coefficient tuned for a
    // camera at z ~= 8 looking at the origin.
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = aOpacity;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    // Hard discard outside the particle circle, then soft alpha falloff.
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

    // Desaturated emerald-white. Kept in shader to avoid a texture upload.
    gl_FragColor = vec4(0.88, 0.96, 0.92, alpha);
  }
`;

export interface HeroSceneHandle {
  dispose: () => void;
  pause: () => void;
  resume: () => void;
}

export interface CreateHeroSceneOptions {
  /** Max device pixel ratio. Default 2. */
  dpr?: number;
  /** Particle count. Capped at 200 by the design spec. */
  maxParticles?: number;
}

/**
 * Create an ambient particle-field scene.
 *
 * Responsibilities:
 * - single draw call via THREE.Points
 * - capped DPR
 * - resize handling
 * - full disposal on teardown
 *
 * No React code lives here so it can be unit-tested or reused by any framework.
 */
export function createHeroScene(
  canvas: HTMLCanvasElement,
  options: CreateHeroSceneOptions = {}
): HeroSceneHandle {
  const maxParticles = Math.min(options.maxParticles ?? 200, 200);
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
    options.dpr ?? 2
  );

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "default",
  });
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 8;

  const geometry = new BufferGeometry();

  const positions = new Float32Array(maxParticles * 3);
  const sizes = new Float32Array(maxParticles);
  const speeds = new Float32Array(maxParticles);
  const angles = new Float32Array(maxParticles);
  const opacities = new Float32Array(maxParticles);

  for (let i = 0; i < maxParticles; i++) {
    const i3 = i * 3;
    // Spread particles across a wide XY plane with mild Z depth.
    positions[i3] = (Math.random() - 0.5) * 12;
    positions[i3 + 1] = (Math.random() - 0.5) * 12;
    positions[i3 + 2] = (Math.random() - 0.5) * 3;

    sizes[i] = 2 + Math.random() * 5;
    speeds[i] = 0.15 + Math.random() * 0.55;
    angles[i] = Math.random() * Math.PI * 2;
    opacities[i] = 0.3 + Math.random() * 0.3;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
  geometry.setAttribute("aAngle", new BufferAttribute(angles, 1));
  geometry.setAttribute("aOpacity", new BufferAttribute(opacities, 1));

  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });

  const points = new Points(geometry, material);
  scene.add(points);

  const clock = new Clock();
  let running = true;
  let rafId = 0;

  function resize() {
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function tick() {
    if (!running) return;

    material.uniforms.uTime.value += clock.getDelta();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    clock.stop();
  }

  function resume() {
    if (running) return;
    running = true;
    clock.start();
    tick();
  }

  function dispose() {
    pause();
    window.removeEventListener("resize", resize);

    geometry.dispose();
    material.dispose();
    renderer.dispose();

    // Release WebGL context so the browser can reclaim it.
    const gl = renderer.getContext();
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) {
      loseContext.loseContext();
    }
  }

  resize();
  window.addEventListener("resize", resize);
  clock.start();
  tick();

  return { dispose, pause, resume };
}
