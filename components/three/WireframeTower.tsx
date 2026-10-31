"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

type Floor = { y: number; w: number; d: number; h: number; x: number; z: number; delay: number; color: string };

function useFloors(): Floor[] {
  return useMemo(() => {
    const floors: Floor[] = [];
    // main tower
    for (let i = 0; i < 14; i++) {
      const taper = 1 - i * 0.022;
      floors.push({ y: i * 0.42, w: 1.7 * taper, d: 1.7 * taper, h: 0.4, x: 0, z: 0, delay: i * 0.12, color: i % 4 === 3 ? "#38bdf8" : "#f5a524" });
    }
    // side block
    for (let i = 0; i < 6; i++) {
      floors.push({ y: i * 0.42, w: 1.3, d: 1.1, h: 0.4, x: 2.0, z: 0.4, delay: 0.4 + i * 0.12, color: "#38bdf8" });
    }
    // low block
    for (let i = 0; i < 3; i++) {
      floors.push({ y: i * 0.42, w: 1.2, d: 1.6, h: 0.4, x: -1.9, z: -0.3, delay: 0.8 + i * 0.12, color: "#ffcf6b" });
    }
    return floors;
  }, []);
}

function FloorBox({ f, t0 }: { f: Floor; t0: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(f.w, f.h, f.d)), [f]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime - (t0.current ?? 0) - f.delay;
    const p = THREE.MathUtils.clamp(t / 0.5, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    ref.current.scale.set(1, Math.max(0.001, e), 1);
    ref.current.position.y = f.y + f.h / 2 + (1 - e) * 1.2;
    ref.current.visible = p > 0;
  });
  return (
    <group ref={ref} position={[f.x, f.y, f.z]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={f.color} transparent opacity={0.9} />
      </lineSegments>
      <mesh>
        <boxGeometry args={[f.w * 0.98, f.h * 0.9, f.d * 0.98]} />
        <meshBasicMaterial color={f.color} transparent opacity={0.045} />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 9 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffcf6b" transparent opacity={0.7} />
    </points>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);
  const floors = useFloors();
  const t0 = useRef(0);
  const scan = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.08, 0.05);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 1.25 + pointer.x * 0.22, 0.05);
    if (scan.current) {
      scan.current.position.y = ((clock.elapsedTime * 1.2) % 6.5) - 0.2;
    }
  });

  return (
    <group ref={group} position={[1.25, -2.6, 0]}>
      {floors.map((f, i) => (
        <FloorBox key={i} f={f} t0={t0} />
      ))}
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 3.6, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <gridHelper args={[16, 32, "#38bdf8", "#1e3a5f"]} />
      <Particles />
    </group>
  );
}

function FallbackTower() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 300 400" className="h-[380px] w-auto opacity-70">
        <rect x="90" y="40" width="120" height="320" fill="none" stroke="#f5a524" strokeWidth="1.5" strokeDasharray="4 4" />
        {[...Array(10)].map((_, i) => (
          <line key={i} x1="90" y1={70 + i * 28} x2="210" y2={70 + i * 28} stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
        ))}
        <line x1="150" y1="40" x2="150" y2="360" stroke="#f5a524" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="40" y1="360" x2="260" y2="360" stroke="#38bdf8" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function WireframeTower() {
  const [mounted, setMounted] = useState(false);
  const [canWebGL, setCanWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) setCanWebGL(false);
    } catch {
      setCanWebGL(false);
    }
  }, []);

  if (!mounted) return null;
  if (!canWebGL) return <FallbackTower />;

  return (
    <Canvas
      camera={{ position: [5.5, 2.4, 6.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={["#070b14", 8, 18]} />
      <Scene />
    </Canvas>
  );
}
