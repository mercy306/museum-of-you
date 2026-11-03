'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MysteryBoxItem, HiddenMemoryItem } from '@/types/museum';

/* -------------------------------------------------------------
 * 1. Retro 3D Arcade Cabinet with Glowing Marquee & Screen
 * ----------------------------------------------------------- */
export function ArcadeCabinet3D({
  position,
  rotation = [0, 0, 0],
  title = 'MISCHIEF ARCADE',
  color = '#7928ca'
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  title?: string;
  color?: string;
}) {
  const screenRef = useRef<THREE.Mesh>(null);
  const marqueeCanvas = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, 512, 128);

    // Glowing border
    ctx.strokeStyle = '#f6e05e';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#f6e05e';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f6e05e';
    ctx.shadowBlur = 12;
    ctx.fillText('🕹️ ' + title.toUpperCase(), 256, 78);

    return new THREE.CanvasTexture(canvas);
  }, [title]);

  useFrame((state) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        // Pulsing synthwave screen glow
        const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
        mat.emissiveIntensity = pulse;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Cabinet Base / Lower Body */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.5, 0.9]} />
        <meshStandardMaterial color="#141419" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Side Art Decals / Neon Strips */}
      <mesh position={[-0.56, 1.25, 0]}>
        <boxGeometry args={[0.02, 2.3, 0.94]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.56, 1.25, 0]}>
        <boxGeometry args={[0.02, 2.3, 0.94]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>

      {/* Slanted Control Panel */}
      <group position={[0, 1.05, 0.42]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.12, 0.48]} />
          <meshStandardMaterial color="#222" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Joystick Stick */}
        <mesh position={[-0.25, 0.12, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#ccc" metalness={0.9} />
        </mesh>
        {/* Joystick Red Ball Top */}
        <mesh position={[-0.25, 0.21, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#e53e3e" roughness={0.1} />
        </mesh>
        {/* Arcade Buttons */}
        {[-0.05, 0.08, 0.21].map((bx, i) => (
          <mesh key={i} position={[bx, 0.07, -0.05 + (i % 2) * 0.08]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
            <meshStandardMaterial
              color={i === 0 ? '#38b2ac' : i === 1 ? '#ed8936' : '#ecc94b'}
              emissive={i === 0 ? '#38b2ac' : i === 1 ? '#ed8936' : '#ecc94b'}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Slanted CRT Arcade Screen */}
      <group position={[0, 1.62, 0.18]} rotation={[-0.2, 0, 0]}>
        {/* Bezel */}
        <mesh castShadow>
          <boxGeometry args={[0.96, 0.74, 0.15]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.6} />
        </mesh>
        {/* Glowing Screen Face */}
        <mesh ref={screenRef} position={[0, 0, 0.08]}>
          <planeGeometry args={[0.82, 0.6]} />
          <meshStandardMaterial
            color="#180e29"
            emissive="#805ad5"
            emissiveIntensity={0.7}
            roughness={0.2}
          />
        </mesh>
        <pointLight position={[0, 0, 0.45]} intensity={1.8} distance={2.5} color="#9f7aea" />
      </group>

      {/* Upper Cabinet Top */}
      <mesh position={[0, 2.2, 0.08]} castShadow>
        <boxGeometry args={[1.1, 0.5, 0.85]} />
        <meshStandardMaterial color="#141419" roughness={0.4} />
      </mesh>

      {/* Marquee Lightbox Header */}
      <group position={[0, 2.22, 0.52]}>
        <mesh castShadow>
          <boxGeometry args={[1.04, 0.32, 0.05]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {marqueeCanvas && (
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[1.0, 0.28]} />
            <meshBasicMaterial map={marqueeCanvas} />
          </mesh>
        )}
        <pointLight position={[0, 0, 0.3]} intensity={3.5} distance={3.0} color="#f6e05e" />
      </group>

      {/* Bottom Coin Doors with Glowing Slots */}
      <mesh position={[0, 0.45, 0.46]}>
        <boxGeometry args={[0.55, 0.45, 0.02]} />
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-0.12, 0.12].map((cx, i) => (
        <mesh key={i} position={[cx, 0.45, 0.48]}>
          <boxGeometry args={[0.04, 0.14, 0.01]} />
          <meshStandardMaterial color="#f6ad55" emissive="#dd6b20" emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------
 * 2. 3D Wrapped Mystery Surprise Gift Box
 * ----------------------------------------------------------- */
export function MysteryGiftBox3D({
  box,
  isOpened
}: {
  box: MysteryBoxItem;
  isOpened: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating bob
      groupRef.current.position.y =
        box.position[1] + (isOpened ? 0.05 : Math.sin(state.clock.elapsedTime * 2.2 + box.position[0]) * 0.08 + 0.12);
    }
    if (lidRef.current && isOpened) {
      lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, -Math.PI * 0.35, 4, 0.016);
      lidRef.current.position.y = THREE.MathUtils.damp(lidRef.current.position.y, 0.55, 4, 0.016);
    }
  });

  return (
    <group ref={groupRef} position={[box.position[0], box.position[1], box.position[2]]}>
      {/* Box Pedestal Shadow Cushion */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Main Gift Box Base Cube */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.55, 0.65]} />
        <meshStandardMaterial color={box.boxColor} roughness={0.25} metalness={0.15} />
      </mesh>

      {/* Ribbons around Box Base */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.67, 0.56, 0.14]} />
        <meshStandardMaterial color={box.ribbonColor} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.14, 0.56, 0.67]} />
        <meshStandardMaterial color={box.ribbonColor} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Box Lid & Bow Group */}
      <group ref={lidRef} position={[0, 0.56, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.12, 0.7]} />
          <meshStandardMaterial color={box.boxColor} roughness={0.25} metalness={0.15} />
        </mesh>
        {/* Lid Ribbons */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.72, 0.13, 0.14]} />
          <meshStandardMaterial color={box.ribbonColor} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.14, 0.13, 0.72]} />
          <meshStandardMaterial color={box.ribbonColor} roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Decorative Bow Loops on Top */}
        <mesh position={[0, 0.12, 0]}>
          <torusGeometry args={[0.1, 0.035, 12, 24]} />
          <meshStandardMaterial color={box.ribbonColor} roughness={0.2} metalness={0.5} />
        </mesh>
      </group>

      {/* Glowing Star Reward rising out when opened */}
      {isOpened ? (
        <group position={[0, 0.65, 0]}>
          <mesh>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#f6e05e" emissive="#f6ad55" emissiveIntensity={1.2} />
          </mesh>
          <pointLight intensity={3.0} distance={2.5} color="#f6e05e" />
        </group>
      ) : (
        <pointLight position={[0, 0.8, 0]} intensity={1.5} distance={2.5} color={box.ribbonColor} />
      )}
    </group>
  );
}

