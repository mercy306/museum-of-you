'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { MuseumConfig, Exhibit } from '@/types/museum';
import { Sparkles, Music, Video, Image as ImageIcon, DoorOpen, DoorClosed, PartyPopper, Check } from 'lucide-react';

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
  currentRoomIndex?: number;
  onRoomChange?: (roomIndex: number) => void;
  onAddMedia?: () => void;
}

// Synthesize mechanical door latch + wooden swing sound using Web Audio API
function playDoorSound(open: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Latch click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(open ? 440 : 280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(open ? 220 : 120, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);

    // Resonant wooden door glide noise buffer
    const bufferSize = ctx.sampleRate * 0.35;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(open ? 520 : 180, ctx.currentTime + 0.3);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.07, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start();
  } catch (e) {
    // Audio context may require prior user interaction
  }
}

// 4-Room Physical Walkable Boundary Physics with Real Closed Door Collisions
function isValidPosition(
  x: number,
  z: number,
  doors: { door1: boolean; door2: boolean; door3: boolean }
): boolean {
  // Room 1: Memorable Moments (Z: [3.5, -13.5], X: [-8.5, 8.5])
  if (x >= -8.5 && x <= 8.5 && z >= -13.5 && z <= 3.5) return true;

  // Doorway 1 Threshold (Z = -14) connecting Room 1 & Room 2
  if (doors.door1 && x >= -1.4 && x <= 1.4 && z >= -16.2 && z <= -13.4) return true;

  // Room 2: Funny Memories (Z: [-14.5, -35.5], X: [-8.5, 8.5])
  if (x >= -8.5 && x <= 8.5 && z >= -35.5 && z <= -14.5) return true;

  // Doorway 2 Threshold (Z = -36) connecting Room 2 & Room 3
  if (doors.door2 && x >= -1.4 && x <= 1.4 && z >= -38.2 && z <= -35.4) return true;

  // Room 3: Embarrassing Images (Z: [-36.5, -57.5], X: [-8.5, 8.5])
  if (x >= -8.5 && x <= 8.5 && z >= -57.5 && z <= -36.5) return true;

  // Doorway 3 Threshold (Z = -58) connecting Room 3 & Room 4
  if (doors.door3 && x >= -1.6 && x <= 1.6 && z >= -60.2 && z <= -57.4) return true;

  // Room 4: Wishes & Grand Celebration Hall (Z: [-58.5, -85.5], X: [-11.5, 11.5])
  if (x >= -11.5 && x <= 11.5 && z >= -85.5 && z <= -58.5) return true;

  return false;
}

