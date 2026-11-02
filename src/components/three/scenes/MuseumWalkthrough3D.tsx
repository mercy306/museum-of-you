'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { MuseumConfig, Exhibit } from '@/types/museum';
import { Sparkles, Music } from 'lucide-react';

// Suppress Three.js r187 deprecation notices triggered by R3F internal bindings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('THREE.Clock: This module has been deprecated') ||
       args[0].includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been removed') ||
       args[0].includes('Clock: This module has been deprecated'))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

interface MuseumWalkthrough3DProps {
  config: MuseumConfig;
  onInspectExhibit: (exhibit: Exhibit) => void;
  isTouring: boolean;
  onToggleTour: () => void;
  onOpenWishes?: () => void;
}

// Villa Walkable Boundary Physics
function isValidPosition(x: number, z: number): boolean {
  if (x >= -9.5 && x <= 9.5 && z >= -9.5 && z <= 9.5) return true;
  if (x >= 9.0 && x <= 23.5 && z >= -6.5 && z <= 6.5) return true;
  if (x >= -23.5 && x <= -9.0 && z >= -6.5 && z <= 6.5) return true;
  if (x >= -6.5 && x <= 6.5 && z >= -25.5 && z <= -9.0) return true;
  if (x >= -8.5 && x <= 8.5 && z >= -39.5 && z <= -25.0) return true;
  return false;
}

