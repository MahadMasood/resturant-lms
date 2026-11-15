"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Ref, RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { paintBump, paintFrost, paintGlow, paintSalt, rng } from "../saltPaint";

// ─── Timeline helpers ─────────────────────────────────────────────────────
export type Keys = ReadonlyArray<readonly [number, number]>;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** Piecewise keyframes with smoothstep easing between each pair. */
export function track(p: number, keys: Keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [p1, v1] = keys[i];
    if (p <= p1) {
      const [p0, v0] = keys[i - 1];
      return v0 + (v1 - v0) * smoothstep(p0, p1, p);
    }
  }
  return keys[keys.length - 1][1];
}

// ─── Textures (painted once, shared by every canvas on the page) ──────────
interface SlabTextures {
  salt: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  frost: THREE.CanvasTexture;
  glow: THREE.CanvasTexture;
}

let textures: SlabTextures | null = null;

export function getSlabTextures(): SlabTextures {
  if (textures) return textures;
  const salt = new THREE.CanvasTexture(paintSalt());
  salt.colorSpace = THREE.SRGBColorSpace;
  salt.wrapS = salt.wrapT = THREE.RepeatWrapping;
  salt.anisotropy = 8;
  const bump = new THREE.CanvasTexture(paintBump());
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  const frost = new THREE.CanvasTexture(paintFrost());
  frost.colorSpace = THREE.SRGBColorSpace;
  const glow = new THREE.CanvasTexture(paintGlow());
  textures = { salt, bump, frost, glow };
  return textures;
}

// ─── The slab: a rectangular block that splits into four mineral strata ──
export const SLAB_W = 3.6; // long side
export const SLAB_D = 2.4; // short side
export const SLAB_H = 0.6;
export const SLAB_LAYERS = 4;
const LAYER_H = SLAB_H / SLAB_LAYERS;

/** Corner radius of the slab seen from above, like the softly rounded real slabs. */
const SLAB_CORNER = 0.38;

/**
 * A slab with rounded corners in plan and softly bevelled top and bottom edges,
 * smooth-shaded and box-projected so the salt texture isn't stretched.
 */
function roundedSlabGeometry(w: number, h: number, d: number, corner: number, bevel: number) {
  const hw = w / 2 - bevel;
  const hd = d / 2 - bevel;
  const r = Math.min(corner, hw, hd);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.absarc(hw - r, -hd + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hd - r);
  shape.absarc(hw - r, hd - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hd);
  shape.absarc(-hw + r, hd - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hd + r);
  shape.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5, false);

  const depth = h - bevel * 2;
  const extruded = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 10,
  });
  // Lie flat (extrusion along +y), centred on the origin.
  extruded.rotateX(-Math.PI / 2);
  extruded.translate(0, -depth / 2, 0);

  // Weld the seams so the rounded corners shade smoothly instead of in facets.
  extruded.deleteAttribute("normal");
  extruded.deleteAttribute("uv");
  const geometry = mergeVertices(extruded);
  extruded.dispose();
  geometry.computeVertexNormals();

  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    const x = pos.getX(i) / w + 0.5;
    const y = pos.getY(i) / h + 0.5;
    const z = pos.getZ(i) / d + 0.5;
    if (ny >= nx && ny >= nz) uv.set([x, z], i * 2);
    else if (nx > nz) uv.set([z, y], i * 2);
    else uv.set([x, y], i * 2);
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}

/** Local y of stratum `i` (0 = top) for a given separation. */
export const layerY = (i: number, gap: number) => ((SLAB_LAYERS - 1) / 2 - i) * (LAYER_H + gap);

export interface SlabState {
  gap: number; // exploded-view separation between strata
  heat: number; // 0–1 ember glow
  frost: number; // 0–1 frost coat
  thickness: number; // 1 = a full slab
  pulse: number; // momentary sizzle flash
}

