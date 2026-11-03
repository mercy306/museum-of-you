'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 1. Twinkling Golden Fairy Lights & Party Bunting
 * Draped across the ceiling beams for a cozy, festive ambiance
 */
export function TwinklingFairyLights({
  startPos = [-8, 5.4, 3],
  endPos = [8, 5.4, -13],
  count = 28,
  sag = 0.45
}: {
  startPos?: [number, number, number];
  endPos?: [number, number, number];
  count?: number;
  sag?: number;
}) {
  const lightsRef = useRef<THREE.InstancedMesh>(null);
  const colorArray = useMemo(() => ['#ffeed4', '#ffd166', '#ffb703', '#ffe6a7', '#ffcbf2'], []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const randomOffsets = useMemo(() => {
    return Array.from({ length: count }, () => Math.random() * Math.PI * 2);
  }, [count]);

  const bulbPositions = useMemo(() => {
    const list: THREE.Vector3[] = [];
    const p1 = new THREE.Vector3(...startPos);
    const p2 = new THREE.Vector3(...endPos);

    for (let i = 0; i < count; i++) {
      const alpha = i / (count - 1);
      const pos = new THREE.Vector3().lerpVectors(p1, p2, alpha);
      // Parabolic catenary sag in the middle
      const sagOffset = Math.sin(alpha * Math.PI) * sag;
      pos.y -= sagOffset;
      list.push(pos);
    }
    return list;
  }, [startPos, endPos, count, sag]);

  useFrame((state) => {
    if (!lightsRef.current) return;
    const time = state.clock.elapsedTime * 4;

    bulbPositions.forEach((pos, i) => {
      dummy.position.copy(pos);
      // Gentle subtle scale pulse like twinkling fairy lights
      const scale = 0.85 + Math.sin(time + randomOffsets[i]) * 0.25;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      lightsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    lightsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Instanced Glowing Light Bulbs */}
      <instancedMesh ref={lightsRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#ffd670"
          emissive="#ffb703"
          emissiveIntensity={1.8}
          roughness={0.1}
        />
      </instancedMesh>
    </group>
  );
}

/**
 * 2. Floating Birthday Balloons with Physics Sway & Ribbons
 */
export function FestiveBalloonsCluster({
  position,
  colors = ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#9d4edd', '#ff9e00'],
  balloonCount = 7
}: {
  position: [number, number, number];
  colors?: string[];
  balloonCount?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * 1.5;
      // Gentle floating bob and slight breeze tilt
      groupRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.12;
      groupRef.current.rotation.z = Math.sin(t * 0.8 + position[2]) * 0.05;
      groupRef.current.rotation.y = Math.cos(t * 0.5) * 0.08;
    }
  });

  const balloons = useMemo(() => {
    return Array.from({ length: balloonCount }, (_, idx) => {
      const angle = (idx / balloonCount) * Math.PI * 2;
      const radius = 0.4 + (idx % 3) * 0.25;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = (idx % 3) * 0.4 + 2.4;
      const color = colors[idx % colors.length];
      const scale = 0.85 + (idx % 2) * 0.2;
      return { x, y, z, color, scale };
    });
  }, [balloonCount, colors]);

  return (
    <group ref={groupRef} position={position}>
      {balloons.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]} scale={[b.scale, b.scale, b.scale]}>
          {/* Glossy Balloon Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.38, 24, 24]} />
            <meshPhysicalMaterial
              color={b.color}
              roughness={0.15}
              metalness={0.2}
              clearcoat={0.8}
            />
          </mesh>
          {/* Balloon Knot Tip */}
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.06, 0.08, 12]} />
            <meshStandardMaterial color={b.color} roughness={0.3} />
          </mesh>
          {/* Hanging Ribbon String */}
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 1.6, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}

      {/* Soft colored underglow */}
      <pointLight position={[0, 2.5, 0]} intensity={2.2} distance={3.5} color={colors[0]} />
    </group>
  );
}

/**
 * 3. Magical Floating Golden Star Dust & Confetti Flakes
 * Gently drifts down like magical party snow throughout the room
 */
export function MagicalCelebrationDust({
  count = 180,
  bounds = { x: [-8.5, 8.5], y: [0.3, 5.5], z: [-78, 5] }
}: {
  count?: number;
  bounds?: { x: [number, number]; y: [number, number]; z: [number, number] };
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = THREE.MathUtils.randFloat(bounds.x[0], bounds.x[1]);
      pos[i * 3 + 1] = THREE.MathUtils.randFloat(bounds.y[0], bounds.y[1]);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.z[0], bounds.z[1]);

      spd[i * 3 + 0] = (Math.random() - 0.5) * 0.15;
      spd[i * 3 + 1] = -0.15 - Math.random() * 0.2; // Falling downward like confetti
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }
    return [pos, spd];
  }, [count, bounds]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 0] += Math.sin(arr[idx + 1] * 2 + i) * 0.005;
      arr[idx + 1] += speeds[idx + 1] * delta;
      arr[idx + 2] += Math.cos(arr[idx + 1] * 2 + i) * 0.005;

      // Wrap back to ceiling
      if (arr[idx + 1] < bounds.y[0]) {
        arr[idx + 1] = bounds.y[1];
        arr[idx + 0] = THREE.MathUtils.randFloat(bounds.x[0], bounds.x[1]);
        arr[idx + 2] = THREE.MathUtils.randFloat(bounds.z[0], bounds.z[1]);
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#ffe699"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * 4. Cake Golden Sparklers & Dancing Candle Flames
 * Live sparkling firework particles shooting around the cake
 */
export function CakeSparklerFountain({
  position = [0, 1.4, -72]
}: {
  position?: [number, number, number];
}) {
  const sparklerRef = useRef<THREE.Points>(null);
  const count = 70;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 0.9;
      vel[i * 3 + 0] = Math.cos(angle) * speed * 0.35;
      vel[i * 3 + 1] = 0.8 + Math.random() * 1.2;
      vel[i * 3 + 2] = Math.sin(angle) * speed * 0.35;
    }
    return [pos, vel];
  }, []);

  useFrame((_, delta) => {
    if (!sparklerRef.current) return;
    const geom = sparklerRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 0] += velocities[idx + 0] * delta;
      arr[idx + 1] += velocities[idx + 1] * delta;
      arr[idx + 2] += velocities[idx + 2] * delta;

      // Gravity pulls sparks down
      velocities[idx + 1] -= 2.0 * delta;

      // Reset sparkler particle
      if (arr[idx + 1] < -0.2) {
        arr[idx + 0] = (Math.random() - 0.5) * 0.2;
        arr[idx + 1] = 0;
        arr[idx + 2] = (Math.random() - 0.5) * 0.2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 0.9;
        velocities[idx + 0] = Math.cos(angle) * speed * 0.35;
        velocities[idx + 1] = 0.8 + Math.random() * 1.2;
        velocities[idx + 2] = Math.sin(angle) * speed * 0.35;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={sparklerRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#ffd700"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <pointLight position={[0, 0.4, 0]} intensity={4.5} distance={3.0} color="#ffbe0b" />
    </group>
  );
}
