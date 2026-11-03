'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Atmospheric Floating Dust Motes & Sunbeam Air Particles
 * Gives the museum a living, breathing cinematic atmosphere.
 */
export function DustMotesAtmosphere({
  count = 140,
  bounds = { x: [-8, 8], y: [0.6, 4.8], z: [-13, 5] },
  color = '#ffeec9',
  size = 0.045
}: {
  count?: number;
  bounds?: { x: [number, number]; y: [number, number]; z: [number, number] };
  color?: string;
  size?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random particles within room volume
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = THREE.MathUtils.randFloat(bounds.x[0], bounds.x[1]);
      pos[i * 3 + 1] = THREE.MathUtils.randFloat(bounds.y[0], bounds.y[1]);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.z[0], bounds.z[1]);

      spd[i * 3 + 0] = (Math.random() - 0.5) * 0.08;
      spd[i * 3 + 1] = 0.04 + Math.random() * 0.06;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    return [pos, spd];
  }, [count, bounds]);

  // Subtle drifting movement in 3D space
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      array[idx + 0] += speeds[idx + 0] * delta;
      array[idx + 1] += speeds[idx + 1] * delta;
      array[idx + 2] += speeds[idx + 2] * delta;

      // Wrap-around bounds smoothly
      if (array[idx + 1] > bounds.y[1]) {
        array[idx + 1] = bounds.y[0];
      }
      if (array[idx + 0] < bounds.x[0]) array[idx + 0] = bounds.x[1];
      if (array[idx + 0] > bounds.x[1]) array[idx + 0] = bounds.x[0];
      if (array[idx + 2] < bounds.z[0]) array[idx + 2] = bounds.z[1];
      if (array[idx + 2] > bounds.z[1]) array[idx + 2] = bounds.z[0];
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Linear Architectural Fireplace with Flickering Embers & Dynamic Warm Light
 */
export function ArchitecturalFireplace3D({
  position = [0, 0, -4],
  width = 3.6,
  height = 1.0,
  depth = 0.65
}: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}) {
  const fireLightRef = useRef<THREE.PointLight>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 6;
    if (fireLightRef.current) {
      // Natural organic flicker
      fireLightRef.current.intensity =
        6.5 + Math.sin(t * 1.7) * 1.4 + Math.cos(t * 3.1) * 0.9;
    }
    if (flameMeshRef.current) {
      const mat = flameMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        mat.emissiveIntensity = 1.2 + Math.sin(t * 2.3) * 0.3;
      }
    }
  });

  return (
    <group position={position}>
      {/* Blackened Steel Hearth Enclosure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#181716" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Recessed Firebox Cavity */}
      <mesh position={[0, height / 2, 0.05]}>
        <boxGeometry args={[width - 0.35, height - 0.28, depth - 0.1]} />
        <meshStandardMaterial color="#0b0a09" roughness={0.9} />
      </mesh>

      {/* Lava Rock / Ceramic Charcoal Bed */}
      <mesh position={[0, 0.2, 0.08]}>
        <boxGeometry args={[width - 0.5, 0.1, depth - 0.25]} />
        <meshStandardMaterial color="#211d1a" roughness={0.8} />
      </mesh>

      {/* Glowing Ribbon Flame Strip */}
      <mesh ref={flameMeshRef} position={[0, 0.34, 0.08]}>
        <boxGeometry args={[width - 0.9, 0.16, 0.08]} />
        <meshStandardMaterial
          color="#ff7b00"
          emissive="#ff5500"
          emissiveIntensity={1.3}
          roughness={0.1}
        />
      </mesh>

      {/* Dynamic Warm Fireplace Light */}
      <pointLight
        ref={fireLightRef}
        position={[0, 0.6, 0.45]}
        intensity={7.5}
        distance={5.5}
        color="#ff8c38"
        castShadow
      />
    </group>
  );
}

/**
 * Gallery Seating Leather Bench
 */
export function GallerySeatingBench({
  position = [0, 0, -8],
  rotation = [0, 0, 0]
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Tufted Leather Cushion */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.18, 0.95]} />
        <meshStandardMaterial color="#2b231d" roughness={0.4} />
      </mesh>

      {/* Brushed Brass Frame / Plinth */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[2.7, 0.06, 0.88]} />
        <meshStandardMaterial color="#c5a059" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Sled Legs */}
      {[-1.15, 1.15].map((lx, idx) => (
        <group key={idx} position={[lx, 0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.3, 0.84]} />
            <meshStandardMaterial color="#1a1815" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Architectural Indoor Fiddle-Leaf Fig / Gallery Planter
 */
export function ArchitecturalPlanter({
  position
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Matte White Ceramic Cylindrical Pot */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.32, 0.9, 24]} />
        <meshStandardMaterial color="#f0eee9" roughness={0.3} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 24]} />
        <meshStandardMaterial color="#2a2018" roughness={0.9} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#423429" roughness={0.8} />
      </mesh>
      {/* Lush Broad Leaves */}
      {[
        [0.2, 1.3, 0.1, 0.5, 0.4],
        [-0.22, 1.55, -0.05, -0.6, -0.3],
        [0.05, 1.8, 0.22, 0.2, 0.7],
        [-0.1, 2.05, -0.15, -0.3, -0.6],
        [0.18, 2.2, 0.05, 0.4, 0.2],
        [0, 2.45, 0, 0, 0]
      ].map(([lx, ly, lz, rx, rz], i) => (
        <mesh key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]} castShadow>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#274e2d' : '#336139'} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
