'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { MuseumConfig, Exhibit, ArcadeManifest, MysteryBoxItem, HiddenMemoryItem } from '@/types/museum';
import { getAssetPath } from '@/lib/assetHelper';
import { ArcadeCabinet3D, MysteryGiftBox3D, HiddenMemoryToken3D } from './Arcade3DElements';
import { CinematicRoom1Environment } from '../cinematic/CinematicRoom1Environment';
import {
  TwinklingFairyLights,
  FestiveBalloonsCluster,
  MagicalCelebrationDust,
  CakeSparklerFountain
} from '../cinematic/BirthdayFestiveDecorations';
import {
  Sparkles,
  Music,
  Video,
  Image as ImageIcon,
  DoorOpen,
  DoorClosed,
  PartyPopper,
  Compass,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Gamepad2,
  Gift,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Film
} from 'lucide-react';

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
  arcade?: ArcadeManifest;
  collectedMemoryIds?: string[];
  openedBoxIds?: string[];
  onOpenArcade?: (defaultTab?: 'caption' | 'trivia' | 'scavenger' | 'boxes') => void;
  onOpenMysteryBox?: (box: MysteryBoxItem) => void;
  onCollectHiddenMemory?: (memory: HiddenMemoryItem) => void;
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

// Synthesize pleasant discovery chime on memory pickup or artwork approach
function playDiscoverySound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [587.33, 880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch {}
}

export interface MovieShot {
  id: string;
  type: 'intro' | 'exhibit' | 'door_transit' | 'cake_finale';
  cameraPos: [number, number, number];
  lookAt: [number, number, number];
  duration: number;
  roomNumber: number;
  roomTitle: string;
  badge: string;
  title: string;
  description?: string;
  date?: string;
  doorToOpen?: 1 | 2 | 3;
}