// First-person WASD Player Controller
function PlayerController({
  onNearExhibitChange,
  onNearCakeChange,
  onNearWishesChange,
  onNearDoorChange,
  onPlayerPositionChange,
  doors,
  exhibitsWithPositions,
  isTouring,
  teleportTarget
}: {
  onNearExhibitChange: (exhibit: Exhibit | null) => void;
  onNearCakeChange: (nearCake: boolean) => void;
  onNearWishesChange: (nearWishes: boolean) => void;
  onNearDoorChange: (door: { id: 1 | 2 | 3; title: string; isOpen: boolean } | null) => void;
  onPlayerPositionChange: (pos: [number, number, number]) => void;
  doors: { door1: boolean; door2: boolean; door3: boolean };
  exhibitsWithPositions: { exhibit: Exhibit; position: [number, number, number] }[];
  isTouring: boolean;
  teleportTarget: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const velocity = useRef(new THREE.Vector3());
  const tourProgress = useRef(0);

  const tourWaypoints = useMemo(() => {
    return [
      new THREE.Vector3(0, 1.65, 1),
      new THREE.Vector3(-4, 1.65, -6),
      new THREE.Vector3(4, 1.65, -9),
      new THREE.Vector3(0, 1.65, -14),
      new THREE.Vector3(0, 1.65, -20),
      new THREE.Vector3(-4, 1.65, -28),
      new THREE.Vector3(4, 1.65, -32),
      new THREE.Vector3(0, 1.65, -36),
      new THREE.Vector3(0, 1.65, -42),
      new THREE.Vector3(-4, 1.65, -48),
      new THREE.Vector3(4, 1.65, -52),
      new THREE.Vector3(0, 1.65, -58),
      new THREE.Vector3(0, 1.65, -66),
      new THREE.Vector3(-5, 1.65, -72),
      new THREE.Vector3(5, 1.65, -72),
      new THREE.Vector3(0, 1.65, -72)
    ];
  }, []);

  useEffect(() => {
    camera.position.set(0, 1.65, 2);
    camera.lookAt(0, 1.65, -6);

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

  // Handle fast-travel / teleporting when clicking room tabs
  useEffect(() => {
    if (teleportTarget) {
      camera.position.set(...teleportTarget);
      camera.lookAt(teleportTarget[0], 1.65, teleportTarget[2] - 8);
    }
  }, [teleportTarget, camera]);

  useFrame((_, delta) => {
    if (isTouring) {
      tourProgress.current += delta * 0.07;
      const numPoints = tourWaypoints.length - 1;
      const t = tourProgress.current % numPoints;
      const idx = Math.floor(t);
      const nextIdx = (idx + 1) % tourWaypoints.length;
      const alpha = t - idx;

      const p1 = tourWaypoints[idx];
      const p2 = tourWaypoints[nextIdx];
      camera.position.lerpVectors(p1, p2, alpha);
      camera.lookAt(p2.x, 1.65, p2.z);
      onPlayerPositionChange([camera.position.x, camera.position.y, camera.position.z]);
      return;
    }

    const speed = 7.0;
    const damping = 9.0;

    velocity.current.x -= velocity.current.x * damping * delta;
    velocity.current.z -= velocity.current.z * damping * delta;

    const forwardInput =
      Number(Boolean(keys.current['KeyW'] || keys.current['ArrowUp'])) -
      Number(Boolean(keys.current['KeyS'] || keys.current['ArrowDown']));
    const strafeInput =
      Number(Boolean(keys.current['KeyD'] || keys.current['ArrowRight'])) -
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

    if (isValidPosition(candidateX, camera.position.z, doors)) {
      camera.position.x = candidateX;
    }
    if (isValidPosition(camera.position.x, candidateZ, doors)) {
      camera.position.z = candidateZ;
    }

    camera.position.y = 1.65;
    onPlayerPositionChange([camera.position.x, camera.position.y, camera.position.z]);

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

    // Check proximity to Doors
    const distToDoor1 = camera.position.distanceTo(new THREE.Vector3(0, 1.65, -14));
    const distToDoor2 = camera.position.distanceTo(new THREE.Vector3(0, 1.65, -36));
    const distToDoor3 = camera.position.distanceTo(new THREE.Vector3(0, 1.65, -58));

    if (distToDoor1 < 2.8) {
      onNearDoorChange({ id: 1, title: 'Room 2 · Funny Memories', isOpen: doors.door1 });
    } else if (distToDoor2 < 2.8) {
      onNearDoorChange({ id: 2, title: 'Room 3 · Embarrassing Images', isOpen: doors.door2 });
    } else if (distToDoor3 < 3.0) {
      onNearDoorChange({ id: 3, title: 'Room 4 · Wishes & Grand Celebration', isOpen: doors.door3 });
    } else {
      onNearDoorChange(null);
    }

    // Check proximity to Birthday Cake at (0, 0, -72)
    const distToCake = camera.position.distanceTo(new THREE.Vector3(0, 1.65, -72));
    onNearCakeChange(distToCake < 4.2);

    // Check proximity to Study Desk & Friend Wishes at (-7, 0, -72)
    const distToWishes = camera.position.distanceTo(new THREE.Vector3(-7, 1.65, -72));
    onNearWishesChange(distToWishes < 3.2);
  });

  return null;
}

// UNIFIED ARCHITECTURAL PARTITION WALL WITH EMBEDDED REAL DOUBLE DOOR
function ArchitecturalPartitionWallWithDoor({
  z,
  width = 18,
  height = 5.8,
  wallThickness = 0.35,
  doorWidth = 2.8,
  doorHeight = 3.5,
  wallColor = '#f5f4ef',
  isOpen,
  roomTitle,
  roomNumber
}: {
  z: number;
  width?: number;
  height?: number;
  wallThickness?: number;
  doorWidth?: number;
  doorHeight?: number;
  wallColor?: string;
  isOpen: boolean;
  roomTitle: string;
  roomNumber: number;
}) {
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const targetAngle = isOpen ? Math.PI * 0.48 : 0;
    if (leftHingeRef.current) {
      leftHingeRef.current.rotation.y = THREE.MathUtils.damp(
        leftHingeRef.current.rotation.y,
        -targetAngle,
        6,
        delta
      );
    }
    if (rightHingeRef.current) {
      rightHingeRef.current.rotation.y = THREE.MathUtils.damp(
        rightHingeRef.current.rotation.y,
        targetAngle,
        6,
        delta
      );
    }
  });

  // Calculate solid wall dimensions flanking the doorway
  const sideWidth = (width - doorWidth) / 2; // (18 - 2.8) / 2 = 7.6
  const leftCenterX = -width / 2 + sideWidth / 2; // -9 + 3.8 = -5.2
  const rightCenterX = width / 2 - sideWidth / 2; // 9 - 3.8 = +5.2
  const lintelHeight = height - doorHeight; // 5.8 - 3.5 = 2.3
  const lintelCenterY = doorHeight + lintelHeight / 2; // 3.5 + 1.15 = 4.65

  // Generate Plaque Texture for the Room Header
  const plaqueTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#181614';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ROOM ${roomNumber}`, 256, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(roomTitle.toUpperCase(), 256, 88);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [roomNumber, roomTitle]);

  return (
    <group position={[0, 0, z]}>
      {/* 1. SOLID LEFT WALL BLOCK */}
      <mesh position={[leftCenterX, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideWidth, height, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>
      {/* Dark Walnut Baseboard Trim (Both Sides) */}
      <mesh position={[leftCenterX, 0.08, 0]}>
        <boxGeometry args={[sideWidth, 0.16, wallThickness + 0.04]} />
        <meshStandardMaterial color="#2c221a" roughness={0.5} />
      </mesh>

      {/* 2. SOLID RIGHT WALL BLOCK */}
      <mesh position={[rightCenterX, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideWidth, height, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>
      {/* Dark Walnut Baseboard Trim (Both Sides) */}
      <mesh position={[rightCenterX, 0.08, 0]}>
        <boxGeometry args={[sideWidth, 0.16, wallThickness + 0.04]} />
        <meshStandardMaterial color="#2c221a" roughness={0.5} />
      </mesh>

      {/* 3. SOLID LINTEL WALL BLOCK ABOVE DOORWAY */}
      <mesh position={[0, lintelCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={[doorWidth, lintelHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>

      {/* 4. SOLID DOORWAY ARCHITRAVE / CASING (Embedded flush with the wall) */}
      {/* Left Frame Post */}
      <mesh position={[-doorWidth / 2, doorHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.18, doorHeight, wallThickness + 0.06]} />
        <meshStandardMaterial color="#2c221a" roughness={0.35} />
      </mesh>
      {/* Right Frame Post */}
      <mesh position={[doorWidth / 2, doorHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.18, doorHeight, wallThickness + 0.06]} />
        <meshStandardMaterial color="#2c221a" roughness={0.35} />
      </mesh>
      {/* Top Frame Architrave Header */}
      <mesh position={[0, doorHeight + 0.09, 0]} castShadow>
        <boxGeometry args={[doorWidth + 0.36, 0.18, wallThickness + 0.08]} />
        <meshStandardMaterial color="#2c221a" roughness={0.35} />
      </mesh>
      {/* Floor Threshold Bar in Brass */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[doorWidth + 0.1, 0.04, wallThickness + 0.08]} />
        <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Recessed Warm Downlight in Doorway Lintel */}
      <pointLight position={[0, doorHeight - 0.1, 0]} intensity={12} distance={3.5} color="#ffe2aa" />

      {/* 5. OVERHEAD BRASS ROOM SIGN (Mounted on Wall above Architrave) */}
      {/* South Facing Plaque (viewed from preceding room) */}
      <group position={[0, doorHeight + 0.55, wallThickness / 2 + 0.02]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.55, 0.04]} />
          <meshStandardMaterial color="#c5a059" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[2.1, 0.48]} />
          {plaqueTexture && <meshBasicMaterial map={plaqueTexture} />}
        </mesh>
        <pointLight position={[0, 0.1, 0.35]} intensity={8} distance={2.5} color="#ffeaa7" />
      </group>

      {/* North Facing Plaque (viewed looking back from inside the room) */}
      <group position={[0, doorHeight + 0.55, -wallThickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.55, 0.04]} />
          <meshStandardMaterial color="#c5a059" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[2.1, 0.48]} />
          {plaqueTexture && <meshBasicMaterial map={plaqueTexture} />}
        </mesh>
        <pointLight position={[0, 0.1, 0.35]} intensity={8} distance={2.5} color="#ffeaa7" />
      </group>

      {/* 6. LEFT DOOR LEAF */}
      <group ref={leftHingeRef} position={[-doorWidth / 2 + 0.09, 0, 0]}>
        <group position={[doorWidth / 4 - 0.045, doorHeight / 2, 0]}>
          {/* Main Solid Wood Door Slab */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[doorWidth / 2 - 0.09, doorHeight - 0.08, 0.08]} />
            <meshStandardMaterial color="#3b2b20" roughness={0.35} />
          </mesh>
          {/* Beveled Luxury Panels */}
          {[-0.8, 0.2, 1.0].map((yOff, pIdx) => (
            <React.Fragment key={pIdx}>
              {/* Front Face Panel */}
              <mesh position={[0, yOff, 0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
              {/* Back Face Panel */}
              <mesh position={[0, yOff, -0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
            </React.Fragment>
          ))}
          {/* Brass Lever Handle (Both Sides) */}
          {[-0.05, 0.05].map((zHandle, hi) => (
            <group key={hi} position={[doorWidth / 4 - 0.22, -0.15, zHandle]}>
              <mesh rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
                <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[-0.08, 0, hi === 0 ? -0.02 : 0.02]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
                <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 7. RIGHT DOOR LEAF */}
      <group ref={rightHingeRef} position={[doorWidth / 2 - 0.09, 0, 0]}>
        <group position={[-(doorWidth / 4 - 0.045), doorHeight / 2, 0]}>
          {/* Main Solid Wood Door Slab */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[doorWidth / 2 - 0.09, doorHeight - 0.08, 0.08]} />
            <meshStandardMaterial color="#3b2b20" roughness={0.35} />
          </mesh>
          {/* Beveled Luxury Panels */}
          {[-0.8, 0.2, 1.0].map((yOff, pIdx) => (
            <React.Fragment key={pIdx}>
              {/* Front Face Panel */}
              <mesh position={[0, yOff, 0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
              {/* Back Face Panel */}
              <mesh position={[0, yOff, -0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
            </React.Fragment>
          ))}
          {/* Brass Lever Handle (Both Sides) */}
          {[-0.05, 0.05].map((zHandle, hi) => (
            <group key={hi} position={[-(doorWidth / 4 - 0.22), -0.15, zHandle]}>
              <mesh rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
                <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0.08, 0, hi === 0 ? -0.02 : 0.02]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
                <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

// Framed Artwork in 3D: Supports BOTH Photo Frames AND High-Tech Video Displays
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
  const isVideo = exhibit.mediaType === 'video' || Boolean(exhibit.videoUrl);

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
          ctx.fillStyle = '#1e1c19';
          ctx.fillRect(0, 0, 512, 512);
          ctx.fillStyle = '#c5a059';
          ctx.font = 'bold 32px serif';
          ctx.textAlign = 'center';
          ctx.fillText(exhibit.title, 256, 240);
          if (isVideo) {
            ctx.fillStyle = '#ff4d4d';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('▶ 4K VIDEO EXHIBIT', 256, 300);
          }
        }
        setTexture(new THREE.CanvasTexture(canvas));
      }
    );
  }, [exhibit.imageUrl, exhibit.title, isVideo]);

  const frameWidth = exhibit.aspectRatio === 'landscape' ? 2.8 : exhibit.aspectRatio === 'square' ? 2.2 : 1.9;
  const frameHeight = exhibit.aspectRatio === 'landscape' ? 1.8 : exhibit.aspectRatio === 'square' ? 2.2 : 2.5;

  return (
    <group position={position} rotation={rotation}>
      {/* Outer Frame */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[frameWidth + 0.08, frameHeight + 0.08, 0.03]} />
        <meshBasicMaterial color={isVideo ? '#121214' : '#1a1918'} />
      </mesh>

      {/* Frame Trim: OLED Titanium Bezel for Video, Gilded Gold for Photo */}
      <mesh position={[0, 0, 0.038]} castShadow>
        <boxGeometry args={[frameWidth + 0.04, frameHeight + 0.04, 0.02]} />
        <meshStandardMaterial
          color={isVideo ? '#2a2b2f' : '#c5a059'}
          metalness={isVideo ? 0.9 : 0.8}
          roughness={isVideo ? 0.2 : 0.3}
        />
      </mesh>

      {/* Screen / Matting */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[frameWidth, frameHeight, 0.01]} />
        <meshStandardMaterial color={isVideo ? '#08080a' : '#faf9f6'} roughness={0.8} />
      </mesh>

      {/* Media Plane */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[frameWidth - 0.28, frameHeight - 0.28]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial color="#2d2a26" roughness={0.6} />
        )}
      </mesh>

      {/* Video Indicator Icon in Center of Display */}
      {isVideo && (
        <group position={[0, 0, 0.075]}>
          <mesh>
            <circleGeometry args={[0.22, 32]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0.02, 0, 0.005]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.09, 0.16, 3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* Overhead Spotlight */}
      <spotLight
        position={[0, 2.5, 1.6]}
        target-position={[0, 0, 0]}
        intensity={isVideo ? 18 : 26}
        distance={6}
        angle={0.5}
        penumbra={0.7}
        color={isVideo ? '#e0f0ff' : '#fff3db'}
      />

      {/* Subtle Bottom Brass Plaque */}
      <group position={[0, -frameHeight / 2 - 0.22, 0.03]}>
        <mesh>
          <boxGeometry args={[Math.min(frameWidth, 1.8), 0.18, 0.02]} />
          <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Floating Birthday Celebration Balloons
function CelebrationBalloons({ position }: { position: [number, number, number] }) {
  const balloonColors = ['#e63946', '#f4a261', '#2a9d8f', '#e76f51', '#c5a059', '#9b5de5'];

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
        {balloonColors.map((col, idx) => {
          const angle = (idx / balloonColors.length) * Math.PI * 2;
          const x = Math.sin(angle) * (1.2 + (idx % 2) * 0.6);
          const z = Math.cos(angle) * (1.2 + (idx % 2) * 0.6);
          const y = (idx % 3) * 0.5;

          return (
            <group key={idx} position={[x, y, z]}>
              {/* Glossy Balloon Oval */}
              <mesh position={[0, 4.8, 0]} castShadow>
                <sphereGeometry args={[0.36, 24, 24]} />
                <meshStandardMaterial color={col} roughness={0.15} metalness={0.2} />
              </mesh>
              {/* Balloon Knot */}
              <mesh position={[0, 4.42, 0]}>
                <coneGeometry args={[0.06, 0.08, 12]} />
                <meshStandardMaterial color={col} roughness={0.2} />
              </mesh>
              {/* String */}
              <mesh position={[0, 3.4, 0]}>
                <cylinderGeometry args={[0.003, 0.003, 2.0, 4]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
              </mesh>
            </group>
          );
        })}
      </Float>
    </group>
  );
}

// 4-Room Luxury Villa Architecture with SOLID 3D WALLS and INTEGRATED DOORS
function LuxuryVillaStepByStepArchitecture({
  doors,
  candlesBlown
}: {
  doors: { door1: boolean; door2: boolean; door3: boolean };
  candlesBlown: boolean;
}) {
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
    tex.repeat.set(10, 30);
    return tex;
  }, []);

  const materials = useMemo(() => {
    return {
      warmOakFloor: new THREE.MeshStandardMaterial({
        color: '#d4aa7d',
        map: oakFloorTexture || undefined,
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.DoubleSide
      }),
      room1Wall: new THREE.MeshStandardMaterial({ color: '#f7f6f2', roughness: 0.4, side: THREE.DoubleSide }),
      room2Wall: new THREE.MeshStandardMaterial({ color: '#f3efe6', roughness: 0.4, side: THREE.DoubleSide }),
      room3Wall: new THREE.MeshStandardMaterial({ color: '#1a1918', roughness: 0.5, side: THREE.DoubleSide }), // Moody classified gallery
      room4Wall: new THREE.MeshStandardMaterial({ color: '#f8f6f0', roughness: 0.35, side: THREE.DoubleSide }),
      ceilingWhite: new THREE.MeshStandardMaterial({ color: '#fcfcfc', roughness: 0.5, side: THREE.DoubleSide }),
      cakeIcing: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25 })
    };
  }, [oakFloorTexture]);

  return (
    <group>
      {/* ===================== OUTDOOR GARDEN & SWIMMING POOL ===================== */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[160, 200]} />
        <meshStandardMaterial color="#3a6338" roughness={0.9} />
      </mesh>

      {/* Swimming Pool Terrace at Entrance (South Z: 18) */}
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

      {/* Mediterranean Cypress Trees Outside Villa Walls */}
      {[
        [-24, 18], [-24, 4], [-24, -14], [-24, -36], [-24, -58], [-24, -76],
        [24, 18], [24, 4], [24, -14], [24, -36], [24, -58], [24, -76],
        [-14, -98], [0, -98], [14, -98]
      ].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.38, 4.4, 12]} />
            <meshStandardMaterial color="#38291e" roughness={0.9} />
          </mesh>
          {[4.4, 6.0, 7.6, 9.0].map((y, li) => (
            <mesh key={li} position={[0, y, 0]} castShadow>
              <sphereGeometry args={[1.4 - li * 0.25, 12, 12]} />
              <meshStandardMaterial color={['#234725', '#2d5a30', '#366839', '#3e7641'][li]} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ===================== ROOM 1: MEMORABLE MOMENTS (Z: 4 to -14) ===================== */}
      {/* Floor & Ceiling */}
      <mesh position={[0, 0, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[18, 18]} />
      </mesh>
      <mesh position={[0, 5.8, -5]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[18, 18]} />
      </mesh>

      {/* South Wall (Panoramic Glass Wall looking out at pool) */}
      <mesh position={[0, 5.6, 4]}>
        <boxGeometry args={[18, 0.4, 0.2]} />
        <meshStandardMaterial color="#1c1b18" roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.8, 4]}>
        <planeGeometry args={[18, 5.6]} />
        <meshPhysicalMaterial color="#e8f6ff" transmission={0.92} transparent opacity={0.3} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* SOLID West & East Side Walls in Room 1 */}
      <mesh position={[-9, 2.9, -5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 18]} />
        <meshStandardMaterial color="#f7f6f2" roughness={0.4} />
      </mesh>
      <mesh position={[9, 2.9, -5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 18]} />
        <meshStandardMaterial color="#f7f6f2" roughness={0.4} />
      </mesh>

      {/* Room 1 Furniture: Area Rug & Modern Linear Fireplace */}
      <mesh position={[0, 0.015, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 4.4]} />
        <meshStandardMaterial color="#edeae1" roughness={0.9} />
      </mesh>

      {/* COMPLETE SOLID PARTITION WALL 1 WITH EMBEDDED DOOR (Room 1 -> Room 2 at Z = -14) */}
      <ArchitecturalPartitionWallWithDoor
        z={-14}
        width={18}
        height={5.8}
        wallThickness={0.35}
        doorWidth={2.8}
        doorHeight={3.5}
        wallColor="#f7f6f2"
        isOpen={doors.door1}
        roomTitle="Funny Memories"
        roomNumber={2}
      />

      {/* ===================== ROOM 2: FUNNY MEMORIES (Z: -14 to -36) ===================== */}
      {/* Floor & Ceiling */}
      <mesh position={[0, 0, -25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[18, 22]} />
      </mesh>
      <mesh position={[0, 5.8, -25]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[18, 22]} />
      </mesh>

      {/* SOLID West & East Side Walls in Room 2 */}
      <mesh position={[-9, 2.9, -25]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 22]} />
        <meshStandardMaterial color="#f3efe6" roughness={0.4} />
      </mesh>
      <mesh position={[9, 2.9, -25]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 22]} />
        <meshStandardMaterial color="#f3efe6" roughness={0.4} />
      </mesh>

      {/* Center Vitrine Table with Comedic Relics in Room 2 */}
      <group position={[0, 0, -25]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.9, 24]} />
          <meshStandardMaterial color="#22201e" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[0.9, 0.5, 0.9]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.92} transparent opacity={0.3} roughness={0.05} />
        </mesh>
        <pointLight position={[0, 1.1, 0]} intensity={12} distance={3} color="#ffd166" />
      </group>

      {/* COMPLETE SOLID PARTITION WALL 2 WITH EMBEDDED DOOR (Room 2 -> Room 3 at Z = -36) */}
      <ArchitecturalPartitionWallWithDoor
        z={-36}
        width={18}
        height={5.8}
        wallThickness={0.35}
        doorWidth={2.8}
        doorHeight={3.5}
        wallColor="#f3efe6"
        isOpen={doors.door2}
        roomTitle="Embarrassing Images"
        roomNumber={3}
      />

      {/* ===================== ROOM 3: EMBARRASSING IMAGES (Z: -36 to -58) ===================== */}
      {/* Floor & Ceiling (Moody Dark Gallery Ambiance) */}
      <mesh position={[0, 0, -47]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[18, 22]} />
      </mesh>
      <mesh position={[0, 5.8, -47]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[18, 22]} />
      </mesh>

      {/* SOLID West & East Side Walls in Room 3 (Moody Obsidian) */}
      <mesh position={[-9, 2.9, -47]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 22]} />
        <meshStandardMaterial color="#1a1918" roughness={0.5} />
      </mesh>
      <mesh position={[9, 2.9, -47]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 22]} />
        <meshStandardMaterial color="#1a1918" roughness={0.5} />
      </mesh>

      {/* Warning signs on Room 3 Entrance */}
      <group position={[0, 2.8, -36.4]} rotation={[0, Math.PI, 0]}>
        <pointLight intensity={14} distance={4} color="#ff3333" />
      </group>

      {/* COMPLETE SOLID PARTITION WALL 3 WITH EMBEDDED DOOR (Room 3 -> Room 4 at Z = -58) */}
      <ArchitecturalPartitionWallWithDoor
        z={-58}
        width={18}
        height={5.8}
        wallThickness={0.35}
        doorWidth={2.8}
        doorHeight={3.5}
        wallColor="#1a1918"
        isOpen={doors.door3}
        roomTitle="Wishes & Celebration"
        roomNumber={4}
      />

      {/* ===================== ROOM 4: WISHES & GRAND CELEBRATION (Z: -58 to -86) ===================== */}
      {/* Grand Cathedral Pavilion */}
      <mesh position={[0, 0, -72]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.warmOakFloor}>
        <planeGeometry args={[24, 28]} />
      </mesh>
      <mesh position={[0, 6.8, -72]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceilingWhite}>
        <planeGeometry args={[24, 28]} />
      </mesh>

      {/* SOLID West & East Pavilion Walls in Room 4 */}
      <mesh position={[-12, 3.4, -72]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 6.8, 28]} />
        <meshStandardMaterial color="#f8f6f0" roughness={0.35} />
      </mesh>
      <mesh position={[12, 3.4, -72]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 6.8, 28]} />
        <meshStandardMaterial color="#f8f6f0" roughness={0.35} />
      </mesh>

      {/* Massive North Glass Wall overlooking midnight fireworks garden */}
      <mesh position={[0, 3.4, -86]}>
        <planeGeometry args={[24, 6.8]} />
        <meshPhysicalMaterial color="#cce6ff" transmission={0.92} transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Birthday Celebration Balloons */}
      <CelebrationBalloons position={[-4, 0, -72]} />
      <CelebrationBalloons position={[4, 0, -72]} />

      {/* LEFT WING: Friend Wishes Desk & Milestone Letter at (-7, 0, -72) */}
      <group position={[-7, 0, -72]}>
        {/* Solid Walnut Desk */}
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.08, 1.1]} />
          <meshStandardMaterial color="#402c1f" roughness={0.4} />
        </mesh>
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={i} position={[x, 0.35, 0]} castShadow>
            <boxGeometry args={[0.45, 0.68, 0.95]} />
            <meshStandardMaterial color="#332319" roughness={0.5} />
          </mesh>
        ))}
        {/* Glowing Golden Letter with Wax Seal */}
        <group position={[0, 0.8, 0]} rotation={[0, 0.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.48, 0.02, 0.36]} />
            <meshStandardMaterial color="#faf6ed" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
            <meshStandardMaterial color="#c5a059" metalness={0.9} roughness={0.2} />
          </mesh>
          <pointLight position={[0, 0.4, 0]} intensity={16} distance={2.5} color="#ffe2aa" />
        </group>
      </group>

      {/* RIGHT WING: Concert Grand Piano at (+7, 0, -72) */}
      <group position={[7, 0, -72]} rotation={[0, -Math.PI * 0.7, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.35, 1.8]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.12} metalness={0.2} />
        </mesh>
        <mesh position={[0.1, 1.1, -0.1]} rotation={[0.28, 0, 0.25]} castShadow>
          <boxGeometry args={[1.45, 0.04, 1.7]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.12} metalness={0.2} />
        </mesh>
      </group>

      {/* CENTERPIECE: Grand 3-Tier Birthday Cake with Candles at (0, 0, -72) */}
      <group position={[0, 0, -72]}>
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

        {/* Celebration Floating Glow Particles */}
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
  onOpenWishes,
  currentRoomIndex = 1,
  onRoomChange,
  onAddMedia
}: MuseumWalkthrough3DProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [nearbyExhibit, setNearbyExhibit] = useState<Exhibit | null>(null);
  const [isNearCake, setIsNearCake] = useState(false);
  const [isNearWishes, setIsNearWishes] = useState(false);
  const [nearDoor, setNearDoor] = useState<{ id: 1 | 2 | 3; title: string; isOpen: boolean } | null>(null);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const [doors, setDoors] = useState({ door1: false, door2: false, door3: false });
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);

  // Toggle Door state with sound
  const handleToggleDoor = (doorId: 1 | 2 | 3) => {
    setDoors((prev) => {
      const key = `door${doorId}` as keyof typeof prev;
      const nextState = !prev[key];
      playDoorSound(nextState);
      return { ...prev, [key]: nextState };
    });
  };

  // Calculate 3D positions for all exhibits in each corresponding room
  const exhibitsWithPositions = useMemo(() => {
    const list: { exhibit: Exhibit; position: [number, number, number]; rotation: [number, number, number] }[] = [];

    config.galleries.forEach((gallery, gIdx) => {
      gallery.exhibits.forEach((exhibit, eIdx) => {
        if (gallery.id === 'gallery-memories' || gIdx === 0) {
          // Room 1 (Z: 4 to -14)
          if (eIdx === 0) list.push({ exhibit, position: [-8.8, 2.2, -2], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 1) list.push({ exhibit, position: [-8.8, 2.2, -9], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 2) list.push({ exhibit, position: [8.8, 2.2, -2], rotation: [0, -Math.PI / 2, 0] });
          else list.push({ exhibit, position: [8.8, 2.2, -9], rotation: [0, -Math.PI / 2, 0] });
        } else if (gallery.id === 'gallery-funny' || gIdx === 1) {
          // Room 2 (Z: -14 to -36)
          if (eIdx === 0) list.push({ exhibit, position: [-8.8, 2.2, -20], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 1) list.push({ exhibit, position: [-8.8, 2.2, -30], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 2) list.push({ exhibit, position: [8.8, 2.2, -20], rotation: [0, -Math.PI / 2, 0] });
          else list.push({ exhibit, position: [8.8, 2.2, -30], rotation: [0, -Math.PI / 2, 0] });
        } else if (gallery.id === 'gallery-embarrassing' || gIdx === 2) {
          // Room 3 (Z: -36 to -58)
          if (eIdx === 0) list.push({ exhibit, position: [-8.8, 2.2, -42], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 1) list.push({ exhibit, position: [-8.8, 2.2, -52], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 2) list.push({ exhibit, position: [8.8, 2.2, -42], rotation: [0, -Math.PI / 2, 0] });
          else list.push({ exhibit, position: [8.8, 2.2, -52], rotation: [0, -Math.PI / 2, 0] });
        } else {
          // Room 4 (Z: -58 to -86)
          if (eIdx === 0) list.push({ exhibit, position: [-11.8, 2.4, -72], rotation: [0, Math.PI / 2, 0] });
          else list.push({ exhibit, position: [11.8, 2.4, -72], rotation: [0, -Math.PI / 2, 0] });
        }
      });
    });

    return list;
  }, [config.galleries]);

  // Track player's current room based on Z position
  const handlePlayerPositionChange = (pos: [number, number, number]) => {
    const z = pos[2];
    let room = 1;
    if (z > -14.5) room = 1;
    else if (z > -36.5) room = 2;
    else if (z > -58.5) room = 3;
    else room = 4;

    if (room !== currentRoomIndex) {
      onRoomChange?.(room);
    }
  };

  // Jump to specific room and ensure preceding doors are unlocked
  const handleJumpToRoom = (targetRoom: number) => {
    if (targetRoom === 1) {
      setTeleportTarget([0, 1.65, 0]);
    } else if (targetRoom === 2) {
      setDoors((d) => ({ ...d, door1: true }));
      setTeleportTarget([0, 1.65, -18]);
    } else if (targetRoom === 3) {
      setDoors((d) => ({ ...d, door1: true, door2: true }));
      setTeleportTarget([0, 1.65, -40]);
    } else if (targetRoom === 4) {
      setDoors({ door1: true, door2: true, door3: true });
      setTeleportTarget([0, 1.65, -64]);
    }
    setTimeout(() => setTeleportTarget(null), 300);
  };

  const handleCelebrateAndBlowCandles = () => {
    setCandlesBlown(true);
    setShowCelebrationBanner(true);

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

    window.dispatchEvent(new CustomEvent('play-birthday-song'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        if (nearDoor) {
          handleToggleDoor(nearDoor.id);
        } else if (isNearCake && !candlesBlown) {
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
  }, [nearDoor, nearbyExhibit, isNearCake, isNearWishes, candlesBlown, onInspectExhibit, onOpenWishes]);

  return (
    <div className="relative w-full h-screen bg-[#c8e2f2] select-none overflow-hidden">
      <Canvas
        shadows="percentage"
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 64, near: 0.1, far: 200, position: [0, 1.65, 2] }}
        dpr={[1, 1.8]}
      >
        <color attach="background" args={['#c8e2f2']} />

        <ambientLight intensity={1.2} color="#ffffff" />
        <directionalLight
          position={[20, 40, 20]}
          intensity={1.8}
          color="#fff8eb"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-15, 25, -20]} intensity={0.6} color="#e0f0ff" />

        <PlayerController
          onNearExhibitChange={setNearbyExhibit}
          onNearCakeChange={setIsNearCake}
          onNearWishesChange={setIsNearWishes}
          onNearDoorChange={setNearDoor}
          onPlayerPositionChange={handlePlayerPositionChange}
          doors={doors}
          exhibitsWithPositions={exhibitsWithPositions}
          isTouring={isTouring}
          teleportTarget={teleportTarget}
        />

        {!isTouring && (
          <PointerLockControls
            onLock={() => setIsLocked(true)}
            onUnlock={() => setIsLocked(false)}
          />
        )}

        <LuxuryVillaStepByStepArchitecture doors={doors} candlesBlown={candlesBlown} />

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

      {/* ===================== STEP-BY-STEP ROOM PROGRESSION BAR ===================== */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#c5a059]/40 backdrop-blur-md shadow-2xl">
        {[
          { num: 1, label: 'Memorable Moments', short: '1. Memories' },
          { num: 2, label: 'Funny Memories', short: '2. Funny' },
          { num: 3, label: 'Embarrassing Images', short: '3. Classified' },
          { num: 4, label: 'Wishes & Celebration 🎂', short: '4. Celebration 🎂' }
        ].map((rm) => {
          const isActive = currentRoomIndex === rm.num;
          return (
            <button
              key={rm.num}
              onClick={() => handleJumpToRoom(rm.num)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-[#c5a059] text-black font-bold shadow-md shadow-amber-500/30'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="hidden sm:inline">{rm.label}</span>
              <span className="inline sm:hidden">{rm.short}</span>
            </button>
          );
        })}
      </div>

      {/* Celebration Banner when candles are blown */}
      {showCelebrationBanner && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
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

      {/* NEAR DOOR INTERACTION PROMPT */}
      {nearDoor && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <button
            onClick={() => handleToggleDoor(nearDoor.id)}
            className="flex items-center gap-3 px-7 py-3 rounded-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-white font-display font-bold text-sm tracking-wider shadow-2xl hover:scale-105 transition-all cursor-pointer animate-pulse border-2 border-white"
          >
            <span className="w-7 h-7 rounded-full bg-white text-amber-800 font-mono font-black text-xs flex items-center justify-center">
              E
            </span>
            <div className="flex items-center gap-2">
              {nearDoor.isOpen ? <DoorOpen className="w-4 h-4" /> : <DoorClosed className="w-4 h-4" />}
              <span>{nearDoor.isOpen ? `Close Door` : `Open Door: ${nearDoor.title}`}</span>
            </div>
          </button>
        </div>
      )}

      {/* Near Cake Celebration Interaction Prompt */}
      {isNearCake && !nearDoor && !candlesBlown && (
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
      {isNearWishes && !nearDoor && !isNearCake && !nearbyExhibit && (
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

      {/* Prompt [E] Inspect Artwork (Photo or Video) */}
      {nearbyExhibit && !nearDoor && !isNearCake && !isNearWishes && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <button
            onClick={() => onInspectExhibit(nearbyExhibit)}
            className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/95 border border-[#c5a059] text-[#1a1918] shadow-2xl backdrop-blur-md hover:scale-105 transition-all cursor-pointer animate-pulse"
          >
            <span className="w-6 h-6 rounded bg-[#c5a059] text-black font-mono font-bold text-xs flex items-center justify-center">
              E
            </span>
            <div className="flex items-center gap-2">
              {nearbyExhibit.mediaType === 'video' || nearbyExhibit.videoUrl ? (
                <Video className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="text-xs font-display font-bold text-stone-900">
                {nearbyExhibit.mediaType === 'video' || nearbyExhibit.videoUrl ? 'Watch Video: ' : 'View Photo: '}
                {nearbyExhibit.title}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Bottom Walking & Looking Hint */}
      {!isLocked && !isTouring && (
        <div
          onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.requestPointerLock?.();
          }}
          className="absolute inset-0 z-20 cursor-pointer flex items-end justify-center pb-6"
        >
          <div className="px-5 py-2 rounded-full bg-black/70 border border-[#c5a059]/40 text-[#c5a059] text-xs uppercase tracking-widest font-mono backdrop-blur-sm pointer-events-none shadow-md animate-pulse">
            Click Screen to Look Around · WASD to Walk · [E] Interact
          </div>
        </div>
      )}
    </div>
  );
}