// First-person WASD Player Controller
function PlayerController({
  onNearExhibitChange,
  onNearCakeChange,
  onNearWishesChange,
  exhibitsWithPositions,
  isTouring
}: {
  onNearExhibitChange: (exhibit: Exhibit | null) => void;
  onNearCakeChange: (nearCake: boolean) => void;
  onNearWishesChange?: (nearWishes: boolean) => void;
  exhibitsWithPositions: { exhibit: Exhibit; position: [number, number, number] }[];
  isTouring: boolean;
}) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const velocity = useRef(new THREE.Vector3());
  const tourProgress = useRef(0);

  const tourWaypoints = useMemo(() => {
    return [
      new THREE.Vector3(0, 1.65, 6),
      new THREE.Vector3(6, 1.65, 0),
      new THREE.Vector3(16, 1.65, 0),
      new THREE.Vector3(6, 1.65, 0),
      new THREE.Vector3(-6, 1.65, 0),
      new THREE.Vector3(-16, 1.65, 0),
      new THREE.Vector3(0, 1.65, 0),
      new THREE.Vector3(0, 1.65, -12),
      new THREE.Vector3(0, 1.65, -20),
      new THREE.Vector3(0, 1.65, -32)
    ];
  }, []);

  useEffect(() => {
    camera.position.set(0, 1.65, 5);
    camera.lookAt(0, 1.65, -3);

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame((_, delta) => {
    if (isTouring) {
      tourProgress.current += delta * 0.08;
      const numPoints = tourWaypoints.length - 1;
      const t = (tourProgress.current % numPoints);
      const idx = Math.floor(t);
      const nextIdx = (idx + 1) % tourWaypoints.length;
      const alpha = t - idx;

      const p1 = tourWaypoints[idx];
      const p2 = tourWaypoints[nextIdx];
      camera.position.lerpVectors(p1, p2, alpha);
      camera.lookAt(p2.x, 1.65, p2.z);
      return;
    }

    const speed = 7.0;
    const damping = 9.0;

    velocity.current.x -= velocity.current.x * damping * delta;
    velocity.current.z -= velocity.current.z * damping * delta;

    const forwardInput = Number(Boolean(keys.current['KeyW'] || keys.current['ArrowUp'])) -
                         Number(Boolean(keys.current['KeyS'] || keys.current['ArrowDown']));
    const strafeInput = Number(Boolean(keys.current['KeyD'] || keys.current['ArrowRight'])) -
                        Number(Boolean(keys.current['KeyA'] || keys.current['ArrowLeft']));

    if (forwardInput !== 0) velocity.current.z -= forwardInput * speed * delta * 12;
    if (strafeInput !== 0) velocity.current.x += strafeInput * speed * delta * 12;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const moveX = right.x * velocity.current.x * delta + forward.x * (-velocity.current.z) * delta;
    const moveZ = right.z * velocity.current.x * delta + forward.z * (-velocity.current.z) * delta;

    const candidateX = camera.position.x + moveX;
    const candidateZ = camera.position.z + moveZ;

    if (isValidPosition(candidateX, camera.position.z)) {
      camera.position.x = candidateX;
    }
    if (isValidPosition(camera.position.x, candidateZ)) {
      camera.position.z = candidateZ;
    }

    camera.position.y = 1.65;

    // Check proximity to artworks
    let closestExhibit: Exhibit | null = null;
    let minDistance = 3.2;

    for (const item of exhibitsWithPositions) {
      const dist = camera.position.distanceTo(new THREE.Vector3(...item.position));
      if (dist < minDistance) {
        minDistance = dist;
        closestExhibit = item.exhibit;
      }
    }
    onNearExhibitChange(closestExhibit);

    // Check proximity to Birthday Cake at (0, 0, -33)
    const distToCake = camera.position.distanceTo(new THREE.Vector3(0, 1.65, -33));
    onNearCakeChange(distToCake < 4.2);

    // Check proximity to Study Desk & Friend Wishes at (-17, 0, 0)
    const distToWishes = camera.position.distanceTo(new THREE.Vector3(-17, 1.65, 0));
    onNearWishesChange?.(distToWishes < 3.2);
  });

  return null;
}

// Panoramic Floor-to-Ceiling Glass Window Wall
function PanoramicGlassWall({
  position,
  rotation = [0, 0, 0],
  width,
  height = 5.8
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height?: number;
}) {
  const numPanels = Math.max(2, Math.floor(width / 2.5));
  const panelWidth = width / numPanels;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          color="#e8f6ff"
          transmission={0.92}
          transparent
          opacity={0.35}
          roughness={0.05}
          ior={1.5}
        />
      </mesh>

      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, 0.1, 0.08]} />
        <meshStandardMaterial color="#1c1b18" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[width, 0.1, 0.08]} />
        <meshStandardMaterial color="#1c1b18" roughness={0.3} />
      </mesh>

      {Array.from({ length: numPanels + 1 }).map((_, i) => {
        const xPos = -width / 2 + i * panelWidth;
        return (
          <mesh key={i} position={[xPos, height / 2, 0]}>
            <boxGeometry args={[0.08, height, 0.1]} />
            <meshStandardMaterial color="#1c1b18" roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

// Outdoor Garden, Trees, Lawn & Pool
function OutdoorScenery() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#427040" roughness={0.9} />
      </mesh>

      {/* Swimming Pool */}
      <group position={[0, -0.02, 17]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[22, 10]} />
          <meshStandardMaterial color="#f0ece1" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 8]} />
          <meshPhysicalMaterial
            color="#00b4d8"
            transmission={0.8}
            transparent
            opacity={0.8}
            roughness={0.08}
            ior={1.333}
          />
        </mesh>
      </group>

      {/* Mediterranean Cypress & Pine Trees Strictly Outside the Villa Grounds */}
      {[
        // Far West Landscape (well beyond West Wing at X <= -24)
        [-30, 16], [-32, 6], [-32, -4], [-30, -16], [-32, -26], [-30, -36],
        // Far East Landscape (well beyond East Wing at X >= 24)
        [30, 16], [32, 6], [32, -4], [30, -16], [32, -26], [30, -36],
        // Far South Grounds (past pool terrace Z >= 26)
        [-24, 26], [-14, 28], [0, 30], [14, 28], [24, 26],
        // Far North Forest (behind celebration pavilion Z <= -46)
        [-20, -46], [-10, -48], [0, -48], [10, -48], [20, -46]
      ].map(([x, z], idx) => (
        <group key={`tree-${idx}`} position={[x, 0, z]}>
          {/* Natural Tapered Bark Trunk */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.38, 4.4, 12]} />
            <meshStandardMaterial color="#38291e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.36, 0.52, 0.3, 10]} />
            <meshStandardMaterial color="#38291e" roughness={0.95} />
          </mesh>
          {/* Soft Organic Layered Foliage Canopy */}
          {[
            { y: 4.4, r: 1.45, c: '#234725' },
            { y: 6.0, r: 1.3, c: '#2d5a30' },
            { y: 7.6, r: 1.05, c: '#366839' },
            { y: 9.0, r: 0.7, c: '#3e7641' }
          ].map((layer, li) => (
            <mesh key={li} position={[0, layer.y, 0]} castShadow>
              <sphereGeometry args={[layer.r, 14, 14]} />
              <meshStandardMaterial color={layer.c} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Realistic Outdoor Flower Garden Beds */}
      <OutdoorFlowerGardenBeds />
    </group>
  );
}

// Modern Linear Fireplace
function ModernLinearFireplace({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const flameLightRef = useRef<THREE.PointLight>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (flameLightRef.current) {
      flameLightRef.current.intensity = 25 + Math.sin(timeRef.current * 8) * 6;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 5.8, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0.05]}>
        <boxGeometry args={[2.8, 0.8, 0.55]} />
        <meshBasicMaterial color="#0d0d0e" />
      </mesh>
      <mesh position={[0, 0.85, 0.15]}>
        <boxGeometry args={[2.4, 0.1, 0.3]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <pointLight
        ref={flameLightRef}
        position={[0, 1.2, 0.6]}
        distance={8}
        color="#ffaa44"
        decay={2}
      />
    </group>
  );
}

// Realistic Individual Rose Flower with Multi-Layer Velvet Petals & Calyx
function RealisticSingleRose({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = '#f08080'
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Stem with Leaf */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.006, 0.007, 0.3, 8]} />
        <meshStandardMaterial color="#2c5e2e" roughness={0.7} />
      </mesh>
      <mesh position={[0.03, -0.1, 0]} rotation={[0.4, 0.5, 0.8]}>
        <boxGeometry args={[0.06, 0.004, 0.035]} />
        <meshStandardMaterial color="#2d6a33" roughness={0.5} />
      </mesh>
      {/* Green Sepal Calyx */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.025, 6]} />
        <meshStandardMaterial color="#386641" roughness={0.7} />
      </mesh>
      {/* Outer Cupped Rose Petals */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0.35, angle, 0.2]}>
            <mesh position={[0, 0.02, 0.035]} rotation={[-0.4, 0, 0]} castShadow>
              <sphereGeometry args={[0.032, 10, 10, 0, Math.PI, 0, Math.PI * 0.7]} />
              <meshStandardMaterial color={color} roughness={0.35} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      {/* Mid Layer Petals */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <group key={`m-${i}`} rotation={[0.2, angle, 0.1]}>
            <mesh position={[0, 0.028, 0.022]} rotation={[-0.25, 0, 0]} castShadow>
              <sphereGeometry args={[0.024, 8, 8, 0, Math.PI, 0, Math.PI * 0.8]} />
              <meshStandardMaterial color={color} roughness={0.35} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      {/* Core Bud */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Luxury Heavy Fluted Crystal Glass Vase with Fresh Blooming Roses
function LuxuryRoseVase({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const flowerPalette = ['#f48fb1', '#ffb6c1', '#fff0f5', '#e91e63', '#ffcdd2', '#c2185b', '#ffffff'];
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Heavy Crystal Glass Vase */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.1, 0.36, 24]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.96}
          roughness={0.05}
          thickness={0.12}
          transparent
          opacity={0.35}
          ior={1.52}
        />
      </mesh>
      {/* Fresh Water Level */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.12, 0.095, 0.26, 24]} />
        <meshPhysicalMaterial
          color="#d4f1f9"
          transmission={0.9}
          roughness={0.05}
          transparent
          opacity={0.6}
          ior={1.33}
        />
      </mesh>
      {/* Submerged Green Stems */}
      {[-0.05, 0, 0.05].map((sx, si) =>
        [-0.04, 0.04].map((sz, zi) => (
          <mesh key={`${si}-${zi}`} position={[sx, 0.16, sz]} rotation={[sx * 3, 0, sz * 3]}>
            <cylinderGeometry args={[0.005, 0.005, 0.28, 6]} />
            <meshStandardMaterial color="#2b5329" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* Eucalyptus Leaves */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={`euc-${i}`} position={[Math.cos(angle) * 0.08, 0.34, Math.sin(angle) * 0.08]} rotation={[0.6, angle, 0]}>
            <mesh rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.06, 0.003, 0.04]} />
              <meshStandardMaterial color="#406343" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* Full Dome Bouquet of Blooming Roses */}
      {[
        { pos: [0, 0.42, 0], rot: [0, 0, 0], col: flowerPalette[0], s: 1.15 },
        { pos: [-0.07, 0.39, 0.05], rot: [-0.25, 0.4, -0.3], col: flowerPalette[1], s: 1.05 },
        { pos: [0.08, 0.39, 0.04], rot: [-0.2, -0.5, 0.35], col: flowerPalette[2], s: 1.1 },
        { pos: [-0.06, 0.38, -0.06], rot: [0.35, -0.6, -0.25], col: flowerPalette[3], s: 1.0 },
        { pos: [0.07, 0.38, -0.06], rot: [0.3, 0.7, 0.3], col: flowerPalette[4], s: 1.05 },
        { pos: [0, 0.4, 0.09], rot: [-0.35, 0, 0], col: flowerPalette[5], s: 1.1 },
        { pos: [0, 0.39, -0.09], rot: [0.4, 0, 0], col: flowerPalette[6], s: 0.95 },
        { pos: [-0.1, 0.35, 0], rot: [0, 0, -0.5], col: flowerPalette[1], s: 0.9 },
        { pos: [0.1, 0.35, 0], rot: [0, 0, 0.5], col: flowerPalette[0], s: 0.95 }
      ].map((flower, idx) => (
        <RealisticSingleRose
          key={idx}
          position={flower.pos as [number, number, number]}
          rotation={flower.rot as [number, number, number]}
          color={flower.col}
          scale={flower.s}
        />
      ))}
    </group>
  );
}

// Elegant Potted White Phalaenopsis Butterfly Orchid
function PottedPhalaenopsisOrchid({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Glazed Ceramic Planter */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.32, 24]} />
        <meshStandardMaterial color="#f8f7f5" roughness={0.25} />
      </mesh>
      {/* Moss Bed */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.155, 0.155, 0.03, 18]} />
        <meshStandardMaterial color="#304128" roughness={0.9} />
      </mesh>
      {/* Glossy Dark Green Basal Leaves */}
      {[
        { rot: [0.6, 0.3, 0.2], s: [0.18, 0.005, 0.08] },
        { rot: [0.5, 2.2, -0.2], s: [0.2, 0.005, 0.085] },
        { rot: [0.55, 4.2, 0.15], s: [0.19, 0.005, 0.08] }
      ].map((leaf, li) => (
        <mesh key={li} position={[0, 0.32, 0]} rotation={leaf.rot as [number, number, number]} castShadow>
          <boxGeometry args={leaf.s as [number, number, number]} />
          <meshStandardMaterial color="#1f4225" roughness={0.3} />
        </mesh>
      ))}
      {/* Bamboo Support Stake */}
      <mesh position={[0.02, 0.55, -0.02]}>
        <cylinderGeometry args={[0.006, 0.006, 0.52, 8]} />
        <meshStandardMaterial color="#735738" roughness={0.8} />
      </mesh>
      {/* Arching Stem */}
      <mesh position={[0.05, 0.58, 0]} rotation={[0, 0, -0.45]} castShadow>
        <cylinderGeometry args={[0.007, 0.009, 0.45, 8]} />
        <meshStandardMaterial color="#3b633b" roughness={0.7} />
      </mesh>
      <mesh position={[0.24, 0.73, 0]} rotation={[0, 0, -1.2]} castShadow>
        <cylinderGeometry args={[0.006, 0.007, 0.32, 8]} />
        <meshStandardMaterial color="#3b633b" roughness={0.7} />
      </mesh>
      {/* 4 Sculptural White Orchid Blossoms */}
      {[
        { pos: [0.08, 0.52, 0.05], rot: [0, 0.4, 0.3], s: 0.9 },
        { pos: [0.17, 0.64, 0.06], rot: [0, 0.2, 0.1], s: 1.0 },
        { pos: [0.28, 0.72, 0.04], rot: [0, -0.1, -0.2], s: 1.05 },
        { pos: [0.38, 0.70, 0.02], rot: [0, -0.3, -0.5], s: 0.95 }
      ].map((flower, fi) => (
        <group key={fi} position={flower.pos as [number, number, number]} rotation={flower.rot as [number, number, number]} scale={flower.s}>
          {/* Broad White Side Petals */}
          <mesh position={[-0.04, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
            <sphereGeometry args={[0.045, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.04, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
            <sphereGeometry args={[0.045, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Dorsal Top Sepal */}
          <mesh position={[0, 0.045, 0]} castShadow>
            <sphereGeometry args={[0.04, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Orchid Lip (Magenta & Golden Yellow) */}
          <mesh position={[0, -0.025, 0.015]} castShadow>
            <boxGeometry args={[0.025, 0.03, 0.02]} />
            <meshStandardMaterial color="#c2185b" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.02, 0.026]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#fbc02d" roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Closed Green Tip Buds */}
      <mesh position={[0.45, 0.65, 0.01]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#7cb342" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Grand Pedestal Celebration Urn with Cascading Roses, Lilies & Trailing Ivy
function GrandCelebrationFloralArrangement({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Classical Fluted Pedestal */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.32, 1.1, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.11, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 24]} />
        <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Golden Urn */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.16, 0.36, 24]} />
        <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Cascading Ivy trailing down */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.34;
        const z = Math.sin(angle) * 0.34;
        return (
          <group key={`ivy-${i}`} position={[x, 1.38, z]} rotation={[0.8, angle, 0]}>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.008, 0.005, 0.36, 6]} />
              <meshStandardMaterial color="#2d5e2e" roughness={0.7} />
            </mesh>
            <mesh position={[0.03, -0.14, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.07, 0.004, 0.05]} />
              <meshStandardMaterial color="#357a38" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* Abundant Floral Bouquet of White Lilies & Roses */}
      {[
        { pos: [0, 1.82, 0], col: '#ffffff', s: 1.4 },
        { pos: [-0.18, 1.72, 0.12], col: '#ffccd5', s: 1.25 },
        { pos: [0.18, 1.72, 0.12], col: '#ffffff', s: 1.3 },
        { pos: [-0.16, 1.68, -0.16], col: '#f8a5c2', s: 1.2 },
        { pos: [0.16, 1.68, -0.16], col: '#fff0f5', s: 1.25 },
        { pos: [0, 1.65, 0.24], col: '#ffffff', s: 1.3 },
        { pos: [0, 1.65, -0.24], col: '#f48fb1', s: 1.2 },
        { pos: [-0.26, 1.55, 0], col: '#ffffff', s: 1.2 },
        { pos: [0.26, 1.55, 0], col: '#ffe4e1', s: 1.2 }
      ].map((fl, idx) => (
        <RealisticSingleRose
          key={idx}
          position={fl.pos as [number, number, number]}
          color={fl.col}
          scale={fl.s}
        />
      ))}
      <pointLight position={[0, 1.9, 0]} intensity={14} distance={4} color="#fff4e0" />
    </group>
  );
}

// Outdoor Blooming Garden Beds Flanking Terrace & Pool
function OutdoorFlowerGardenBeds() {
  const flowerSpots = useMemo(() => {
    const list: { x: number; z: number; color: string; type: 'rose' | 'hydrangea' | 'daisy' | 'lavender'; scale: number }[] = [];
    const colors = ['#e91e63', '#ff6f61', '#4ba3e3', '#9c27b0', '#ffca28', '#ffffff', '#f48fb1', '#8e24aa'];

    // Left terrace flower beds
    for (let x = -13; x <= -2.5; x += 1.1) {
      for (let z = 10.8; z <= 12.8; z += 0.9) {
        list.push({
          x: x + (Math.sin(x * 3) * 0.2),
          z: z + (Math.cos(z * 4) * 0.2),
          color: colors[Math.floor(Math.abs(Math.sin(x * 7 + z) * colors.length)) % colors.length],
          type: (['rose', 'hydrangea', 'lavender', 'daisy'] as const)[Math.floor(Math.abs(x + z * 3)) % 4],
          scale: 0.85 + (Math.abs(Math.sin(x * 2)) * 0.3)
        });
      }
    }
    // Right terrace flower beds
    for (let x = 2.5; x <= 13; x += 1.1) {
      for (let z = 10.8; z <= 12.8; z += 0.9) {
        list.push({
          x: x + (Math.sin(x * 3) * 0.2),
          z: z + (Math.cos(z * 4) * 0.2),
          color: colors[Math.floor(Math.abs(Math.cos(x * 5 + z) * colors.length)) % colors.length],
          type: (['rose', 'hydrangea', 'lavender', 'daisy'] as const)[Math.floor(Math.abs(x + z * 3)) % 4],
          scale: 0.85 + (Math.abs(Math.sin(x * 2)) * 0.3)
        });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {/* Dark Mulch Soil Planter Beds */}
      <mesh position={[-7.8, -0.03, 11.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 2.5]} />
        <meshStandardMaterial color="#2d2217" roughness={0.95} />
      </mesh>
      <mesh position={[7.8, -0.03, 11.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 2.5]} />
        <meshStandardMaterial color="#2d2217" roughness={0.95} />
      </mesh>

      {/* Low Boxwood Green Hedges */}
      <mesh position={[-7.8, 0.22, 10.5]} castShadow>
        <boxGeometry args={[11, 0.44, 0.35]} />
        <meshStandardMaterial color="#2a5a2d" roughness={0.8} />
      </mesh>
      <mesh position={[7.8, 0.22, 10.5]} castShadow>
        <boxGeometry args={[11, 0.44, 0.35]} />
        <meshStandardMaterial color="#2a5a2d" roughness={0.8} />
      </mesh>

      {/* Flower Bushes & Blossoms */}
      {flowerSpots.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]} scale={[f.scale, f.scale, f.scale]}>
          {/* Natural Foliage Bush Mound */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.25, 10, 8]} />
            <meshStandardMaterial color="#2d5e30" roughness={0.8} />
          </mesh>

          {f.type === 'lavender' ? (
            <group position={[0, 0.28, 0]}>
              {[-0.06, 0, 0.06].map((lx, li) => (
                <mesh key={li} position={[lx, 0.14, (li % 2) * 0.04]} castShadow>
                  <cylinderGeometry args={[0.02, 0.035, 0.28, 6]} />
                  <meshStandardMaterial color="#6a1b9a" roughness={0.6} />
                </mesh>
              ))}
            </group>
          ) : f.type === 'hydrangea' ? (
            <group position={[0, 0.28, 0]}>
              {/* Clustered floral florets */}
              {[
                [0, 0.08, 0],
                [-0.08, 0.04, 0.05],
                [0.08, 0.04, -0.05],
                [0.04, 0.02, 0.08]
              ].map(([hx, hy, hz], hi) => (
                <mesh key={hi} position={[hx, hy, hz]} castShadow>
                  <sphereGeometry args={[0.09, 8, 8]} />
                  <meshStandardMaterial color={f.color} roughness={0.4} />
                </mesh>
              ))}
            </group>
          ) : f.type === 'daisy' ? (
            <group position={[0, 0.28, 0]}>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.015, 10]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color="#fbc02d" roughness={0.3} />
              </mesh>
            </group>
          ) : (
            <group position={[0, 0.28, 0]}>
              <mesh position={[0, 0.04, 0]} castShadow>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color={f.color} roughness={0.35} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// Low-Slung Designer Sectional Sofa & Coffee Table
function VillaLoungeFurniture({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.44, 1.8]} />
        <meshStandardMaterial color="#ece9df" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.58, -0.75]} castShadow>
        <boxGeometry args={[3.6, 0.45, 0.35]} />
        <meshStandardMaterial color="#e5e2d7" roughness={0.7} />
      </mesh>
      <mesh position={[-1.7, 0.48, 0]} castShadow>
        <boxGeometry args={[0.3, 0.35, 1.8]} />
        <meshStandardMaterial color="#e5e2d7" roughness={0.7} />
      </mesh>

      <group position={[0, 0, 1.8]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.08, 1.0]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[-0.9, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.9]} />
          <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.9, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.9]} />
          <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.3, 0.28, 0.1]} castShadow>
          <boxGeometry args={[0.35, 0.04, 0.45]} />
          <meshStandardMaterial color="#2d2822" roughness={0.5} />
        </mesh>
        {/* Luxury Crystal Rose Vase Centerpiece on Coffee Table */}
        <LuxuryRoseVase position={[-0.38, 0.26, 0.02]} scale={0.78} />
      </group>
    </group>
  );
}

