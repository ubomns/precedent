import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
import { Scene } from "three/src/scenes/Scene.js";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { BufferAttribute } from "three/src/core/BufferAttribute.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { Group } from "three/src/objects/Group.js";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial.js";
import { Clock } from "three/src/core/Clock.js";
import { AdditiveBlending, DoubleSide } from "three/src/constants.js";

/**
 * Document-assembly hero scene.
 *
 * Narrates what Precedent does: faint "section rows" of a Business Requirements
 * Document draw in left-to-right and top-to-bottom (the drafter assembling 12
 * sections), then an emerald scan-line begins sweeping and tinting the row it
 * crosses (the critic reviewing). Restrained per DESIGN.md — emerald appears only
 * on the active scan row; every other line is a low-alpha desaturated white.
 *
 * No React lives here so it can be reused / unit-tested by any framework.
 */

const VERTEX_SHADER = /* glsl */ `
  attribute float aLeftX;       // row left edge (normalized x)
  attribute float aRowY;        // row centre (normalized y)
  attribute float aEdge;        // -1 bottom, +1 top (across thickness)
  attribute float aRevealStart; // seconds before this row begins drawing in
  attribute float aOpacity;     // base alpha for this row

  uniform float uTime;
  uniform float uScanY;
  uniform float uScanHalf;

  varying float vAlpha;
  varying float vActive;
  varying float vEdge;

  void main() {
    // Draw-in: the right edge grows out from the fixed left edge over REVEAL_DUR.
    float reveal = clamp((uTime - aRevealStart) / 0.7, 0.0, 1.0);
    reveal = reveal * reveal * (3.0 - 2.0 * reveal); // smoothstep ease

    vec3 p = position;
    p.x = aLeftX + (position.x - aLeftX) * reveal;

    vAlpha = aOpacity * reveal;
    vActive = smoothstep(uScanHalf, 0.0, abs(aRowY - uScanY));
    vEdge = aEdge;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform float uScanGain; // 0 until the critic scan begins, then 1

  varying float vAlpha;
  varying float vActive;
  varying float vEdge;

  void main() {
    // Soft top/bottom falloff so each line reads as a printed rule, not a hard bar.
    float edge = smoothstep(1.0, 0.4, abs(vEdge));

    vec3 paper = vec3(0.86, 0.95, 0.91);   // desaturated emerald-white
    vec3 emerald = vec3(0.063, 0.725, 0.506); // #10B981

    // NB: 'active' is a reserved word in GLSL ES — keep this named otherwise.
    float scanMix = vActive * uScanGain;
    vec3 col = mix(paper, emerald, scanMix * 0.9);
    float a = (vAlpha + scanMix * 0.14) * edge;

    if (a < 0.002) discard;
    gl_FragColor = vec4(col, a);
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
  /** Retained for API compatibility with the previous particle scene; unused. */
  maxParticles?: number;
}

// Vertical band the document occupies (normalized; scaled to world on resize).
const PAGE_TOP = 0.92;
const SCAN_PERIOD = 9.0; // seconds for one top→bottom→top sweep
const SCAN_DELAY = 3.0; // critic scan starts after the draft has mostly assembled

interface Row {
  leftX: number;
  width: number;
  y: number;
  halfH: number;
  opacity: number;
  revealStart: number;
}

/** Deterministic 0..1 generator so the layout looks identical on every load. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** Build the 12-section document outline as a list of rule rows. */
function buildRows(): Row[] {
  const rng = makeRng(20260624);
  const rows: Row[] = [];
  const lineGap = 0.03;
  const sectionGap = 0.036;
  let y = PAGE_TOP;
  let order = 0;

  for (let section = 0; section < 12; section++) {
    // Heading rule: shorter, less indented, brighter. leftX is biased toward
    // centre so the column sits balanced behind the centred headline.
    rows.push({
      leftX: -0.55,
      width: 0.34 + rng() * 0.22,
      y,
      halfH: 0.013,
      opacity: 0.6,
      revealStart: order * 0.14,
    });
    order += 1;
    y -= lineGap * 1.5;

    // Two body rules: longer, slightly indented, dimmer.
    for (let b = 0; b < 2; b++) {
      rows.push({
        leftX: -0.49,
        width: 0.66 + rng() * 0.3,
        y,
        halfH: 0.008,
        opacity: 0.34,
        revealStart: order * 0.14,
      });
      order += 1;
      y -= lineGap;
    }
    y -= sectionGap;
  }
  return rows;
}

export function createHeroScene(
  canvas: HTMLCanvasElement,
  options: CreateHeroSceneOptions = {}
): HeroSceneHandle {
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
    options.dpr ?? 2
  );

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "default",
  });
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 7;

  // The document lives in normalized [-1,1] space; the group is scaled to world
  // units on resize so the same geometry fits any viewport.
  const group = new Group();
  scene.add(group);

  const rows = buildRows();
  const vertsPerRow = 4;
  const totalVerts = rows.length * vertsPerRow;

  const positions = new Float32Array(totalVerts * 3);
  const leftXs = new Float32Array(totalVerts);
  const rowYs = new Float32Array(totalVerts);
  const edges = new Float32Array(totalVerts);
  const revealStarts = new Float32Array(totalVerts);
  const opacities = new Float32Array(totalVerts);
  const indices = new Uint16Array(rows.length * 6);

  rows.forEach((row, r) => {
    const v0 = r * vertsPerRow;
    const rightX = row.leftX + row.width;
    const top = row.y + row.halfH;
    const bot = row.y - row.halfH;

    // 0:left-bottom 1:right-bottom 2:right-top 3:left-top
    const corners = [
      [row.leftX, bot, -1],
      [rightX, bot, -1],
      [rightX, top, 1],
      [row.leftX, top, 1],
    ];
    corners.forEach(([x, y, e], c) => {
      const vi = v0 + c;
      positions[vi * 3] = x;
      positions[vi * 3 + 1] = y;
      positions[vi * 3 + 2] = 0;
      leftXs[vi] = row.leftX;
      rowYs[vi] = row.y;
      edges[vi] = e;
      revealStarts[vi] = row.revealStart;
      opacities[vi] = row.opacity;
    });

    const i0 = r * 6;
    indices[i0] = v0;
    indices[i0 + 1] = v0 + 1;
    indices[i0 + 2] = v0 + 2;
    indices[i0 + 3] = v0;
    indices[i0 + 4] = v0 + 2;
    indices[i0 + 5] = v0 + 3;
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aLeftX", new BufferAttribute(leftXs, 1));
  geometry.setAttribute("aRowY", new BufferAttribute(rowYs, 1));
  geometry.setAttribute("aEdge", new BufferAttribute(edges, 1));
  geometry.setAttribute("aRevealStart", new BufferAttribute(revealStarts, 1));
  geometry.setAttribute("aOpacity", new BufferAttribute(opacities, 1));
  geometry.setIndex(new BufferAttribute(indices, 1));

  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uScanY: { value: PAGE_TOP },
      uScanHalf: { value: 0.07 },
      uScanGain: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });

  const mesh = new Mesh(geometry, material);
  group.add(mesh);

  const clock = new Clock();
  let time = 0;
  let running = true;
  let rafId = 0;

  function resize() {
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Fit the normalized page into the visible frustum at z=0.
    const visibleHalfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const visibleHalfW = visibleHalfH * camera.aspect;
    const halfH = visibleHalfH * 0.82;
    const halfW = Math.min(visibleHalfW * 0.92, halfH * 1.55);
    group.scale.set(halfW, halfH, 1);
  }

  function updateUniforms() {
    material.uniforms.uTime.value = time;

    // Critic scan: a ping-pong sweep that fades in after the draft assembles.
    const gain = Math.max(0, Math.min((time - 2.5) / 1.5, 1));
    material.uniforms.uScanGain.value = gain * gain * (3 - 2 * gain);

    const scanTime = Math.max(time - SCAN_DELAY, 0);
    const phase = (scanTime % SCAN_PERIOD) / SCAN_PERIOD;
    const tri = 1 - Math.abs(phase * 2 - 1); // 0→1→0
    material.uniforms.uScanY.value = PAGE_TOP - (PAGE_TOP - -0.78) * tri;
  }

  function tick() {
    if (!running) return;
    time += clock.getDelta();
    updateUniforms();
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
    const gl = renderer.getContext();
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
  }

  resize();
  window.addEventListener("resize", resize);

  if (prefersReducedMotion) {
    // Render the fully-assembled, un-scanned document as a single static frame.
    time = 1000;
    updateUniforms();
    material.uniforms.uScanGain.value = 0;
    renderer.render(scene, camera);
    running = false;
    return { dispose, pause: () => {}, resume: () => {} };
  }

  clock.start();
  tick();

  return { dispose, pause, resume };
}
