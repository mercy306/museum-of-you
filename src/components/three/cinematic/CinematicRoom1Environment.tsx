'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  DustMotesAtmosphere,
  ArchitecturalFireplace3D,
  GallerySeatingBench,
  ArchitecturalPlanter
} from './CinematicAtmosphere';

/**
 * Stage C: Upgraded Entrance Portico & Room 1 Architectural Interior
 * Delivers a premium, cohesive, warm cinematic gallery environment.
 */
export function CinematicRoom1Environment() {
  const materials = useMemo(() => {
    return {
      bronzeMetal: new THREE.MeshStandardMaterial({
        color: '#c5a059',
        metalness: 0.85,
        roughness: 0.25
      }),
      walnutTrim: new THREE.MeshStandardMaterial({
        color: '#2a2119',
        roughness: 0.4
      }),
      cofferCeiling: new THREE.MeshStandardMaterial({
        color: '#fcfbfa',
        roughness: 0.5
      }),
      coveGlow: new THREE.MeshStandardMaterial({
        color: '#ffe5b4',
        emissive: '#ffd899',
        emissiveIntensity: 0.6,
        roughness: 0.8
      })
    };
  }, []);

  return (
    <group>
      {/* ===================== 1. GRAND ENTRANCE PORTICO ===================== */}
      {/* Portico Covered Canopy over Arrival Terrace (Z: 4 to 12) */}
      <group position={[0, 0, 7.5]}>
        {/* Stone Terrace Plinth */}
        <mesh position={[0, -0.01, 0]} receiveShadow>
          <boxGeometry args={[14, 0.08, 9]} />
          <meshStandardMaterial color="#ded9cc" roughness={0.5} />
        </mesh>

        {/* Portico Roof Canopy */}
        <mesh position={[0, 5.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[14.4, 0.35, 9.4]} />
          <meshStandardMaterial color="#22201d" roughness={0.3} />
        </mesh>

        {/* Slender Bronze Entrance Columns */}
        {[-6.2, 6.2].map((cx, i) => (
          <group key={i} position={[cx, 0, 3.8]}>
            <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.22, 0.22, 5.8, 24]} />
              <primitive object={materials.bronzeMetal} />
            </mesh>
            {/* Ground Architectural Uplight */}
            <pointLight position={[0, 0.3, 0]} intensity={6.0} distance={4.5} color="#ffe2aa" />
          </group>
        ))}

        {/* Entrance Welcome Plinth */}
        <group position={[0, 0, 2.5]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.36, 0.96, 24]} />
            <meshStandardMaterial color="#1a1918" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.98, 0]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[0.55, 0.38, 0.04]} />
            <primitive object={materials.bronzeMetal} />
          </mesh>
          <pointLight position={[0, 1.4, 0]} intensity={3.5} distance={2.5} color="#ffd899" />
        </group>
      </group>

      {/* ===================== 2. ROOM 1 COFFERED CEILING ===================== */}
      {/* 4 Recessed Architectural Ceiling Coffers with Warm Perimeter Cove Glow */}
      {[-4, 4].map((cx, xi) =>
        [-9, -1].map((cz, zi) => (
          <group key={`${xi}-${zi}`} position={[cx, 5.75, cz]}>
            {/* Recessed Ceiling Cavity */}
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[6.2, 0.2, 6.2]} />
              <primitive object={materials.cofferCeiling} />
            </mesh>
            {/* Recessed Cove Light Perimeter Glow */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[6.4, 0.04, 6.4]} />
              <primitive object={materials.coveGlow} />
            </mesh>
            {/* Downward Architectural Ambient Gallery Cone */}
            <spotLight
              position={[0, 0, 0]}
              target-position={[0, -5.5, 0]}
              intensity={12}
              distance={7.5}
              angle={0.65}
              penumbra={0.8}
              color="#fff0d4"
            />
          </group>
        ))
      )}

      {/* ===================== 3. ARCHITECTURAL BASEBOARDS & CROWN MOLDING ===================== */}
      {/* West Wall Baseboard (X: -8.825, Z: -5, Length: 18) */}
      <mesh position={[-8.81, 0.1, -5]}>
        <boxGeometry args={[0.06, 0.2, 18]} />
        <primitive object={materials.walnutTrim} />
      </mesh>
      {/* East Wall Baseboard (X: 8.825, Z: -5, Length: 18) */}
      <mesh position={[8.81, 0.1, -5]}>
        <boxGeometry args={[0.06, 0.2, 18]} />
        <primitive object={materials.walnutTrim} />
      </mesh>

      {/* ===================== 4. MODERN GALLERY FURNITURE & ACCENTS ===================== */}
      {/* Linear Architectural Fireplace on West Wall at [-8.5, 0, -4] */}
      <group position={[-8.45, 0, -4]} rotation={[0, Math.PI / 2, 0]}>
        <ArchitecturalFireplace3D width={4.2} height={1.1} depth={0.65} />
      </group>

      {/* Center Gallery Leather Bench at [0, 0, -5] */}
      <GallerySeatingBench position={[0, 0, -5]} rotation={[0, 0, 0]} />

      {/* Architectural Potted Greenery at Portico & Fireplace Corners */}
      <ArchitecturalPlanter position={[-7.5, 0, 2.5]} />
      <ArchitecturalPlanter position={[7.5, 0, 2.5]} />
      <ArchitecturalPlanter position={[-7.5, 0, -11.5]} />
      <ArchitecturalPlanter position={[7.5, 0, -11.5]} />

      {/* ===================== 5. LIVING ATMOSPHERE (DUST MOTES) ===================== */}
      <DustMotesAtmosphere count={160} bounds={{ x: [-8, 8], y: [0.6, 5.2], z: [-13, 4] }} />
    </group>
  );
}