// Sculptural Brass Arco Floor Lamp
function ArcoFloorLamp({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Marble Block Base */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.5, 0.44]} />
        <meshStandardMaterial color="#f4f2ec" roughness={0.3} />
      </mesh>
      {/* Brass Arched Stem Segments */}
      <mesh position={[0.4, 2.0, 0]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.02, 0.02, 2.8, 12]} />
        <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 2.9, 0]} rotation={[0, 0, -1.3]}>
        <cylinderGeometry args={[0.018, 0.018, 1.6, 12]} />
        <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Dome Lampshade */}
      <mesh position={[2.2, 2.7, 0]} castShadow>
        <sphereGeometry args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#c5a059" metalness={0.92} roughness={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* Warm Ambient Downlight */}
      <pointLight position={[2.2, 2.5, 0]} intensity={25} distance={6} color="#ffe8c2" />
    </group>
  );
}

// Botanically Realistic Indoor Tropical Plant in Architectural Ribbed Ceramic Planter
function IndoorFiddlePlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  // Botanical Leaf Texture with Central Midrib & Secondary Lateral Veins
  const leafTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Organic paddle leaf silhouette
    ctx.clearRect(0, 0, 512, 1024);
    ctx.beginPath();
    ctx.moveTo(256, 1010);
    ctx.bezierCurveTo(70, 840, 25, 520, 50, 260);
    ctx.bezierCurveTo(70, 90, 190, 20, 256, 15);
    ctx.bezierCurveTo(322, 20, 442, 90, 462, 260);
    ctx.bezierCurveTo(487, 520, 442, 840, 256, 1010);
    ctx.closePath();

    // Deep rich tropical emerald green gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#3f8249');
    grad.addColorStop(0.3, '#2a6333');
    grad.addColorStop(0.7, '#1b4a24');
    grad.addColorStop(1, '#133519');
    ctx.fillStyle = grad;
    ctx.fill();

    // Leaf edge subtle outline
    ctx.strokeStyle = '#4e9c5a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Prominent central midrib vein
    ctx.strokeStyle = '#7ec489';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(256, 1010);
    ctx.quadraticCurveTo(256, 500, 256, 20);
    ctx.stroke();

    // Lateral pinnate secondary veins
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(145, 222, 158, 0.6)';
    for (let y = 920; y > 80; y -= 44) {
      const prog = (1010 - y) / 950;
      const spread = Math.sin(prog * Math.PI) * 185;
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(256 - spread * 0.45, y - 45, 256 - spread, y - 85);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(256 + spread * 0.45, y - 45, 256 + spread, y - 85);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Alpha cutout map for curved leaf margins
  const leafAlphaMap = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 1024);

    ctx.beginPath();
    ctx.moveTo(256, 1010);
    ctx.bezierCurveTo(70, 840, 25, 520, 50, 260);
    ctx.bezierCurveTo(70, 90, 190, 20, 256, 15);
    ctx.bezierCurveTo(322, 20, 442, 90, 462, 260);
    ctx.bezierCurveTo(487, 520, 442, 840, 256, 1010);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // 3D Curved leaf mesh geometry with natural gravity droop and transverse trough
  const leafGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.58, 1.35, 12, 20);
    const pos = geom.attributes.position;
    geom.translate(0, 0.675, 0);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const t = Math.max(0, Math.min(1, y / 1.35));

      // Natural gravitational downward drooping curve
      const droopZ = Math.pow(t, 2.1) * 0.38;

      // Organic transverse cupping along midrib
      const cupZ = -Math.cos((x / 0.29) * (Math.PI / 2)) * 0.045 * (1 - Math.abs(t - 0.5));

      pos.setZ(i, -droopZ + cupZ);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Natural leaf arrangements at varied heights and radiating angles
  const leaves = useMemo(() => [
    { stemH: 0.55, rot: [0.65, 0.2, -0.3], s: 0.85 },
    { stemH: 0.65, rot: [0.55, 1.3, -0.2], s: 0.95 },
    { stemH: 0.75, rot: [0.7, 2.4, 0.25], s: 0.9 },
    { stemH: 0.85, rot: [0.5, 3.5, -0.35], s: 1.05 },
    { stemH: 0.95, rot: [0.6, 4.6, 0.2], s: 1.1 },
    { stemH: 1.05, rot: [0.45, 5.7, -0.2], s: 1.0 },
    { stemH: 1.15, rot: [0.35, 0.8, -0.15], s: 1.15 },
    { stemH: 1.25, rot: [0.38, 2.0, 0.18], s: 1.2 },
    { stemH: 1.35, rot: [0.32, 3.2, -0.15], s: 1.25 },
    { stemH: 1.45, rot: [0.28, 4.4, 0.1], s: 1.15 },
    { stemH: 1.55, rot: [0.22, 5.4, -0.1], s: 1.05 },
    { stemH: 1.65, rot: [0.15, 1.5, 0.05], s: 0.95 }
  ], []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Brushed Brass Base Plinth */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.36, 0.06, 28]} />
        <meshStandardMaterial color="#c5a059" metalness={0.88} roughness={0.25} />
      </mesh>

      {/* Fluted Matte Ceramic Architectural Planter */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.32, 0.82, 32]} />
        <meshStandardMaterial color="#f6f3eb" roughness={0.4} />
      </mesh>
      {/* Upper Fluted Lip */}
      <mesh position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.395, 0.38, 0.08, 32]} />
        <meshStandardMaterial color="#ede8de" roughness={0.35} />
      </mesh>

      {/* Rich Potting Soil */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.365, 0.365, 0.04, 24]} />
        <meshStandardMaterial color="#231a12" roughness={0.95} />
      </mesh>

      {/* Scattered White Marble River Stones on Soil */}
      {[
        [-0.15, 0.12], [0.14, 0.16], [-0.18, -0.1], [0.16, -0.14],
        [0.05, 0.22], [-0.06, -0.22], [0.22, 0.04], [-0.22, 0.02]
      ].map(([sx, sz], i) => (
        <mesh key={`stone-${i}`} position={[sx, 0.845, sz]} rotation={[0.2, i, 0.1]} castShadow>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial color="#ebe6dc" roughness={0.5} />
        </mesh>
      ))}

      {/* Multiple Clustered Green Petiole Stalks with Curved Leaf Canopies */}
      {leaves.map((leaf, idx) => (
        <group key={`stalk-${idx}`} position={[0, 0.82, 0]}>
          <mesh
            position={[
              Math.sin(leaf.rot[1]) * (leaf.stemH * 0.12),
              leaf.stemH * 0.48,
              Math.cos(leaf.rot[1]) * (leaf.stemH * 0.12)
            ]}
            rotation={[leaf.rot[0] * 0.4, leaf.rot[1], leaf.rot[2] * 0.4]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.02, leaf.stemH, 8]} />
            <meshStandardMaterial color="#2d5e34" roughness={0.6} />
          </mesh>

          <group
            position={[
              Math.sin(leaf.rot[1]) * (leaf.stemH * 0.24),
              leaf.stemH * 0.95,
              Math.cos(leaf.rot[1]) * (leaf.stemH * 0.24)
            ]}
            rotation={leaf.rot as [number, number, number]}
            scale={[leaf.s, leaf.s, leaf.s]}
          >
            <mesh geometry={leafGeometry} castShadow receiveShadow>
              <meshStandardMaterial
                map={leafTexture || undefined}
                alphaMap={leafAlphaMap || undefined}
                transparent={!!leafAlphaMap}
                alphaTest={0.5}
                color="#ffffff"
                roughness={0.3}
                metalness={0.05}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// Glossy Black Concert Grand Piano & Piano Bench
function GrandPiano({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Piano Main Body */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.35, 1.8]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.12} metalness={0.2} />
      </mesh>
      {/* Tail curves */}
      <mesh position={[0.3, 0.72, -0.7]} rotation={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.35, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.12} metalness={0.2} />
      </mesh>
      {/* Propped Open Piano Lid */}
      <mesh position={[0.1, 1.1, -0.1]} rotation={[0.28, 0, 0.25]} castShadow>
        <boxGeometry args={[1.45, 0.04, 1.7]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.12} metalness={0.2} />
      </mesh>
      {/* Gold Prop Stick */}
      <mesh position={[0.6, 1.05, 0.4]} rotation={[0.2, 0, -0.25]}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
        <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Golden Spruce Soundboard */}
      <mesh position={[0, 0.85, -0.1]}>
        <boxGeometry args={[1.3, 0.02, 1.4]} />
        <meshStandardMaterial color="#d8b273" roughness={0.4} />
      </mesh>
      {/* Keyboard Bed */}
      <group position={[0, 0.74, 0.95]}>
        {/* White Keys */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.22]} />
          <meshStandardMaterial color="#fefefe" roughness={0.2} />
        </mesh>
        {/* Black Keys */}
        <mesh position={[0, 0.035, -0.03]}>
          <boxGeometry args={[1.15, 0.04, 0.12]} />
          <meshStandardMaterial color="#111111" roughness={0.3} />
        </mesh>
      </group>
      {/* 3 Legs with Brass Casters */}
      {[
        [-0.65, 0.35, 0.7],
        [0.65, 0.35, 0.7],
        [0.1, 0.35, -0.85]
      ].map((legPos, i) => (
        <group key={i} position={legPos as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.03, 0.7, 12]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Piano Bench */}
      <group position={[0, 0, 1.5]}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.85, 0.08, 0.38]} />
          <meshStandardMaterial color="#1a1a1c" roughness={0.6} />
        </mesh>
        {[-0.35, 0.35].map((x, xi) =>
          [-0.14, 0.14].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.22, z]}>
              <cylinderGeometry args={[0.022, 0.018, 0.44, 8]} />
              <meshStandardMaterial color="#0c0c0e" roughness={0.3} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}