// 4-Room Physical Walkable Boundary Physics with Real Closed Door Collisions
function isValidPosition(
  x: number,
  z: number,
  doors: { door1: boolean; door2: boolean; door3: boolean }
): boolean {
  // Room 1: Memorable Moments & Portico Arrival Terrace (Z: [11.5, -13.5], X: [-8.5, 8.5])
  if (x >= -8.5 && x <= 8.5 && z >= -13.5 && z <= 11.5) return true;

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

// First-person WASD & Touch Mobile Player Controller with Smooth FOV Zoom
function PlayerController({
  onNearExhibitChange,
  onNearCakeChange,
  onNearWishesChange,
  onNearDoorChange,
  onNearArcadeChange,
  onNearMysteryBoxChange,
  onNearHiddenMemoryChange,
  onPlayerPositionChange,
  doors,
  exhibitsWithPositions,
  arcade,
  collectedMemoryIds = [],
  isTouring,
  movieShots = [],
  activeShotIndex = 0,
  isMoviePaused = false,
  onAdvanceMovieShot,
  onAutoOpenDoor,
  isIntroPlaying = false,
  onIntroComplete,
  teleportTarget,
  joystickInput,
  touchLookDelta,
  targetFov
}: {
  onNearExhibitChange: (exhibit: Exhibit | null) => void;
  onNearCakeChange: (nearCake: boolean) => void;
  onNearWishesChange: (nearWishes: boolean) => void;
  onNearDoorChange: (door: { id: 1 | 2 | 3; title: string; isOpen: boolean } | null) => void;
  onNearArcadeChange: (near: boolean) => void;
  onNearMysteryBoxChange: (box: MysteryBoxItem | null) => void;
  onNearHiddenMemoryChange: (memory: HiddenMemoryItem | null) => void;
  onPlayerPositionChange: (pos: [number, number, number]) => void;
  doors: { door1: boolean; door2: boolean; door3: boolean };
  exhibitsWithPositions: { exhibit: Exhibit; position: [number, number, number] }[];
  arcade?: ArcadeManifest;
  collectedMemoryIds?: string[];
  isTouring: boolean;
  movieShots?: MovieShot[];
  activeShotIndex?: number;
  isMoviePaused?: boolean;
  onAdvanceMovieShot?: (nextIndex: number) => void;
  onAutoOpenDoor?: (doorId: 1 | 2 | 3) => void;
  isIntroPlaying?: boolean;
  onIntroComplete?: () => void;
  teleportTarget: [number, number, number] | null;
  joystickInput: { x: number; y: number };
  touchLookDelta: React.MutableRefObject<{ x: number; y: number }>;
  targetFov: number;
}) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const velocity = useRef(new THREE.Vector3());
  const tourProgress = useRef(0);
  const introProgress = useRef(0);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const movieTimer = useRef(0);
  const currentLookAt = useRef(new THREE.Vector3(0, 1.65, -6));
  const confettiFired = useRef(false);

  useEffect(() => {
    movieTimer.current = 0;
  }, [activeShotIndex]);

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
    if (isIntroPlaying) {
      camera.position.set(0, 2.15, 10.5);
      camera.lookAt(0, 1.65, -4.0);
    } else {
      camera.position.set(0, 1.65, 1.5);
      camera.lookAt(0, 1.65, -6);
    }
    euler.current.setFromQuaternion(camera.quaternion);

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
  }, [camera, isIntroPlaying]);

  // Handle fast-travel / teleporting when clicking room tabs
  useEffect(() => {
    if (teleportTarget) {
      camera.position.set(...teleportTarget);
      camera.lookAt(teleportTarget[0], 1.65, teleportTarget[2] - 8);
      euler.current.setFromQuaternion(camera.quaternion);
    }
  }, [teleportTarget, camera]);

  useFrame((_, delta) => {
    // Cinematic Arrival Intro Glide
    if (isIntroPlaying) {
      introProgress.current += delta * 0.26;
      const t = Math.min(1, introProgress.current);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Glide from Grand Portico [0, 2.15, 10.5] into Room 1 [0, 1.65, 1.2]
      camera.position.set(
        0,
        THREE.MathUtils.lerp(2.15, 1.65, eased),
        THREE.MathUtils.lerp(10.5, 1.2, eased)
      );
      camera.lookAt(0, 1.65, -4.0);
      euler.current.setFromQuaternion(camera.quaternion);
      onPlayerPositionChange([camera.position.x, camera.position.y, camera.position.z]);

      if (t >= 1) {
        onIntroComplete?.();
      }
      return;
    }

    // Smooth Camera Zoom In / Out Damping
    const pCamera = camera as THREE.PerspectiveCamera;
    if (pCamera.isPerspectiveCamera && Math.abs(pCamera.fov - targetFov) > 0.05) {
      pCamera.fov = THREE.MathUtils.damp(pCamera.fov, targetFov, 9, delta);
      pCamera.updateProjectionMatrix();
    }

    // Touch Drag Camera Look for Mobile Phones
    if (touchLookDelta.current.x !== 0 || touchLookDelta.current.y !== 0) {
      euler.current.y -= touchLookDelta.current.x * 0.0035;
      euler.current.x = Math.max(-1.15, Math.min(1.15, euler.current.x - touchLookDelta.current.y * 0.0035));
      camera.quaternion.setFromEuler(euler.current);
      touchLookDelta.current = { x: 0, y: 0 };
    }

    if (isTouring && movieShots && movieShots.length > 0) {
      const currentShot = movieShots[activeShotIndex || 0] || movieShots[0];

      // Auto open doors along path
      if (currentShot.doorToOpen && onAutoOpenDoor) {
        onAutoOpenDoor(currentShot.doorToOpen);
      }

      // Fire confetti when reaching cake finale
      if (currentShot.type === 'cake_finale' && !confettiFired.current) {
        confettiFired.current = true;
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#ffd700', '#ff69b4', '#00e5ff', '#ff851b', '#2ecc40']
          });
        } catch {}
      }

      // Progress movie shot timer if not paused
      if (!isMoviePaused && onAdvanceMovieShot) {
        movieTimer.current += delta;
        if (movieTimer.current >= currentShot.duration) {
          movieTimer.current = 0;
          const nextIdx = ((activeShotIndex || 0) + 1) % movieShots.length;
          if (nextIdx === 0) confettiFired.current = false;
          onAdvanceMovieShot(nextIdx);
        }
      }

      const targetPos = new THREE.Vector3(...currentShot.cameraPos);
      const targetLook = new THREE.Vector3(...currentShot.lookAt);

      // In cake finale, slowly orbit around cake
      if (currentShot.type === 'cake_finale') {
        const tOrbit = movieTimer.current * 0.22;
        const radius = 5.2;
        targetPos.x = Math.sin(tOrbit) * radius;
        targetPos.z = -72 + Math.cos(tOrbit) * radius;
        targetPos.y = 1.95 + Math.sin(tOrbit * 2) * 0.12;
      }

      camera.position.lerp(targetPos, Math.min(1, delta * 2.6));
      currentLookAt.current.lerp(targetLook, Math.min(1, delta * 3.2));
      camera.lookAt(currentLookAt.current);
      euler.current.setFromQuaternion(camera.quaternion);

      onPlayerPositionChange([camera.position.x, camera.position.y, camera.position.z]);
      return;
    }

    const speed = 7.0;
    const damping = 9.0;

    velocity.current.x -= velocity.current.x * damping * delta;
    velocity.current.z -= velocity.current.z * damping * delta;

    // Support BOTH Desktop Keyboard (WASD) AND Mobile Touch Virtual Joystick
    const keyboardForward =
      Number(Boolean(keys.current['KeyW'] || keys.current['ArrowUp'])) -
      Number(Boolean(keys.current['KeyS'] || keys.current['ArrowDown']));
    const keyboardStrafe =
      Number(Boolean(keys.current['KeyD'] || keys.current['ArrowRight'])) -
      Number(Boolean(keys.current['KeyA'] || keys.current['ArrowLeft']));

    const forwardInput = keyboardForward !== 0 ? keyboardForward : -joystickInput.y;
    const strafeInput = keyboardStrafe !== 0 ? keyboardStrafe : joystickInput.x;

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

    // Check proximity to Arcade Machines (Room 2 at [-6.8, 0, -25], Room 3 at [6.8, 0, -47])
    const distToArcade1 = camera.position.distanceTo(new THREE.Vector3(-6.8, 1.65, -25.0));
    const distToArcade2 = camera.position.distanceTo(new THREE.Vector3(6.8, 1.65, -47.0));
    onNearArcadeChange(distToArcade1 < 3.0 || distToArcade2 < 3.0);

    // Check proximity to Mystery Gift Boxes
    let closestBox: MysteryBoxItem | null = null;
    let minBoxDist = 2.8;
    if (arcade?.mysteryBoxes) {
      for (const box of arcade.mysteryBoxes) {
        const dist = camera.position.distanceTo(new THREE.Vector3(...box.position));
        if (dist < minBoxDist) {
          minBoxDist = dist;
          closestBox = box;
        }
      }
    }
    onNearMysteryBoxChange(closestBox);

    // Check proximity to Hidden Memories (uncollected)
    let closestMem: HiddenMemoryItem | null = null;
    let minMemDist = 2.6;
    if (arcade?.hiddenMemories) {
      for (const mem of arcade.hiddenMemories) {
        if (!collectedMemoryIds.includes(mem.id)) {
          const dist = camera.position.distanceTo(new THREE.Vector3(...mem.position));
          if (dist < minMemDist) {
            minMemDist = dist;
            closestMem = mem;
          }
        }
      }
    }
    onNearHiddenMemoryChange(closestMem);
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

  const sideWidth = (width - doorWidth) / 2;
  const leftCenterX = -width / 2 + sideWidth / 2;
  const rightCenterX = width / 2 - sideWidth / 2;
  const lintelHeight = height - doorHeight;
  const lintelCenterY = doorHeight + lintelHeight / 2;

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
      <mesh position={[leftCenterX, 0.08, 0]}>
        <boxGeometry args={[sideWidth, 0.16, wallThickness + 0.04]} />
        <meshStandardMaterial color="#2c221a" roughness={0.5} />
      </mesh>

      {/* 2. SOLID RIGHT WALL BLOCK */}
      <mesh position={[rightCenterX, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideWidth, height, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>
      <mesh position={[rightCenterX, 0.08, 0]}>
        <boxGeometry args={[sideWidth, 0.16, wallThickness + 0.04]} />
        <meshStandardMaterial color="#2c221a" roughness={0.5} />
      </mesh>

      {/* 3. SOLID LINTEL WALL BLOCK ABOVE DOORWAY */}
      <mesh position={[0, lintelCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={[doorWidth, lintelHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>

      {/* 4. SOLID DOORWAY ARCHITRAVE / CASING */}
      <mesh position={[-doorWidth / 2, doorHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.18, doorHeight, wallThickness + 0.06]} />
        <meshStandardMaterial color="#2c221a" roughness={0.35} />
      </mesh>
      <mesh position={[doorWidth / 2, doorHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.18, doorHeight, wallThickness + 0.06]} />
        <meshStandardMaterial color="#2c221a" roughness={0.35} />
      </mesh>
      <mesh position={[0, doorHeight + 0.09, 0]} castShadow>
        <boxGeometry args={[doorWidth + 0.36, 0.18, wallThickness + 0.08]} />
        <meshStandardMaterial color="#2c221a" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[doorWidth + 0.1, 0.04, wallThickness + 0.08]} />
        <meshStandardMaterial color="#c5a059" metalness={0.8} roughness={0.3} />
      </mesh>

      <pointLight position={[0, doorHeight - 0.1, 0]} intensity={12} distance={3.5} color="#ffe2aa" />

      {/* 5. OVERHEAD BRASS ROOM SIGN */}
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
          <mesh castShadow receiveShadow>
            <boxGeometry args={[doorWidth / 2 - 0.09, doorHeight - 0.08, 0.08]} />
            <meshStandardMaterial color="#3b2b20" roughness={0.35} />
          </mesh>
          {[-0.8, 0.2, 1.0].map((yOff, pIdx) => (
            <React.Fragment key={pIdx}>
              <mesh position={[0, yOff, 0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
              <mesh position={[0, yOff, -0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
            </React.Fragment>
          ))}
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
          <mesh castShadow receiveShadow>
            <boxGeometry args={[doorWidth / 2 - 0.09, doorHeight - 0.08, 0.08]} />
            <meshStandardMaterial color="#3b2b20" roughness={0.35} />
          </mesh>
          {[-0.8, 0.2, 1.0].map((yOff, pIdx) => (
            <React.Fragment key={pIdx}>
              <mesh position={[0, yOff, 0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
              <mesh position={[0, yOff, -0.042]}>
                <boxGeometry args={[doorWidth / 2 - 0.36, 0.65, 0.02]} />
                <meshStandardMaterial color="#2e2118" roughness={0.4} />
              </mesh>
            </React.Fragment>
          ))}
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

// Framed Artwork in 3D: Supports BOTH Photo Frames AND High-Tech Video Displays with Cinematic Dynamic Highlight
function FramedArtwork({
  exhibit,
  position,
  rotation,
  onInspect,
  isNearby = false
}: {
  exhibit: Exhibit;
  position: [number, number, number];
  rotation: [number, number, number];
  onInspect: (exhibit: Exhibit) => void;
  isNearby?: boolean;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const isVideo = exhibit.mediaType === 'video' || Boolean(exhibit.videoUrl);

  useFrame((_, delta) => {
    if (spotLightRef.current) {
      const targetIntensity = isNearby ? (isVideo ? 34 : 44) : (isVideo ? 16 : 24);
      spotLightRef.current.intensity = THREE.MathUtils.damp(
        spotLightRef.current.intensity,
        targetIntensity,
        6,
        delta
      );
    }
  });

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      getAssetPath(exhibit.imageUrl),
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
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[frameWidth + 0.08, frameHeight + 0.08, 0.03]} />
        <meshBasicMaterial color={isVideo ? '#121214' : '#1a1918'} />
      </mesh>

      <mesh position={[0, 0, 0.038]} castShadow>
        <boxGeometry args={[frameWidth + 0.04, frameHeight + 0.04, 0.02]} />
        <meshStandardMaterial
          color={isVideo ? '#2a2b2f' : '#c5a059'}
          metalness={isVideo ? 0.9 : 0.85}
          roughness={isVideo ? 0.2 : 0.25}
          emissive={isNearby ? (isVideo ? '#2563eb' : '#d4af37') : '#000000'}
          emissiveIntensity={isNearby ? 0.35 : 0}
        />
      </mesh>

      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[frameWidth, frameHeight, 0.01]} />
        <meshStandardMaterial color={isVideo ? '#08080a' : '#faf9f6'} roughness={0.8} />
      </mesh>

      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[frameWidth - 0.28, frameHeight - 0.28]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial color="#2d2a26" roughness={0.6} />
        )}
      </mesh>

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

      <spotLight
        ref={spotLightRef}
        position={[0, 2.5, 1.6]}
        target-position={[0, 0, 0]}
        intensity={isVideo ? 16 : 24}
        distance={6.5}
        angle={0.55}
        penumbra={0.75}
        color={isVideo ? '#e0f0ff' : '#fff4df'}
      />

      <group position={[0, -frameHeight / 2 - 0.22, 0.03]}>
        <mesh>
          <boxGeometry args={[Math.min(frameWidth, 1.8), 0.18, 0.02]} />
          <meshStandardMaterial
            color="#c5a059"
            metalness={0.85}
            roughness={0.25}
            emissive={isNearby ? '#d4af37' : '#000000'}
            emissiveIntensity={isNearby ? 0.3 : 0}
          />
        </mesh>
        {isNearby && (
          <pointLight position={[0, 0, 0.25]} intensity={3.0} distance={1.8} color="#ffd899" />
        )}
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
              <mesh position={[0, 4.8, 0]} castShadow>
                <sphereGeometry args={[0.36, 24, 24]} />
                <meshStandardMaterial color={col} roughness={0.15} metalness={0.2} />
              </mesh>
              <mesh position={[0, 4.42, 0]}>
                <coneGeometry args={[0.06, 0.08, 12]} />
                <meshStandardMaterial color={col} roughness={0.2} />
              </mesh>
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
      room3Wall: new THREE.MeshStandardMaterial({ color: '#1a1918', roughness: 0.5, side: THREE.DoubleSide }),
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
      {/* ===================== FESTIVE BIRTHDAY DECORATIONS ===================== */}
      {/* Ceiling Twinkling Fairy Lights across all 4 rooms */}
      <TwinklingFairyLights startPos={[-8, 5.4, 2]} endPos={[8, 5.4, -13]} count={26} />
      <TwinklingFairyLights startPos={[-8, 5.4, -15]} endPos={[8, 5.4, -35]} count={26} />
      <TwinklingFairyLights startPos={[-8, 5.4, -37]} endPos={[8, 5.4, -57]} count={26} />
      <TwinklingFairyLights startPos={[-10, 6.2, -59]} endPos={[10, 6.2, -85]} count={30} />
      <TwinklingFairyLights startPos={[10, 6.2, -59]} endPos={[-10, 6.2, -85]} count={30} />

      {/* Floating Helium Balloon Clusters in Room Corners */}
      <FestiveBalloonsCluster position={[-7.5, 0, 1.5]} />
      <FestiveBalloonsCluster position={[7.5, 0, -11]} />
      <FestiveBalloonsCluster position={[7.5, 0, -22]} />
      <FestiveBalloonsCluster position={[-7.5, 0, -44]} />
      <FestiveBalloonsCluster position={[-3.8, 0, -72]} />
      <FestiveBalloonsCluster position={[3.8, 0, -72]} />

      {/* Magical Floating Golden Stardust Atmosphere */}
      <MagicalCelebrationDust count={120} />

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

      {/* Central Entrance Bronze Portal Archway at Z = 4 */}
      <group position={[0, 0, 4]}>
        {/* Portal Frame Header */}
        <mesh position={[0, 3.85, 0]} castShadow>
          <boxGeometry args={[3.6, 0.22, 0.38]} />
          <meshStandardMaterial color="#c5a059" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Portal Side Posts */}
        {[-1.8, 1.8].map((px, pi) => (
          <mesh key={pi} position={[px, 1.9, 0]} castShadow>
            <boxGeometry args={[0.22, 3.8, 0.38]} />
            <meshStandardMaterial color="#c5a059" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* SOLID West & East Side Walls in Room 1 */}
      <mesh position={[-9, 2.9, -5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 18]} />
        <meshStandardMaterial color="#f7f6f2" roughness={0.4} />
      </mesh>
      <mesh position={[9, 2.9, -5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 5.8, 18]} />
        <meshStandardMaterial color="#f7f6f2" roughness={0.4} />
      </mesh>

      {/* Stage C: Cinematic Architecture, Coffered Ceiling, Fireplace & Gallery Seating */}
      <CinematicRoom1Environment />

      {/* Room 1 Area Rug */}
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

        {/* Live Golden Sparkler Fountain atop the Cake */}
        {!candlesBlown && (
          <CakeSparklerFountain position={[0, 2.38, 0]} />
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

// Mobile On-Screen Virtual Thumbstick
function VirtualJoystick({ onChange }: { onChange: (vec: { x: number; y: number }) => void }) {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const maxRadius = 38;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    if (baseRef.current) {
      const rect = baseRef.current.getBoundingClientRect();
      baseCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - baseCenterRef.current.x;
        const dy = touch.clientY - baseCenterRef.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const clampedX = Math.cos(angle) * clampedDist;
        const clampedY = Math.sin(angle) * clampedDist;

        setKnobPos({ x: clampedX, y: clampedY });
        onChange({
          x: clampedX / maxRadius,
          y: clampedY / maxRadius
        });
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onChange({ x: 0, y: 0 });
        break;
      }
    }
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-28 h-28 rounded-full bg-black/50 border-2 border-[#c5a059]/50 backdrop-blur-md flex items-center justify-center touch-none select-none shadow-2xl pointer-events-auto"
    >
      <div className="absolute top-1.5 text-[9px] text-[#c5a059] font-mono opacity-80">▲</div>
      <div className="absolute bottom-1.5 text-[9px] text-[#c5a059] font-mono opacity-80">▼</div>
      <div className="absolute left-1.5 text-[9px] text-[#c5a059] font-mono opacity-80">◀</div>
      <div className="absolute right-1.5 text-[9px] text-[#c5a059] font-mono opacity-80">▶</div>

      <div
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-[#c5a059] border-2 border-white shadow-lg pointer-events-none transition-transform duration-75 flex items-center justify-center"
      >
        <Move className="w-4 h-4 text-black opacity-60" />
      </div>
    </div>
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
  onAddMedia,
  arcade,
  collectedMemoryIds = [],
  openedBoxIds = [],
  onOpenArcade,
  onOpenMysteryBox,
  onCollectHiddenMemory
}: MuseumWalkthrough3DProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [nearbyExhibit, setNearbyExhibit] = useState<Exhibit | null>(null);
  const [isNearCake, setIsNearCake] = useState(false);
  const [isNearWishes, setIsNearWishes] = useState(false);
  const [isNearArcade, setIsNearArcade] = useState(false);
  const [nearMysteryBox, setNearMysteryBox] = useState<MysteryBoxItem | null>(null);
  const [nearHiddenMemory, setNearHiddenMemory] = useState<HiddenMemoryItem | null>(null);
  const [nearDoor, setNearDoor] = useState<{ id: 1 | 2 | 3; title: string; isOpen: boolean } | null>(null);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const [doors, setDoors] = useState({ door1: false, door2: false, door3: false });
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);

  // Cinematic Arrival Intro State (plays smooth camera glide from Portico to Room 1)
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);

  const handleOpenBirthdayMuseum = () => {
    setIsIntroPlaying(false);
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff69b4', '#00e5ff', '#ff851b', '#2ecc40']
    });
    playDiscoverySound();
    try {
      window.dispatchEvent(new CustomEvent('play-birthday-song'));
    } catch {}
  };

  const handleSkipIntro = () => {
    handleOpenBirthdayMuseum();
  };

  // Mobile Camera Zoom In / Out State (FOV: 25 max zoom in, 64 default, 85 wide zoom out)
  const [targetFov, setTargetFov] = useState(64);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartFovRef = useRef<number>(64);

  // Mobile virtual joystick & touch look state
  const [joystickInput, setJoystickInput] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchLookDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Detect touch screens / smartphones on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (window as any).matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  // Zoom In, Zoom Out, and Reset Handlers
  const handleZoomIn = () => {
    setTargetFov((prev) => Math.max(25, prev - 12));
  };

  const handleZoomOut = () => {
    setTargetFov((prev) => Math.min(85, prev + 12));
  };

  const handleResetZoom = () => {
    setTargetFov(64);
  };

  // Two-Finger Pinch-to-Zoom AND Single-Finger Drag-to-Look on Mobile Phones
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch gesture started!
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchStartDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartFovRef.current = targetFov;
      lookTouchIdRef.current = null;
      return;
    }

    // Single-finger touch for camera rotation
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.clientX > window.innerWidth * 0.35 && lookTouchIdRef.current === null) {
        lookTouchIdRef.current = touch.identifier;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Check for Two-Finger Pinch-to-Zoom
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDist / pinchStartDistRef.current;
      // Spreading fingers apart (ratio > 1) -> decrease FOV (zoom in)
      // Pinching fingers closer (ratio < 1) -> increase FOV (zoom out)
      const calculatedFov = THREE.MathUtils.clamp(pinchStartFovRef.current / ratio, 25, 88);
      setTargetFov(calculatedFov);
      return;
    }

    // Single-finger touch camera look
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPosRef.current.x;
        const dy = touch.clientY - lastLookPosRef.current.y;
        touchLookDelta.current.x += dx;
        touchLookDelta.current.y += dy;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null;
    }
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  // Desktop Mouse Wheel Zoom Support
  const handleWheel = (e: React.WheelEvent) => {
    if (isTouring) return;
    if (e.deltaY < 0) {
      setTargetFov((prev) => Math.max(25, prev - 5));
    } else if (e.deltaY > 0) {
      setTargetFov((prev) => Math.min(85, prev + 5));
    }
  };

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
          if (eIdx === 0) list.push({ exhibit, position: [-8.8, 2.2, -2], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 1) list.push({ exhibit, position: [-8.8, 2.2, -9], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 2) list.push({ exhibit, position: [8.8, 2.2, -2], rotation: [0, -Math.PI / 2, 0] });
          else list.push({ exhibit, position: [8.8, 2.2, -9], rotation: [0, -Math.PI / 2, 0] });
        } else if (gallery.id === 'gallery-funny' || gIdx === 1) {
          if (eIdx === 0) list.push({ exhibit, position: [-8.8, 2.2, -20], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 1) list.push({ exhibit, position: [-8.8, 2.2, -30], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 2) list.push({ exhibit, position: [8.8, 2.2, -20], rotation: [0, -Math.PI / 2, 0] });
          else list.push({ exhibit, position: [8.8, 2.2, -30], rotation: [0, -Math.PI / 2, 0] });
        } else if (gallery.id === 'gallery-embarrassing' || gIdx === 2) {
          if (eIdx === 0) list.push({ exhibit, position: [-8.8, 2.2, -42], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 1) list.push({ exhibit, position: [-8.8, 2.2, -52], rotation: [0, Math.PI / 2, 0] });
          else if (eIdx === 2) list.push({ exhibit, position: [8.8, 2.2, -42], rotation: [0, -Math.PI / 2, 0] });
          else list.push({ exhibit, position: [8.8, 2.2, -52], rotation: [0, -Math.PI / 2, 0] });
        } else {
          if (eIdx === 0) list.push({ exhibit, position: [-11.8, 2.4, -72], rotation: [0, Math.PI / 2, 0] });
          else list.push({ exhibit, position: [11.8, 2.4, -72], rotation: [0, -Math.PI / 2, 0] });
        }
      });
    });

    return list;
  }, [config.galleries]);

  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [isMoviePaused, setIsMoviePaused] = useState(false);

  // Cinematic Birthday Story Reel Director Choreography
  const movieShots = useMemo<MovieShot[]>(() => {
    const shots: MovieShot[] = [];

    // Shot 0: Welcome Arrival
    shots.push({
      id: 'shot-welcome',
      type: 'intro',
      cameraPos: [0, 1.85, 3.2],
      lookAt: [0, 1.8, -4],
      duration: 4.5,
      roomNumber: 1,
      roomTitle: 'Entrance Portico',
      badge: '✨ WELCOME TO YOUR STORY',
      title: `${config.profile.name}'s Birthday Retrospective`,
      description: 'Step into a world crafted entirely in your honor. Enjoy the trip down memory lane!'
    });

    // Room 1 Exhibits (Memorable Moments)
    const room1Exhibits = exhibitsWithPositions.filter((e) => e.position[2] > -14);
    room1Exhibits.forEach((item) => {
      const isLeft = item.position[0] < 0;
      shots.push({
        id: `shot-exhibit-${item.exhibit.id}`,
        type: 'exhibit',
        cameraPos: [isLeft ? -5.2 : 5.2, 2.1, item.position[2]],
        lookAt: [item.position[0], 2.1, item.position[2]],
        duration: 5.5,
        roomNumber: 1,
        roomTitle: 'Room 1 · Memorable Moments',
        badge: '📸 CHERISHED MEMORY',
        title: item.exhibit.title,
        date: item.exhibit.date,
        description: item.exhibit.story || item.exhibit.curatorNote
      });
    });

    // Door 1 Transit
    shots.push({
      id: 'shot-door-1',
      type: 'door_transit',
      cameraPos: [0, 1.75, -16.5],
      lookAt: [0, 1.75, -24],
      duration: 3.5,
      roomNumber: 2,
      roomTitle: 'Room 2 · Funny Memories',
      badge: '🚪 UNLOCKING NEXT CHAPTER',
      title: 'Entering Room 2: Funny Memories',
      description: 'Get ready for pure comedy! The following vault houses the silliest and most legendary moments.',
      doorToOpen: 1
    });

    // Room 2 Exhibits (Funny Memories)
    const room2Exhibits = exhibitsWithPositions.filter((e) => e.position[2] <= -14 && e.position[2] > -36);
    room2Exhibits.forEach((item) => {
      const isLeft = item.position[0] < 0;
      shots.push({
        id: `shot-exhibit-${item.exhibit.id}`,
        type: 'exhibit',
        cameraPos: [isLeft ? -5.2 : 5.2, 2.1, item.position[2]],
        lookAt: [item.position[0], 2.1, item.position[2]],
        duration: 5.5,
        roomNumber: 2,
        roomTitle: 'Room 2 · Funny Memories',
        badge: '😂 COMEDY GOLD',
        title: item.exhibit.title,
        date: item.exhibit.date,
        description: item.exhibit.story || item.exhibit.curatorNote
      });
    });

    // Door 2 Transit
    shots.push({
      id: 'shot-door-2',
      type: 'door_transit',
      cameraPos: [0, 1.75, -38.5],
      lookAt: [0, 1.75, -46],
      duration: 3.5,
      roomNumber: 3,
      roomTitle: 'Room 3 · Embarrassing Images',
      badge: '🙈 VAULT OF EMBARRASSMENT',
      title: 'Entering Room 3: Embarrassing Moments & Fails',
      description: 'The classified funny fails and nostalgic goof-ups you can never live down!',
      doorToOpen: 2
    });

    // Room 3 Exhibits (Embarrassing Moments)
    const room3Exhibits = exhibitsWithPositions.filter((e) => e.position[2] <= -36 && e.position[2] > -58);
    room3Exhibits.forEach((item) => {
      const isLeft = item.position[0] < 0;
      shots.push({
        id: `shot-exhibit-${item.exhibit.id}`,
        type: 'exhibit',
        cameraPos: [isLeft ? -5.2 : 5.2, 2.1, item.position[2]],
        lookAt: [item.position[0], 2.1, item.position[2]],
        duration: 5.5,
        roomNumber: 3,
        roomTitle: 'Room 3 · Embarrassing Images',
        badge: '🙈 NO REGRETS',
        title: item.exhibit.title,
        date: item.exhibit.date,
        description: item.exhibit.story || item.exhibit.curatorNote
      });
    });

    // Door 3 Transit
    shots.push({
      id: 'shot-door-3',
      type: 'door_transit',
      cameraPos: [0, 1.75, -61.0],
      lookAt: [0, 1.75, -72],
      duration: 4.0,
      roomNumber: 4,
      roomTitle: 'Room 4 · Grand Celebration Hall',
      badge: '🎂 THE BIRTHDAY FINALE',
      title: 'Entering Grand Celebration Hall!',
      description: 'Music, champagne, floating balloons, and a 3-tier birthday cake celebrate you today!',
      doorToOpen: 3
    });

    // Room 4 Cake Finale
    shots.push({
      id: 'shot-cake-finale',
      type: 'cake_finale',
      cameraPos: [0, 1.9, -67.5],
      lookAt: [0, 1.5, -72],
      duration: 16.0,
      roomNumber: 4,
      roomTitle: 'Room 4 · Grand Celebration Hall',
      badge: '🎉 HAPPY BIRTHDAY!',
      title: `Happy Birthday, ${config.profile.name}! 🎂`,
      description: 'May all your dreams and wishes come true this year! Make a wish and blow out the candles!'
    });

    return shots;
  }, [config.profile.name, exhibitsWithPositions]);

  const handleNextShot = () => {
    setActiveShotIndex((prev) => (prev + 1) % movieShots.length);
  };
  const handlePrevShot = () => {
    setActiveShotIndex((prev) => (prev - 1 + movieShots.length) % movieShots.length);
  };
  const currentMovieShot = movieShots[activeShotIndex] || movieShots[0];

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
      // Allow skipping intro instantly with Space, Enter, or W
      if (isIntroPlaying && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyW')) {
        handleSkipIntro();
        return;
      }

      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        if (nearDoor) {
          handleToggleDoor(nearDoor.id);
        } else if (nearHiddenMemory) {
          playDiscoverySound();
          onCollectHiddenMemory?.(nearHiddenMemory);
        } else if (nearMysteryBox) {
          playDiscoverySound();
          onOpenMysteryBox?.(nearMysteryBox);
        } else if (isNearArcade) {
          onOpenArcade?.();
        } else if (isNearCake && !candlesBlown) {
          handleCelebrateAndBlowCandles();
        } else if (isNearWishes) {
          onOpenWishes?.();
        } else if (nearbyExhibit) {
          playDiscoverySound();
          onInspectExhibit(nearbyExhibit);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isIntroPlaying,
    nearDoor,
    nearbyExhibit,
    isNearCake,
    isNearWishes,
    isNearArcade,
    nearMysteryBox,
    nearHiddenMemory,
    candlesBlown,
    onInspectExhibit,
    onOpenWishes,
    onOpenArcade,
    onOpenMysteryBox,
    onCollectHiddenMemory
  ]);

  // Current Zoom factor label e.g. "1.0x", "1.5x", "2.0x"
  const currentZoomFactor = useMemo(() => {
    const factor = Math.round((64 / targetFov) * 10) / 10;
    return `${factor}x`;
  }, [targetFov]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      className="relative w-full h-screen bg-[#c8e2f2] select-none overflow-hidden touch-none"
    >
      <Canvas
        shadows="percentage"
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 64, near: 0.1, far: 200, position: [0, 1.65, 2] }}
        dpr={[1, 1.8]}
      >
        <color attach="background" args={['#c2dff2']} />

        {/* Cinematic Atmospheric Lighting: Warm balanced ambient fill with rich directional sunbeams */}
        <ambientLight intensity={0.52} color="#fcf6ec" />
        <directionalLight
          position={[18, 32, 22]}
          intensity={2.2}
          color="#fff5e6"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-15, 20, -15]} intensity={0.4} color="#dbeafe" />

        <PlayerController
          onNearExhibitChange={setNearbyExhibit}
          onNearCakeChange={setIsNearCake}
          onNearWishesChange={setIsNearWishes}
          onNearDoorChange={setNearDoor}
          onNearArcadeChange={setIsNearArcade}
          onNearMysteryBoxChange={setNearMysteryBox}
          onNearHiddenMemoryChange={setNearHiddenMemory}
          onPlayerPositionChange={handlePlayerPositionChange}
          doors={doors}
          exhibitsWithPositions={exhibitsWithPositions}
          arcade={arcade}
          collectedMemoryIds={collectedMemoryIds}
          isTouring={isTouring}
          movieShots={movieShots}
          activeShotIndex={activeShotIndex}
          isMoviePaused={isMoviePaused}
          onAdvanceMovieShot={setActiveShotIndex}
          onAutoOpenDoor={(doorId) => {
            setDoors((d) => {
              const key = `door${doorId}` as keyof typeof d;
              if (!d[key]) {
                playDoorSound(true);
                return { ...d, [key]: true };
              }
              return d;
            });
          }}
          isIntroPlaying={isIntroPlaying}
          onIntroComplete={() => setIsIntroPlaying(false)}
          teleportTarget={teleportTarget}
          joystickInput={joystickInput}
          touchLookDelta={touchLookDelta}
          targetFov={targetFov}
        />

        {!isTouring && !isTouchDevice && !isIntroPlaying && (
          <PointerLockControls
            onLock={() => setIsLocked(true)}
            onUnlock={() => setIsLocked(false)}
          />
        )}

        <LuxuryVillaStepByStepArchitecture doors={doors} candlesBlown={candlesBlown} />

        {/* 3D Arcade Cabinets in Room 2 (Funny) and Room 3 (Fails) */}
        <ArcadeCabinet3D
          position={[-6.8, 0, -25]}
          rotation={[0, Math.PI / 2, 0]}
          title="MISCHIEF ARCADE"
          color="#9f7aea"
        />
        <ArcadeCabinet3D
          position={[6.8, 0, -47]}
          rotation={[0, -Math.PI / 2, 0]}
          title="MISCHIEF ARCADE"
          color="#ed8936"
        />

        {/* 3D Mystery Gift Boxes */}
        {arcade?.mysteryBoxes.map((box) => (
          <MysteryGiftBox3D
            key={box.id}
            box={box}
            isOpened={openedBoxIds.includes(box.id)}
          />
        ))}

        {/* 3D Hidden Memory Tokens */}
        {arcade?.hiddenMemories.map((mem) => (
          <HiddenMemoryToken3D
            key={mem.id}
            memory={mem}
            isCollected={collectedMemoryIds.includes(mem.id)}
          />
        ))}

        {exhibitsWithPositions.map((item) => (
          <FramedArtwork
            key={item.exhibit.id}
            exhibit={item.exhibit}
            position={item.position}
            rotation={item.rotation}
            onInspect={onInspectExhibit}
            isNearby={nearbyExhibit?.id === item.exhibit.id}
          />
        ))}
      </Canvas>



      {/* Celebration Banner when candles are blown */}
      {showCelebrationBanner && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce max-w-[90vw] text-center">
          <div className="px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white font-display font-bold text-sm sm:text-lg uppercase tracking-widest shadow-2xl shadow-rose-500/40 border-2 border-white/80">
            🎉 Happy Birthday {config.profile.name}! 🎂
          </div>
        </div>
      )}

      {/* Desktop Crosshair Dot */}
      {isLocked && !isTouring && !isTouchDevice && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_6px_#c5a059]" />
        </div>
      )}

      {/* ===================== MOBILE VIRTUAL JOYSTICK ===================== */}
      {isTouchDevice && !isTouring && (
        <div className="absolute bottom-6 left-6 z-40">
          <VirtualJoystick onChange={setJoystickInput} />
        </div>
      )}

      {/* Mobile Pinch / Drag Gestures Hint - REMOVED for clean screen */}

      {/* NEAR DOOR INTERACTION PROMPT */}
      {nearDoor && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={() => handleToggleDoor(nearDoor.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all cursor-pointer border-2 border-white"
          >
            <span className="w-5 h-5 rounded-full bg-neutral-950 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <div className="flex items-center gap-1.5">
              {nearDoor.isOpen ? <DoorOpen className="w-4 h-4" /> : <DoorClosed className="w-4 h-4" />}
              <span>{nearDoor.isOpen ? 'Close Door' : 'Open Door'}</span>
            </div>
          </button>
        </div>
      )}

      {/* NEAR HIDDEN MEMORY INTERACTION PROMPT */}
      {nearHiddenMemory && !nearDoor && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={() => onCollectHiddenMemory?.(nearHiddenMemory)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all cursor-pointer border-2 border-white"
          >
            <span className="w-5 h-5 rounded-full bg-neutral-950 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <span>Collect Memory ⭐</span>
          </button>
        </div>
      )}

      {/* NEAR MYSTERY BOX INTERACTION PROMPT */}
      {nearMysteryBox && !nearDoor && !nearHiddenMemory && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={() => onOpenMysteryBox?.(nearMysteryBox)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 text-white font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all cursor-pointer border-2 border-white"
          >
            <span className="w-5 h-5 rounded-full bg-white text-rose-600 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4" />
              <span>Open Gift 🎁</span>
            </div>
          </button>
        </div>
      )}

      {/* NEAR ARCADE STATION INTERACTION PROMPT */}
      {isNearArcade && !nearDoor && !nearHiddenMemory && !nearMysteryBox && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={() => onOpenArcade?.()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all cursor-pointer border-2 border-white"
          >
            <span className="w-5 h-5 rounded-full bg-white text-purple-700 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Play Games 🕹️</span>
            </div>
          </button>
        </div>
      )}

      {/* Near Cake Celebration Interaction Prompt */}
      {isNearCake && !nearDoor && !candlesBlown && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={handleCelebrateAndBlowCandles}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all cursor-pointer border-2 border-white"
          >
            <span className="w-5 h-5 rounded-full bg-white text-rose-600 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <span>Make a Wish 🎂</span>
          </button>
        </div>
      )}

      {/* Near Friend Wishes Desk Interaction Prompt */}
      {isNearWishes && !nearDoor && !isNearCake && !nearbyExhibit && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={() => onOpenWishes?.()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white font-display font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all cursor-pointer border-2 border-white"
          >
            <span className="w-5 h-5 rounded-full bg-white text-amber-700 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <span>Birthday Wishes 💌</span>
          </button>
        </div>
      )}

      {/* ===================== CINEMATIC BIRTHDAY STORY REEL OVERLAY ===================== */}
      {isTouring && currentMovieShot && (
        <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4 sm:p-6">
          {/* Top Center: Clean Shot Counter */}
          <div className="w-full flex items-center justify-center pointer-events-auto pt-14 sm:pt-4">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-950/80 border border-amber-500/40 backdrop-blur-md shadow-lg text-xs font-mono text-amber-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{activeShotIndex + 1} / {movieShots.length}</span>
            </div>
          </div>

          {/* Bottom Center: Cinematic Memory Subtitle Card */}
          <div className="w-full max-w-xl mx-auto pointer-events-auto pb-4 sm:pb-2">
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/92 border border-amber-500/60 shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all">
              {/* Badge & Date */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[11px] tracking-wide">
                  {currentMovieShot.badge}
                </span>
                {currentMovieShot.date && (
                  <span className="text-neutral-400 font-mono text-xs">📅 {currentMovieShot.date}</span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-serif font-black text-white tracking-wide">
                {currentMovieShot.title}
              </h3>

              {/* Caption */}
              {currentMovieShot.description && (
                <p className="text-xs sm:text-sm text-neutral-300 font-sans mt-1 line-clamp-2 leading-relaxed">
                  {currentMovieShot.description}
                </p>
              )}

              {/* Controls bar */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevShot}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                    title="Previous memory"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMoviePaused(!isMoviePaused)}
                    className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    {isMoviePaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                    <span>{isMoviePaused ? 'Play' : 'Pause'}</span>
                  </button>
                  <button
                    onClick={handleNextShot}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                    title="Next memory"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {currentMovieShot.type === 'cake_finale' && !candlesBlown && (
                  <button
                    onClick={handleCelebrateAndBlowCandles}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse border border-white"
                  >
                    <span>🎂 Blow Out Candles 💨</span>
                  </button>
                )}

                <button
                  onClick={onToggleTour}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-xs font-medium text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Free Walk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MINIMAL HEARTWARMING BIRTHDAY WELCOME CARD ===================== */}
      {isIntroPlaying && (
        <div
          onClick={handleOpenBirthdayMuseum}
          className="absolute inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 bg-black/80 backdrop-blur-md select-none cursor-pointer"
        >
          {/* Top subtle button */}
          <div className="w-full flex items-center justify-end pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenBirthdayMuseum();
              }}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 border border-white/20 cursor-pointer"
            >
              Enter →
            </button>
          </div>

          {/* Center Celebratory Title */}
          <div className="text-center max-w-xl mx-auto my-auto pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 animate-bounce">
              <span>🎂</span> HAPPY BIRTHDAY! <span>🎉</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#ffd700] to-amber-400 tracking-wide drop-shadow-2xl">
              {config.profile.name}
            </h1>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 pointer-events-auto">
              {/* Primary: Watch Birthday Movie */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBirthdayMuseum();
                  if (!isTouring) onToggleTour();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-[#ffd700] to-amber-500 text-neutral-950 font-display font-black text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-white"
              >
                <span>🎬 Watch Movie</span>
              </button>

              {/* Secondary: Explore */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBirthdayMuseum();
                  if (isTouring) onToggleTour();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-display font-bold text-sm tracking-wide backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-white/25"
              >
                <span>🕹️ Explore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt [E] Inspect Artwork (Photo or Video) */}
      {nearbyExhibit && !nearDoor && !isNearCake && !isNearWishes && !nearHiddenMemory && !nearMysteryBox && !isNearArcade && !isIntroPlaying && !isTouring && (
        <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[90vw]">
          <button
            onClick={() => {
              playDiscoverySound();
              onInspectExhibit(nearbyExhibit);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950/90 border-2 border-[#d4af37] text-white shadow-xl backdrop-blur-md hover:scale-105 transition-all cursor-pointer"
          >
            <span className="w-5 h-5 rounded-md bg-[#d4af37] text-neutral-950 font-mono font-bold text-[11px] flex items-center justify-center">
              {isTouchDevice ? '👆' : 'E'}
            </span>
            <div className="flex items-center gap-1.5">
              {nearbyExhibit.mediaType === 'video' || nearbyExhibit.videoUrl ? (
                <Video className="w-4 h-4 text-rose-400" />
              ) : (
                <ImageIcon className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs sm:text-sm font-serif font-bold text-neutral-100 truncate max-w-[200px]">
                {nearbyExhibit.title}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Desktop Hint - Short & Discreet */}
      {!isLocked && !isTouring && !isTouchDevice && (
        <div
          onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.requestPointerLock?.();
          }}
          className="absolute inset-0 z-20 cursor-pointer flex items-end justify-center pb-4"
        >
          <div className="px-4 py-1.5 rounded-full bg-black/60 border border-[#c5a059]/30 text-[#dfb76c] text-[11px] font-mono backdrop-blur-sm pointer-events-none shadow-sm">
            Click screen to look around · WASD to walk
          </div>
        </div>
      )}
    </div>
  );
}