export const newSlabState = (): SlabState => ({ gap: 0, heat: 0, frost: 0, thickness: 1, pulse: 0 });

// Index 0 is the solid body; 1–4 are the strata, top to bottom.
const TINTS = ["#fff7f3", "#fff7f3", "#ffefe9", "#ffe6de", "#fff2ed"].map((c) => new THREE.Color(c));
const HEAT_GAIN = [1.3, 0.55, 1.1, 1.65, 2.2];
const ICE = new THREE.Color("#d4e9ff");
const EMBER = new THREE.Color("#ff8a5c");

function saltMaterial(tex: SlabTextures, tint: THREE.Color, i: number) {
  // Quarter-turns give each stratum its own pattern without tiling seams.
  const map = tex.salt.clone();
  map.center.set(0.5, 0.5);
  map.rotation = (i * Math.PI) / 2;
  // Matte, sugary crystal rather than polished stone.
  return new THREE.MeshPhysicalMaterial({
    map,
    color: tint.clone(),
    roughness: 0.62,
    bumpMap: tex.bump,
    bumpScale: 2.2,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55,
    sheen: 0.45,
    sheenColor: new THREE.Color("#fff0ea"),
    sheenRoughness: 0.6,
    emissive: new THREE.Color("#ff5a1f"),
    emissiveMap: map,
    emissiveIntensity: 0,
  });
}

export function SaltSlab({ state }: { state: RefObject<SlabState> }) {
  const tex = getSlabTextures();
  const geometries = useMemo(
    () => ({
      body: roundedSlabGeometry(SLAB_W, SLAB_H, SLAB_D, SLAB_CORNER, 0.08),
      layer: roundedSlabGeometry(SLAB_W, LAYER_H, SLAB_D, SLAB_CORNER, 0.03),
      frost: roundedSlabGeometry(SLAB_W + 0.03, SLAB_H + 0.03, SLAB_D + 0.03, SLAB_CORNER + 0.015, 0.09),
    }),
    []
  );
  const materials = useMemo(() => TINTS.map((tint, i) => saltMaterial(tex, tint, i)), [tex]);
  const frostMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.frost,
        transparent: true,
        opacity: 0,
        roughness: 0.9,
        depthWrite: false,
      }),
    [tex]
  );

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      frostMaterial.dispose();
    },
    [geometries, materials, frostMaterial]
  );

  const root = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const frost = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const s = state.current;
    const g = root.current;
    if (!g) return;
    // Thin from the top down so the slab stays seated on whatever is below it.
    g.scale.y = s.thickness;
    g.position.y = (-(1 - s.thickness) * SLAB_H) / 2;
    // A seamless block until the strata start to separate.
    const split = s.gap > 0.002;
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.visible = i === 0 ? !split : split;
      if (i > 0) mesh.position.y = layerY(i - 1, s.gap);
      const m = mesh.material as THREE.MeshPhysicalMaterial;
      // Heat rises from below, so the bottom strata glow hottest.
      m.emissiveIntensity = s.heat * HEAT_GAIN[i] + s.pulse;
      m.color.copy(TINTS[i]).lerp(EMBER, s.heat * 0.45).lerp(ICE, s.frost * 0.8);
      m.roughness = 0.62 + s.frost * 0.3;
    });
    const f = frost.current;
    if (f) {
      f.visible = s.frost > 0.005;
      (f.material as THREE.MeshStandardMaterial).opacity = s.frost;
    }
  });

  return (
    <group ref={root}>
      {materials.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={i === 0 ? geometries.body : geometries.layer}
          material={m}
          visible={i === 0}
        />
      ))}
      <mesh ref={frost} geometry={geometries.frost} material={frostMaterial} renderOrder={2} />
    </group>
  );
}

// ─── Brushed-steel ring holder with its handle tab ────────────────────────
const RING_R = 1.05;
const RING_BAND = 0.11;
const RING_H = 0.09;
/** Seat height: group y that puts the ring top flush under a centred slab. */
export const RING_SEAT_Y = -SLAB_H / 2 - RING_H / 2 - 0.012;