// Curated Bookshelf Wall with Books & Milestone Trophies
function ModernBookshelfWall({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark Walnut Frame */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 4.8, 0.45]} />
        <meshStandardMaterial color="#2d2621" roughness={0.5} />
      </mesh>
      {/* Shelf Dividers & Shelved Collectibles */}
      {[0.5, 1.5, 2.5, 3.5, 4.3].map((y, sIdx) => (
        <group key={sIdx} position={[0, y, 0.05]}>
          <mesh>
            <boxGeometry args={[5.0, 0.05, 0.42]} />
            <meshStandardMaterial color="#3a322c" roughness={0.4} />
          </mesh>
          {/* Books in vibrant archival cloth covers */}
          {[-1.8, -0.9, 0.1, 1.2, 2.0].map((x, bIdx) => (
            <group key={bIdx} position={[x, 0.22, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.35 + (bIdx % 3) * 0.15, 0.38 + (sIdx % 2) * 0.1, 0.25]} />
                <meshStandardMaterial
                  color={['#8b263e', '#1e3d59', '#17b978', '#c5a059', '#432818'][(bIdx + sIdx) % 5]}
                  roughness={0.6}
                />
              </mesh>
            </group>
          ))}
          {/* Centerpiece Milestone Trophy on middle shelf */}
          {sIdx === 2 && (
            <group position={[0, 0.32, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.08, 0.14, 0.4, 16]} />
                <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
              </mesh>
              <pointLight intensity={10} distance={2.5} color="#ffe4a0" />
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// Executive Study Desk, Guestbook & Banker's Lamp
function ExecutiveLibraryStudy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Solid Walnut Executive Desk */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 1.1]} />
        <meshStandardMaterial color="#402c1f" roughness={0.4} />
      </mesh>
      {/* Floating Drawers */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.68, 0.95]} />
          <meshStandardMaterial color="#332319" roughness={0.5} />
        </mesh>
      ))}
      {/* Open Birthday Guestbook & Gold Pen */}
      <group position={[-0.2, 0.8, 0.1]} rotation={[0, 0.1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.02, 0.32]} />
          <meshStandardMaterial color="#faf6ed" roughness={0.8} />
        </mesh>
        <mesh position={[0.26, 0.015, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 8]} />
          <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* Classic Brass & Emerald Banker's Lamp */}
      <group position={[0.7, 0.78, -0.2]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
          <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
          <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.24, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#1b4d3e" roughness={0.2} metalness={0.2} />
        </mesh>
        <pointLight position={[0, 0.36, 0]} intensity={18} distance={3.5} color="#fff1d0" />
      </group>
      {/* Potted White Phalaenopsis Butterfly Orchid */}
      <PottedPhalaenopsisOrchid position={[-0.8, 0.78, 0.2]} scale={0.7} />

      {/* Golden Wax-Sealed Birthday Letter & Friend Wishes */}
      <group position={[0.2, 0.79, 0.15]} rotation={[0, -0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.02, 0.24]} />
          <meshStandardMaterial color="#fffbf0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[0.345, 0.005, 0.03]} />
          <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
          <meshStandardMaterial color="#8b263e" roughness={0.3} />
        </mesh>
        <pointLight position={[0, 0.25, 0]} intensity={15} distance={2.5} color="#ffe2aa" />
      </group>
      {/* Leather Swivel Office Chair */}
      <group position={[0, 0, -0.9]}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.65, 0.08, 0.6]} />
          <meshStandardMaterial color="#2a1f18" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.85, -0.26]} castShadow>
          <boxGeometry args={[0.6, 0.68, 0.08]} />
          <meshStandardMaterial color="#2a1f18" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 12]} />
          <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Champagne Bar & Tasting Lounge Counter with Backlit Glass Shelves
