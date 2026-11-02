'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface Entrance3DProps {
  isEntering: boolean;
  onTransitionComplete?: () => void;
  personName: string;
}

// 3D Architectural Colonnade and Grand Entrance
function MuseumArchitecture({ isEntering, personName }: { isEntering: boolean; personName: string }) {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const lightsGroupRef = useRef<THREE.Group>(null);

  // Materials with elegant marble, bronze, and limestone properties
  const materials = useMemo(() => {
    return {
      marbleFloor: new THREE.MeshStandardMaterial({
        color: '#1a1918',
        roughness: 0.18,
        metalness: 0.2
      }),
      limestoneColumn: new THREE.MeshStandardMaterial({
        color: '#d6cfc4',
        roughness: 0.45,
        metalness: 0.08
      }),
      bronzeDoor: new THREE.MeshStandardMaterial({
        color: '#2d261e',
        roughness: 0.35,
        metalness: 0.75
      }),
      goldDetail: new THREE.MeshStandardMaterial({
        color: '#dfb76c',
        roughness: 0.25,
        metalness: 0.95
      }),
      granitePavement: new THREE.MeshStandardMaterial({
        color: '#121214',
        roughness: 0.7,
        metalness: 0.1
      }),
      warmGlass: new THREE.MeshPhysicalMaterial({
        color: '#ffeacc',
        roughness: 0.1,
        transmission: 0.7,
        thickness: 0.4,
        transparent: true,
        opacity: 0.85
      })
    };
  }, []);

  const animTimeRef = useRef(0);
  useFrame((state, delta) => {
    // Subtle ambient breathing of lights
    animTimeRef.current += delta;
    if (lightsGroupRef.current) {
      lightsGroupRef.current.position.y = Math.sin(animTimeRef.current * 0.8) * 0.05;
    }

    // Door opening animation when user clicks ENTER
    if (isEntering) {
      if (leftDoorRef.current && leftDoorRef.current.rotation.y > -Math.PI * 0.48) {
        leftDoorRef.current.rotation.y -= delta * 1.5;
      }
      if (rightDoorRef.current && rightDoorRef.current.rotation.y < Math.PI * 0.48) {
        rightDoorRef.current.rotation.y += delta * 1.5;
      }
    }
  });

  // Column positions for a grand portico (6 grand columns)
  const columns = [-6.25, -3.75, -1.8, 1.8, 3.75, 6.25];

  return (
    <group position={[0, 0, 0]}>
      {/* Grand Polished Marble Floor / Steps */}
      <mesh position={[0, -2.5, 0]} receiveShadow material={materials.marbleFloor}>
        <boxGeometry args={[26, 0.6, 18]} />
      </mesh>
      {/* Entrance Step 2 */}
      <mesh position={[0, -2.85, 3]} receiveShadow material={materials.granitePavement}>
        <boxGeometry args={[28, 0.4, 18]} />
      </mesh>
      {/* Entrance Step 3 */}
      <mesh position={[0, -3.15, 6]} receiveShadow material={materials.granitePavement}>
        <boxGeometry args={[30, 0.4, 18]} />
      </mesh>

      {/* Main Museum Back Wall & Portal Frame */}
      <mesh position={[0, 3.5, -4]} receiveShadow material={materials.limestoneColumn}>
        <boxGeometry args={[22, 12, 1.2]} />
      </mesh>

      {/* Portal Inset / Dark Grand Corridor entry */}
      <mesh position={[0, 1.2, -4.6]}>
        <boxGeometry args={[4.8, 7.2, 0.8]} />
        <meshBasicMaterial color="#050506" />
      </mesh>

      {/* Grand Architrave / Entablature atop Portico */}
      <mesh position={[0, 8.2, -0.5]} castShadow receiveShadow material={materials.limestoneColumn}>
        <boxGeometry args={[21, 1.6, 6]} />
      </mesh>
      {/* Molded Cornice Line */}
      <mesh position={[0, 9.2, -0.3]} castShadow receiveShadow material={materials.goldDetail}>
        <boxGeometry args={[21.4, 0.35, 6.2]} />
      </mesh>

      {/* Grand Pediment Triangle / Upper Facade */}
      <mesh position={[0, 11, -0.6]} castShadow material={materials.limestoneColumn}>
        <cylinderGeometry args={[0.01, 11, 3.2, 3]} />
      </mesh>

      {/* Gold Medallion on Pediment */}
      <mesh position={[0, 10.4, 1]} rotation={[Math.PI / 2, 0, 0]} material={materials.goldDetail}>
        <cylinderGeometry args={[0.7, 0.7, 0.15, 32]} />
      </mesh>

      {/* Grand Colonnade Columns */}
      {columns.map((xPos, idx) => (
        <group key={idx} position={[xPos, 2.5, 1.6]}>
          {/* Base Plinth */}
          <mesh position={[0, -4.6, 0]} material={materials.limestoneColumn}>
            <boxGeometry args={[1.3, 0.7, 1.3]} />
          </mesh>
          <mesh position={[0, -4.2, 0]} material={materials.goldDetail}>
            <cylinderGeometry args={[0.6, 0.68, 0.25, 24]} />
          </mesh>

          {/* Shaft (Fluted appearance) */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={materials.limestoneColumn}>
            <cylinderGeometry args={[0.48, 0.54, 9, 28]} />
          </mesh>

          {/* Capital (Corinthian / Classical detail) */}
          <mesh position={[0, 5.1, 0]} material={materials.goldDetail}>
            <cylinderGeometry args={[0.72, 0.52, 0.6, 24]} />
          </mesh>
          <mesh position={[0, 5.45, 0]} material={materials.limestoneColumn}>
            <boxGeometry args={[1.35, 0.3, 1.35]} />
          </mesh>

          {/* Column Up-light spotlight at ground */}
          <pointLight
            position={[0, -4.4, 0.6]}
            intensity={18}
            distance={8}
            color="#ffe2a3"
            decay={2}
          />
        </group>
      ))}

      {/* GRAND DOUBLE ENTRANCE DOORS */}
      {/* Portal Surrounding Gold Trim */}
      <mesh position={[0, 1.5, -3.35]} material={materials.goldDetail}>
        <boxGeometry args={[4.6, 7.3, 0.2]} />
      </mesh>

      {/* Left Door with Hinge Pivot at -2.05 */}
      <group ref={leftDoorRef} position={[-2.1, 1.4, -3.2]}>
        <mesh position={[1.05, 0, 0]} castShadow receiveShadow material={materials.bronzeDoor}>
          <boxGeometry args={[2.05, 6.8, 0.22]} />
        </mesh>
        {/* Coffered Panels on Left Door */}
        {[-2.2, -0.8, 0.8, 2.2].map((yOffset, i) => (
          <mesh key={i} position={[1.05, yOffset, 0.12]} material={materials.goldDetail}>
            <boxGeometry args={[1.5, 1.05, 0.05]} />
          </mesh>
        ))}
        {/* Left Bronze/Gold Long Luxury Pull Handle */}
        <mesh position={[1.85, 0, 0.25]} material={materials.goldDetail}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 16]} />
        </mesh>
      </group>

      {/* Right Door with Hinge Pivot at +2.1 */}
      <group ref={rightDoorRef} position={[2.1, 1.4, -3.2]}>
        <mesh position={[-1.05, 0, 0]} castShadow receiveShadow material={materials.bronzeDoor}>
          <boxGeometry args={[2.05, 6.8, 0.22]} />
        </mesh>
        {/* Coffered Panels on Right Door */}
        {[-2.2, -0.8, 0.8, 2.2].map((yOffset, i) => (
          <mesh key={i} position={[-1.05, yOffset, 0.12]} material={materials.goldDetail}>
            <boxGeometry args={[1.5, 1.05, 0.05]} />
          </mesh>
        ))}
        {/* Right Bronze/Gold Long Luxury Pull Handle */}
        <mesh position={[-1.85, 0, 0.25]} material={materials.goldDetail}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 16]} />
        </mesh>
      </group>

      {/* Transom Glass Fanlight above Doors */}
      <mesh position={[0, 5.3, -3.3]} rotation={[Math.PI / 2, 0, 0]} material={materials.warmGlass}>
        <cylinderGeometry args={[2.1, 2.1, 0.1, 32, 1, false, 0, Math.PI]} />
      </mesh>
      <mesh position={[0, 5.3, -3.35]} material={materials.goldDetail}>
        <torusGeometry args={[2.15, 0.07, 16, 32, Math.PI]} />
      </mesh>

      {/* Interior Warm Gallery Glow behind the doors */}
      <pointLight position={[0, 2, -6.5]} intensity={60} distance={16} color="#ffe2a3" decay={2} />
      <pointLight position={[0, 5, -5.5]} intensity={40} distance={14} color="#dfb76c" decay={2} />

      {/* Ambient floating gold particles/dust motes */}
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
        <group>
          {Array.from({ length: 24 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.sin(i * 1.7) * 7),
                1 + Math.cos(i * 2.3) * 3,
                (Math.sin(i * 3.1) * 4) + 1
              ]}
            >
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#f7dfa5" />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}