const steel = () => new THREE.MeshStandardMaterial({ color: "#d9dce0", metalness: 1, roughness: 0.3 });

export function SteelRing({ groupRef }: { groupRef?: Ref<THREE.Group> }) {
  const parts = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, RING_R, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, RING_R - RING_BAND, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const band = new THREE.ExtrudeGeometry(shape, {
      depth: RING_H,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 128,
    });
    // Lay the band flat, centred on y = 0.
    band.rotateX(-Math.PI / 2);
    band.translate(0, -RING_H / 2, 0);
    return { band, tab: new RoundedBoxGeometry(0.2, RING_H * 0.9, 0.3, 2, 0.02), material: steel() };
  }, []);

  useEffect(
    () => () => {
      parts.band.dispose();
      parts.tab.dispose();
      parts.material.dispose();
    },
    [parts]
  );

  return (
    <group ref={groupRef}>
      <mesh geometry={parts.band} material={parts.material} />
      <mesh geometry={parts.tab} material={parts.material} position={[RING_R + 0.07, 0, 0]} />
    </group>
  );
}

/** The steel clip that wraps one edge of the serving platter. */
export function PlatterClip({ groupRef }: { groupRef?: Ref<THREE.Group> }) {
  const parts = useMemo(
    () => ({
      top: new RoundedBoxGeometry(0.5, 0.025, 0.34, 2, 0.01),
      side: new RoundedBoxGeometry(0.5, 0.34, 0.025, 2, 0.01),
      material: steel(),
    }),
    []
  );

  useEffect(
    () => () => {
      parts.top.dispose();
      parts.side.dispose();
      parts.material.dispose();
    },
    [parts]
  );

  return (
    <group ref={groupRef} position={[SLAB_W / 2 - 0.55, SLAB_H / 2, -SLAB_D / 2]}>
      <mesh geometry={parts.top} material={parts.material} position={[0, 0.013, 0.16]} />
      <mesh geometry={parts.side} material={parts.material} position={[0, -0.16, -0.013]} />
    </group>
  );
}

// ─── Additive glow card (heat bloom under the slab) ───────────────────────
export function GlowDisc({
  level,
  color,
  size,
  y,
  strength = 1,
}: {
  level: RefObject<number>;
  color: string;
  size: number;
  y: number;
  strength?: number;
}) {
  const tex = getSlabTextures();
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex.glow,
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    [tex, color]
  );
  useEffect(() => () => material.dispose(), [material]);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const v = level.current;
    m.visible = v > 0.01;
    (m.material as THREE.MeshBasicMaterial).opacity = v * strength;
  });

  return (
    <mesh ref={mesh} material={material} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}

// ─── Point-sprite particles: embers rise, snow falls, dust drifts ─────────
interface ParticleProps {
  count: number;
  level: RefObject<number>;
  mode: "rise" | "fall" | "drift";
  color: string;
  size: number;
  spread: number;
  height: number;
  base?: number;
  seed?: number;
  speed?: number;
}