/* -------------------------------------------------------------
 * 3. 3D Floating Hidden Memory Collectible Token
 * ----------------------------------------------------------- */
export function HiddenMemoryToken3D({
  memory,
  isCollected
}: {
  memory: HiddenMemoryItem;
  isCollected: boolean;
}) {
  const tokenRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (tokenRef.current) {
      tokenRef.current.rotation.y += delta * 1.8;
      tokenRef.current.position.y =
        memory.position[1] + Math.sin(state.clock.elapsedTime * 3 + memory.position[0]) * 0.08;
    }
  });

  return (
    <group ref={tokenRef} position={[memory.position[0], memory.position[1], memory.position[2]]}>
      {/* Outer Golden Halo Ring */}
      <mesh>
        <torusGeometry args={[0.26, 0.03, 16, 32]} />
        <meshStandardMaterial
          color={isCollected ? '#48bb78' : '#f6e05e'}
          emissive={isCollected ? '#2f855a' : '#d69e2e'}
          emissiveIntensity={isCollected ? 0.4 : 0.8}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Center Sparkling Medallion */}
      <mesh>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color={isCollected ? '#9ae6b4' : '#faf089'}
          emissive={isCollected ? '#38a169' : '#f6ad55'}
          emissiveIntensity={isCollected ? 0.3 : 1.0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Golden Light Aura */}
      <pointLight
        position={[0, 0, 0]}
        intensity={isCollected ? 0.8 : 2.5}
        distance={2.0}
        color={isCollected ? '#48bb78' : '#ffd700'}
      />
    </group>
  );
}