function ChampagneBarLounge({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Black Marble Bar Counter */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.08, 0.8]} />
        <meshStandardMaterial color="#19191d" roughness={0.2} metalness={0.15} />
      </mesh>
      {/* Marble Countertop */}
      <mesh position={[0, 1.11, 0]}>
        <boxGeometry args={[3.9, 0.06, 0.86]} />
        <meshStandardMaterial color="#24242b" roughness={0.15} metalness={0.1} />
      </mesh>
      {/* Golden Kickplate Accent */}
      <mesh position={[0, 0.08, 0.41]}>
        <boxGeometry args={[3.7, 0.16, 0.02]} />
        <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Backlit Bottle Display Shelf Wall */}
      <group position={[0, 1.8, -1.8]}>
        <mesh position={[0, 0, -0.05]} receiveShadow>
          <boxGeometry args={[3.6, 2.2, 0.1]} />
          <meshStandardMaterial color="#141416" roughness={0.6} />
        </mesh>
        {[-0.6, 0.0, 0.6].map((y, sIdx) => (
          <group key={sIdx} position={[0, y, 0.15]}>
            <mesh>
              <boxGeometry args={[3.4, 0.03, 0.35]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.02, -0.15]}>
              <boxGeometry args={[3.3, 0.03, 0.02]} />
              <meshBasicMaterial color="#ffc46b" />
            </mesh>
            {[-1.2, -0.7, -0.2, 0.3, 0.8, 1.3].map((bx, bIdx) => (
              <group key={bIdx} position={[bx, 0.18, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.035, 0.045, 0.32, 12]} />
                  <meshStandardMaterial color={['#2b4a34', '#3d2516', '#a1782e'][bIdx % 3]} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.18, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
                  <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
        <pointLight position={[0, 0, 0.6]} intensity={25} distance={5} color="#ffd48a" />
      </group>

      {/* Champagne Crystal Flutes on Counter */}
      {[-0.6, -0.4, 0.4, 0.6].map((fx, i) => (
        <group key={i} position={[fx, 1.22, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.015, 0.16, 12]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.95} roughness={0.1} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
            <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Fresh Rose Bouquet on Marble Bar Counter */}
      <LuxuryRoseVase position={[-1.4, 1.14, 0.08]} scale={0.65} />

      {/* 3 Modern Emerald Velvet & Brass Bar Stools */}
      {[-1.1, 0, 1.1].map((x, i) => (
        <group key={i} position={[x, 0, 0.95]}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.12, 24]} />
            <meshStandardMaterial color="#1b382b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 12]} />
            <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
            <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Glass Museum Display Vitrine for Milestone Relics
function GalleryVitrine({
  position,
  tokenType = 'trophy'
}: {
  position: [number, number, number];
  tokenType?: 'trophy' | 'crystal' | 'star';
}) {
  return (
    <group position={position}>
      {/* Matte White Architectural Pedestal */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.2, 0.7]} />
        <meshStandardMaterial color="#f7f7f9" roughness={0.3} />
      </mesh>
      {/* Brass Edge Line */}
      <mesh position={[0, 1.21, 0]}>
        <boxGeometry args={[0.72, 0.02, 0.72]} />
        <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Clear Glass Vitrine Cube */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.62, 0.76, 0.62]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.96}
          thickness={0.1}
          roughness={0.05}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Golden Keepsake Inside */}
      <group position={[0, 1.55, 0]}>
        {tokenType === 'trophy' && (
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.06, 0.35, 16]} />
            <meshStandardMaterial color="#c5a059" metalness={0.95} roughness={0.15} />
          </mesh>
        )}
        {tokenType === 'crystal' && (
          <mesh castShadow rotation={[0.4, 0.4, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial color="#e8c872" metalness={0.9} roughness={0.1} />
          </mesh>
        )}
        {tokenType === 'star' && (
          <mesh castShadow>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#ffdc73" metalness={0.95} roughness={0.1} />
          </mesh>
        )}
        <pointLight intensity={18} distance={2.5} color="#ffe5ab" />
      </group>
    </group>
  );
}

// Celebration Pavilion Elements: Floating Balloons, Gift Stacks, Celestial Halo Ring
function CelebrationPavilionExtras() {
  return (
    <group>
      {/* Grand Celestial Ring Chandelier over Birthday Cake */}
      <group position={[0, 5.0, -33]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.05, 16, 64]} />
          <meshStandardMaterial color="#c5a059" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.36, 0.03, 16, 64]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>
        <pointLight position={[0, -0.2, 0]} intensity={35} distance={12} color="#fff1db" />
      </group>

      {/* Floating Helium Balloon Clusters */}
      {[
        { x: -4.5, z: -32, colors: ['#c5a059', '#e8d4a2', '#f3ebd6', '#b08238', '#ffffff'] },
        { x: 4.5, z: -32, colors: ['#c5a059', '#e8d4a2', '#ffffff', '#c78f4b', '#e2cfb7'] }
      ].map((cluster, cIdx) => (
        <group key={cIdx} position={[cluster.x, 0, cluster.z]}>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
          </mesh>
          <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
            <group>
              {cluster.colors.map((c, bIdx) => {
                const angle = (bIdx / cluster.colors.length) * Math.PI * 2;
                const radius = 0.45;
                const height = 2.4 + (bIdx % 3) * 0.45;
                const bx = Math.cos(angle) * radius;
                const bz = Math.sin(angle) * radius;
                return (
                  <group key={bIdx} position={[bx, height, bz]}>
                    <mesh castShadow>
                      <sphereGeometry args={[0.26, 20, 20]} />
                      <meshStandardMaterial color={c} metalness={0.6} roughness={0.25} />
                    </mesh>
                    <mesh position={[0, -0.26, 0]}>
                      <coneGeometry args={[0.04, 0.06, 10]} />
                      <meshStandardMaterial color={c} metalness={0.6} roughness={0.25} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          </Float>
        </group>
      ))}

      {/* Stacked Birthday Gift Boxes with Silk Ribbons */}
      {[
        { pos: [-1.4, 0.22, -31.8], size: [0.55, 0.44, 0.55], col: '#8b263e', rib: '#c5a059' },
        { pos: [-1.35, 0.54, -31.8], size: [0.38, 0.28, 0.38], col: '#c5a059', rib: '#ffffff' },
        { pos: [1.5, 0.25, -31.9], size: [0.65, 0.5, 0.6], col: '#1b382b', rib: '#c5a059' },
        { pos: [1.45, 0.62, -31.9], size: [0.42, 0.32, 0.42], col: '#faf8f2', rib: '#8b263e' },
        { pos: [-0.9, 0.18, -34.6], size: [0.48, 0.36, 0.48], col: '#c5a059', rib: '#1b382b' },
        { pos: [1.0, 0.2, -34.5], size: [0.5, 0.4, 0.5], col: '#2c3539', rib: '#c5a059' }
      ].map((box, i) => (
        <group key={i} position={box.pos as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={box.size as [number, number, number]} />
            <meshStandardMaterial color={box.col} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[box.size[0] + 0.01, box.size[1] + 0.01, 0.06]} />
            <meshStandardMaterial color={box.rib} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.06, box.size[1] + 0.01, box.size[2] + 0.01]} />
            <meshStandardMaterial color={box.rib} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, box.size[1] / 2 + 0.04, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={box.rib} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Silver Champagne Cooler Stand */}
      <group position={[-2.2, 0, -32.8]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 18]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.98, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.26, 18]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0.02, 1.14, 0.02]} rotation={[0.2, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.032, 0.042, 0.3, 12]} />
          <meshStandardMaterial color="#223d2b" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// Framed Exhibition Artwork
function FramedArtwork({
  exhibit,
  position,
  rotation,
  onInspect
}: {
  exhibit: Exhibit;
  position: [number, number, number];
  rotation: [number, number, number];
  onInspect: (exhibit: Exhibit) => void;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      exhibit.imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f5f4ef';
          ctx.fillRect(0, 0, 512, 512);
          ctx.fillStyle = '#222';
          ctx.font = 'bold 36px serif';
          ctx.textAlign = 'center';
          ctx.fillText(exhibit.title, 256, 240);
        }
        setTexture(new THREE.CanvasTexture(canvas));
      }
    );
  }, [exhibit.imageUrl, exhibit.title]);

  const frameWidth = exhibit.aspectRatio === 'landscape' ? 2.6 : exhibit.aspectRatio === 'square' ? 2.1 : 1.8;
  const frameHeight = exhibit.aspectRatio === 'landscape' ? 1.8 : exhibit.aspectRatio === 'square' ? 2.1 : 2.4;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[frameWidth + 0.06, frameHeight + 0.06, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0, 0.04]} castShadow>
        <boxGeometry args={[frameWidth + 0.04, frameHeight + 0.04, 0.03]} />
        <meshStandardMaterial color="#c5a059" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[frameWidth, frameHeight, 0.01]} />
        <meshStandardMaterial color="#faf9f6" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[frameWidth - 0.36, frameHeight - 0.36]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial color="#d4d1c9" roughness={0.6} />
        )}
      </mesh>

      <spotLight
        position={[0, 2.8, 1.8]}
        target-position={[0, 0, 0]}
        intensity={28}
        distance={7}
        angle={0.55}
        penumbra={0.8}
        color="#fff4db"
        castShadow
      />
    </group>
  );
}