export function Particles({ count, level, mode, color, size, spread, height, base = 0, seed = 1, speed = 1 }: ParticleProps) {
  const tex = getSlabTextures();
  const { geometry, seeds } = useMemo(() => {
    const r = rng(seed);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * spread;
      seeds.set([Math.cos(a) * d, Math.sin(a) * d, r(), 0.12 + r() * 0.3], i * 4);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { geometry, seeds };
  }, [count, spread, seed]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        map: tex.glow,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [size, tex]
  );
  const tint = useMemo(() => new THREE.Color(color), [color]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  const points = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const pts = points.current;
    if (!pts) return;
    const lv = level.current;
    pts.visible = lv > 0.01;
    if (!pts.visible) return;
    const t = clock.elapsedTime * speed;
    const { position, color: colour } = pts.geometry.attributes;
    const pos = position.array as Float32Array;
    const col = colour.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const sx = seeds[i * 4];
      const sz = seeds[i * 4 + 1];
      const ph = seeds[i * 4 + 2];
      const sp = seeds[i * 4 + 3];
      const life = (ph + t * sp) % 1;
      let x = sx;
      let y: number;
      let z = sz;
      let fade: number;
      if (mode === "rise") {
        y = base + life * height;
        x += Math.sin(t * 1.7 + ph * 20) * 0.14 * life;
        z += Math.cos(t * 1.3 + ph * 14) * 0.14 * life;
        fade = Math.sin(life * Math.PI);
      } else if (mode === "fall") {
        y = base + height - life * height;
        x += Math.sin(t * 0.6 + ph * 30) * 0.25;
        fade = Math.sin(life * Math.PI);
      } else {
        y = base + ((ph * 7.3) % 1) * height + Math.sin(t * 0.5 + ph * 40) * 0.25;
        x += Math.sin(t * 0.3 + ph * 9) * 0.3;
        z += Math.cos(t * 0.25 + ph * 5) * 0.3;
        fade = 0.5 + 0.5 * Math.sin(t * 2 + ph * 50);
      }
      const f = fade * lv;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = tint.r * f;
      col[i * 3 + 1] = tint.g * f;
      col[i * 3 + 2] = tint.b * f;
    }
    position.needsUpdate = true;
    colour.needsUpdate = true;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

// ─── Shatter: the spent slab bursts into finishing-salt crystals ──────────
export function CrystalBurst({ amount, count = 130, originY = 0 }: { amount: RefObject<number>; count?: number; originY?: number }) {
  const tex = getSlabTextures();
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.1, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: tex.salt,
        color: "#ffe3dc",
        roughness: 0.3,
        clearcoat: 0.8,
        sheen: 0.5,
        sheenColor: new THREE.Color("#ffc2b8"),
        flatShading: true,
      }),
    [tex]
  );
  const crystals = useMemo(() => {
    const r = rng(3);
    return Array.from({ length: count }, () => {
      const x = (r() - 0.5) * SLAB_W * 0.9;
      const z = (r() - 0.5) * SLAB_D * 0.9;
      const len = Math.hypot(x, z) || 1;
      const out = 0.6 + r() * 1.2;
      return {
        x,
        y: originY + (r() - 0.5) * 0.3,
        z,
        vx: (x / len) * out + (r() - 0.5) * 0.4,
        vy: 0.8 + r() * 1.5,
        vz: (z / len) * out + (r() - 0.5) * 0.4,
        rx: r() * Math.PI,
        ry: r() * Math.PI,
        spin: 2 + r() * 6,
        s: 0.4 + r() * 0.8,
      };
    });
  }, [count, originY]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const e = amount.current;
    m.visible = e > 0.001;
    if (!m.visible) return;
    const pop = Math.min(1, e * 12);
    crystals.forEach((c, i) => {
      dummy.position.set(c.x + c.vx * e * 2.4, c.y + c.vy * e * 2.2 - 5.5 * e * e, c.z + c.vz * e * 2.4);
      dummy.rotation.set(c.rx + e * c.spin, c.ry + e * c.spin * 0.7, 0);
      dummy.scale.setScalar(c.s * pop);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

// ─── Studio lighting: soft-box reflections plus rose and gold rim lights ──
export function StudioLights({ envIntensity = 0.65 }: { envIntensity?: number }) {
  const get = useThree((s) => s.get);

  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = env;
    scene.environmentIntensity = envIntensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [get, envIntensity]);

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 8, 6]} intensity={1.7} />
      <pointLight position={[-5, 2.5, -4]} color="#ff5c9a" intensity={45} distance={22} />
      <pointLight position={[5, 1.5, -3]} color="#ffb547" intensity={35} distance={22} />
    </>
  );
}