// Camera Controller for Mouse Parallax and Cinematic Entry Dolly
function CameraRig({
  isEntering,
  onTransitionComplete
}: {
  isEntering: boolean;
  onTransitionComplete?: () => void;
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetPos = useRef(new THREE.Vector3(0, 1.6, 10));
  const hasTriggeredComplete = useRef(false);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    if (!isEntering) {
      // Gentle mouse parallax looking around the entrance
      const mouseX = (state.pointer.x * 1.2);
      const mouseY = (state.pointer.y * 0.8);

      targetPos.current.set(mouseX * 1.5, 1.4 + mouseY * 0.8, 10.5);
      cameraRef.current.position.lerp(targetPos.current, 0.04);
      cameraRef.current.lookAt(0, 2.2, -3.5);
    } else {
      // Cinematic dolly-in through the grand doors
      cameraRef.current.position.x += (0 - cameraRef.current.position.x) * delta * 2.5;
      cameraRef.current.position.y += (1.4 - cameraRef.current.position.y) * delta * 2.5;
      cameraRef.current.position.z -= delta * 6.5;

      cameraRef.current.lookAt(0, 1.4, -12);

      // Transition once camera enters past the portal
      if (cameraRef.current.position.z < -2.8 && !hasTriggeredComplete.current) {
        hasTriggeredComplete.current = true;
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.4, 10.5]} fov={48} near={0.1} far={60} />;
}

export default function EntranceScene3D({
  isEntering,
  onTransitionComplete,
  personName
}: Entrance3DProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        shadows="percentage"
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 1.8]}
      >
        <color attach="background" args={['#08080a']} />
        <fog attach="fog" args={['#08080a', 8, 30]} />

        {/* Ambient & Architectural Lighting */}
        <ambientLight intensity={0.65} color="#d9d2c5" />

        {/* Directional Moon/Sky Architectural Light */}
        <directionalLight
          position={[6, 14, 12]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
          color="#f4ebdb"
        />

        {/* Portico Entrance Chandelier Warm Flood */}
        <pointLight position={[0, 7.5, 0]} intensity={45} distance={15} color="#ffd48a" />

        {/* Warm Portal Spotlights */}
        <spotLight
          position={[0, 6, 2]}
          target-position={[0, 1.5, -3.2]}
          intensity={55}
          angle={0.6}
          penumbra={0.8}
          color="#fbe3b5"
        />

        <CameraRig isEntering={isEntering} onTransitionComplete={onTransitionComplete} />
        <MuseumArchitecture isEntering={isEntering} personName={personName} />
      </Canvas>
    </div>
  );
}