// Complete Modern Luxury Glass Villa Architecture
function LuxuryGlassVillaArchitecture({ candlesBlown }: { candlesBlown: boolean }) {
  const oakFloorTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#caa376';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankWidth = 64;
    const plankLength = 256;

    for (let y = 0; y < 1024; y += plankWidth) {
      for (let x = 0; x < 1024; x += plankLength) {
        const offset = (Math.floor(y / plankWidth) % 2) * (plankLength / 2);
        const actualX = (x + offset) % 1024;
        const brightness = 0.94 + ((actualX * 13 + y * 7) % 15) * 0.01;
        ctx.fillStyle = `rgb(${Math.floor(202 * brightness)}, ${Math.floor(163 * brightness)}, ${Math.floor(118 * brightness)})`;
        ctx.fillRect(actualX, y, plankLength - 2, plankWidth - 2);

        ctx.strokeStyle = '#b88f62';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(actualX, y + plankWidth / 2);
        ctx.lineTo(actualX + plankLength - 2, y + plankWidth / 2);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
  }, []);

  const materials = useMemo(() => {
    return {
      warmOakFloor: new THREE.MeshStandardMaterial({
        color: '#d4aa7d',
        map: oakFloorTexture || undefined,
        roughness: 0.3,
        metalness: 0.05
      }),
      villaWhiteWall: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.4
      }),
      ceilingWhite: new THREE.MeshStandardMaterial({
        color: '#fdfdfd',
        roughness: 0.5
      }),
      cakeIcing: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.25
      })
    };
  }, [oakFloorTexture]);

  return (
    <group>
      <OutdoorScenery />

      {/* Main Living Salon (X[-10, 10], Z[-10, 10]) */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[20, 20]} />
      </mesh>
      <mesh position={[0, 6.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[20, 20]} />
      </mesh>

      <PanoramicGlassWall position={[0, 0, 10]} width={20} />
      <ModernLinearFireplace position={[-4.5, 0, -4.5]} />
      
      {/* Living Room Area Rug & Lounge Set */}
      <mesh position={[0, 0.015, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 4.4]} />
        <meshStandardMaterial color="#edeae1" roughness={0.9} />
      </mesh>
      <VillaLoungeFurniture position={[0, 0, 1.5]} />
      <ArcoFloorLamp position={[-2.8, 0, 0.5]} rotation={[0, 0.4, 0]} />
      <GrandPiano position={[5.8, 0, 4.2]} rotation={[0, -Math.PI * 0.72, 0]} />
      <LuxuryRoseVase position={[5.4, 0.92, 3.8]} scale={0.7} />
      <IndoorFiddlePlant position={[-8.8, 0, 8.8]} scale={1.15} />
      <IndoorFiddlePlant position={[8.8, 0, 8.8]} scale={1.05} />

      {/* North Wall to Gallery */}
      <mesh position={[-7.5, 3.1, -10]} material={materials.villaWhiteWall}>
        <planeGeometry args={[5, 6.2]} />
      </mesh>
      <mesh position={[7.5, 3.1, -10]} material={materials.villaWhiteWall}>
        <planeGeometry args={[5, 6.2]} />
      </mesh>
      <mesh position={[0, 5.2, -10]} material={materials.villaWhiteWall}>
        <planeGeometry args={[10, 2.0]} />
      </mesh>

      {/* East & West Openings */}
      <mesh position={[10, 3.1, -7.5]} rotation={[0, -Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[5, 6.2]} />
      </mesh>
      <mesh position={[10, 3.1, 7.5]} rotation={[0, -Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[5, 6.2]} />
      </mesh>
      <mesh position={[10, 5.2, 0]} rotation={[0, -Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[10, 2.0]} />
      </mesh>

      <mesh position={[-10, 3.1, -7.5]} rotation={[0, Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[5, 6.2]} />
      </mesh>
      <mesh position={[-10, 3.1, 7.5]} rotation={[0, Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[5, 6.2]} />
      </mesh>
      <mesh position={[-10, 5.2, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[10, 2.0]} />
      </mesh>

      {/* East Wing - Champagne Bar & Celebration Lounge */}
      <mesh position={[17, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <mesh position={[17, 6.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <PanoramicGlassWall position={[24, 0, 0]} rotation={[0, -Math.PI / 2, 0]} width={14} height={6.0} />
      <mesh position={[17, 3.0, -7]} material={materials.villaWhiteWall}>
        <planeGeometry args={[14, 6.0]} />
      </mesh>
      <mesh position={[17, 3.0, 7]} rotation={[0, Math.PI, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[14, 6.0]} />
      </mesh>
      <ChampagneBarLounge position={[18, 0, -2.5]} />
      <group position={[17, 0, 3.5]}>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 24]} />
          <meshStandardMaterial color="#1a1a1d" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.52, 12]} />
          <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
        </mesh>
        {[-0.8, 0.8].map((cx, ci) => (
          <group key={ci} position={[cx, 0, 0]} rotation={[0, ci === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <mesh position={[0, 0.38, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.35, 20]} />
              <meshStandardMaterial color="#1b382b" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.65, -0.18]} castShadow>
              <boxGeometry args={[0.6, 0.4, 0.12]} />
              <meshStandardMaterial color="#1b382b" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
      <IndoorFiddlePlant position={[22.5, 0, 5.5]} scale={1.2} />

      {/* West Wing - The Study & Memory Library */}
      <mesh position={[-17, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <mesh position={[-17, 6.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <PanoramicGlassWall position={[-24, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={14} height={6.0} />
      <mesh position={[-17, 3.0, -7]} material={materials.villaWhiteWall}>
        <planeGeometry args={[14, 6.0]} />
      </mesh>
      <mesh position={[-17, 3.0, 7]} rotation={[0, Math.PI, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[14, 6.0]} />
      </mesh>
      <ModernBookshelfWall position={[-17, 0, -6.7]} />
      <ExecutiveLibraryStudy position={[-17, 0, 0]} />
      <group position={[-21, 0, -2]} rotation={[0, Math.PI * 0.4, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.95, 0.45, 0.95]} />
          <meshStandardMaterial color="#7a4b27" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.85, -0.4]} castShadow>
          <boxGeometry args={[0.9, 0.65, 0.2]} />
          <meshStandardMaterial color="#7a4b27" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.22, 0.85]} castShadow>
          <boxGeometry args={[0.7, 0.36, 0.5]} />
          <meshStandardMaterial color="#7a4b27" roughness={0.5} />
        </mesh>
        <mesh position={[0.75, 0.25, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.5, 16]} />
          <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <IndoorFiddlePlant position={[-22.5, 0, 5.5]} scale={1.2} />

      {/* North Garden Gallery - Promenade of Milestones */}
      <mesh position={[0, 0, -18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[14, 16]} />
      </mesh>
      <mesh position={[0, 6.2, -18]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[14, 16]} />
      </mesh>
      <mesh position={[-7, 3.1, -18]} rotation={[0, Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[16, 6.2]} />
      </mesh>
      <PanoramicGlassWall position={[7, 0, -18]} rotation={[0, -Math.PI / 2, 0]} width={16} height={6.2} />
      <GalleryVitrine position={[-3.2, 0, -14]} tokenType="trophy" />
      <GalleryVitrine position={[-3.2, 0, -22]} tokenType="crystal" />
      <group position={[3.8, 0, -18]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[2.2, 0.08, 0.65]} />
          <meshStandardMaterial color="#5c3d24" roughness={0.6} />
        </mesh>
        {[-0.9, 0.9].map((bx, bi) => (
          <mesh key={bi} position={[bx, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.6]} />
            <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Celebration Pavilion */}
      <mesh position={[0, 0, -33]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[18, 14]} />
      </mesh>
      <mesh position={[0, 6.4, -33]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[18, 14]} />
      </mesh>
      <PanoramicGlassWall position={[0, 0, -40]} width={18} height={6.4} />
      <mesh position={[9, 3.2, -33]} rotation={[0, -Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[14, 6.4]} />
      </mesh>
      <mesh position={[-9, 3.2, -33]} rotation={[0, Math.PI / 2, 0]} material={materials.villaWhiteWall}>
        <planeGeometry args={[14, 6.4]} />
      </mesh>
      <CelebrationPavilionExtras />
      {/* Grand Celebration Floral Pedestals Flanking Cake */}
      <GrandCelebrationFloralArrangement position={[-3.6, 0, -33]} scale={1.0} />
      <GrandCelebrationFloralArrangement position={[3.6, 0, -33]} scale={1.0} />

      {/* BIRTHDAY CAKE CENTERPIECE */}
      <group position={[0, 0, -33]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.9, 36]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.04, 36]} />
          <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
        </mesh>

        <mesh position={[0, 1.25, 0]} castShadow material={materials.cakeIcing}>
          <cylinderGeometry args={[0.85, 0.85, 0.55, 36]} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow material={materials.cakeIcing}>
          <cylinderGeometry args={[0.55, 0.55, 0.45, 36]} />
        </mesh>
        <mesh position={[0, 2.05, 0]} castShadow material={materials.cakeIcing}>
          <cylinderGeometry args={[0.35, 0.35, 0.35, 36]} />
        </mesh>

        {/* Candles with Flames (extinguished when blown) */}
        {[-0.12, 0, 0.12].map((xOffset, i) => (
          <group key={i} position={[xOffset, 2.3, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.22, 12]} />
              <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
            </mesh>
            {!candlesBlown && (
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshBasicMaterial color="#ffc043" />
              </mesh>
            )}
          </group>
        ))}

        {!candlesBlown && (
          <pointLight position={[0, 2.8, 0]} intensity={45} distance={12} color="#ffe2aa" />
        )}

        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.8}>
          <group>
            {Array.from({ length: 24 }).map((_, idx) => (
              <mesh
                key={idx}
                position={[
                  Math.sin(idx * 1.7) * 3.0,
                  1.6 + Math.cos(idx * 2.1) * 1.8,
                  Math.cos(idx * 3.2) * 3.0
                ]}
              >
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#dfb76c" />
              </mesh>
            ))}
          </group>
        </Float>
      </group>
    </group>
  );
}

export function MuseumWalkthrough3D({
  config,
  onInspectExhibit,
  isTouring,
  onToggleTour,
  onOpenWishes
}: MuseumWalkthrough3DProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [nearbyExhibit, setNearbyExhibit] = useState<Exhibit | null>(null);
  const [isNearCake, setIsNearCake] = useState(false);
  const [isNearWishes, setIsNearWishes] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);

  const exhibitsWithPositions = useMemo(() => {
    const list: { exhibit: Exhibit; position: [number, number, number]; rotation: [number, number, number] }[] = [];
    const allExhibits = config.galleries.flatMap((g) => g.exhibits);

    allExhibits.forEach((exhibit, idx) => {
      if (idx === 0) list.push({ exhibit, position: [-8.5, 2.0, -9.9], rotation: [0, 0, 0] });
      else if (idx === 1) list.push({ exhibit, position: [8.5, 2.0, -9.9], rotation: [0, 0, 0] });
      else if (idx === 2) list.push({ exhibit, position: [17, 2.0, -6.9], rotation: [0, 0, 0] });
      else if (idx === 3) list.push({ exhibit, position: [17, 2.0, 6.9], rotation: [0, Math.PI, 0] });
      else if (idx === 4) list.push({ exhibit, position: [-17, 2.0, -6.9], rotation: [0, 0, 0] });
      else if (idx === 5) list.push({ exhibit, position: [-17, 2.0, 6.9], rotation: [0, Math.PI, 0] });
      else if (idx === 6) list.push({ exhibit, position: [-6.9, 2.0, -14], rotation: [0, Math.PI / 2, 0] });
      else if (idx === 7) list.push({ exhibit, position: [-6.9, 2.0, -22], rotation: [0, Math.PI / 2, 0] });
      else list.push({ exhibit, position: [8.9, 2.2, -33], rotation: [0, -Math.PI / 2, 0] });
    });

    return list;
  }, [config.galleries]);

  const handleCelebrateAndBlowCandles = () => {
    setCandlesBlown(true);
    setShowCelebrationBanner(true);

    // Blast celebratory confetti fireworks
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);

    // Trigger Happy Birthday song
    window.dispatchEvent(new CustomEvent('play-birthday-song'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'KeyE' || e.key === 'e' || e.key === 'E')) {
        if (isNearCake && !candlesBlown) {
          handleCelebrateAndBlowCandles();
        } else if (isNearWishes) {
          onOpenWishes?.();
        } else if (nearbyExhibit) {
          onInspectExhibit(nearbyExhibit);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyExhibit, isNearCake, isNearWishes, candlesBlown, onInspectExhibit, onOpenWishes]);

  return (
    <div className="relative w-full h-screen bg-[#c8e2f2] select-none overflow-hidden">
      <Canvas
        shadows="percentage"
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 64, near: 0.1, far: 180, position: [0, 1.65, 5] }}
        dpr={[1, 1.8]}
      >
        <color attach="background" args={['#c8e2f2']} />

        <ambientLight intensity={1.2} color="#ffffff" />
        <directionalLight
          position={[18, 35, 18]}
          intensity={1.8}
          color="#fff8eb"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-15, 25, -15]} intensity={0.6} color="#e0f0ff" />

        <PlayerController
          onNearExhibitChange={setNearbyExhibit}
          onNearCakeChange={setIsNearCake}
          onNearWishesChange={setIsNearWishes}
          exhibitsWithPositions={exhibitsWithPositions}
          isTouring={isTouring}
        />

        {!isTouring && (
          <PointerLockControls
            onLock={() => setIsLocked(true)}
            onUnlock={() => setIsLocked(false)}
          />
        )}

        <LuxuryGlassVillaArchitecture candlesBlown={candlesBlown} />

        {exhibitsWithPositions.map((item) => (
          <FramedArtwork
            key={item.exhibit.id}
            exhibit={item.exhibit}
            position={item.position}
            rotation={item.rotation}
            onInspect={onInspectExhibit}
          />
        ))}
      </Canvas>

      {/* Celebration Banner when candles are blown */}
      {showCelebrationBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white font-display font-bold text-base sm:text-lg uppercase tracking-widest shadow-2xl shadow-rose-500/40 border-2 border-white/80">
            🎉 Happy Birthday {config.profile.name}! 🎂
          </div>
        </div>
      )}

      {/* Crosshair Dot */}
      {isLocked && !isTouring && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_6px_#c5a059]" />
        </div>
      )}

      {/* Near Cake Celebration Interaction Prompt */}
      {isNearCake && !candlesBlown && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <button
            onClick={handleCelebrateAndBlowCandles}
            className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-display font-bold text-sm tracking-wider shadow-2xl hover:scale-105 transition-all cursor-pointer animate-pulse border-2 border-white"
          >
            <span className="w-7 h-7 rounded-full bg-white text-rose-600 font-mono font-black text-xs flex items-center justify-center">
              E
            </span>
            <span>Make a Wish &amp; Blow Out Candles! 🎂</span>
          </button>
        </div>
      )}

      {/* Near Friend Wishes Desk Interaction Prompt */}
      {isNearWishes && !isNearCake && !nearbyExhibit && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <button
            onClick={() => onOpenWishes?.()}
            className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 text-white font-display font-bold text-sm tracking-wider shadow-2xl hover:scale-105 transition-all cursor-pointer animate-pulse border-2 border-white"
          >
            <span className="w-7 h-7 rounded-full bg-white text-amber-700 font-mono font-black text-xs flex items-center justify-center">
              E
            </span>
            <span>Open Friend Wishes &amp; Guestbook 💌</span>
          </button>
        </div>
      )}

      {/* Prompt [E] Inspect Artwork */}
      {nearbyExhibit && !isNearCake && !isNearWishes && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <button
            onClick={() => onInspectExhibit(nearbyExhibit)}
            className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/95 border border-[#c5a059] text-[#1a1918] shadow-2xl backdrop-blur-md hover:scale-105 transition-all cursor-pointer animate-pulse"
          >
            <span className="w-6 h-6 rounded bg-[#c5a059] text-black font-mono font-bold text-xs flex items-center justify-center">
              E
            </span>
            <span className="text-xs font-display font-bold text-stone-900">
              {nearbyExhibit.title}
            </span>
          </button>
        </div>
      )}

      {/* Bottom hint */}
      {!isLocked && !isTouring && (
        <div
          onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.requestPointerLock?.();
          }}
          className="absolute inset-0 z-20 cursor-pointer flex items-end justify-center pb-8"
        >
          <div className="px-5 py-2 rounded-full bg-white/90 border border-[#c5a059]/40 text-[#8e6e33] text-xs uppercase tracking-widest font-mono backdrop-blur-sm pointer-events-none shadow-md animate-pulse">
            Click to Look Around · WASD to Walk
          </div>
        </div>
      )}
    </div>
  );
}
