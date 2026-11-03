'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface CinematicDirectorState {
  mode: 'free' | 'intro' | 'inspect' | 'door_transition';
  targetPos?: THREE.Vector3;
  targetLook?: THREE.Vector3;
  progress: number;
}

/**
 * Cinematic Camera Choreographer
 * Manages smooth cinematic camera transitions for arrival, door openings, and memory inspections
 */
export function useCinematicCamera({
  isIntroPlaying,
  onIntroComplete
}: {
  isIntroPlaying: boolean;
  onIntroComplete?: () => void;
}) {
  const { camera } = useThree();
  const introTime = useRef(0);
  const introDuration = 4.8; // seconds

  // Spline waypoints for arrival camera glide
  const introStartPos = useMemo(() => new THREE.Vector3(0, 2.2, 12.0), []);
  const introMidPos = useMemo(() => new THREE.Vector3(0, 1.8, 6.0), []);
  const introEndPos = useMemo(() => new THREE.Vector3(0, 1.65, 1.0), []);

  const introLookTarget = useMemo(() => new THREE.Vector3(0, 1.65, -4.0), []);

  useFrame((_, delta) => {
    if (isIntroPlaying) {
      introTime.current += delta;
      const alpha = Math.min(1, introTime.current / introDuration);

      // Smooth easeInOutCubic curve
      const eased =
        alpha < 0.5
          ? 4 * alpha * alpha * alpha
          : 1 - Math.pow(-2 * alpha + 2, 3) / 2;

      // Glide through terrace into Room 1
      if (alpha < 0.5) {
        camera.position.lerpVectors(introStartPos, introMidPos, eased * 2);
      } else {
        camera.position.lerpVectors(introMidPos, introEndPos, (eased - 0.5) * 2);
      }

      camera.lookAt(introLookTarget.x, introLookTarget.y, introLookTarget.z);

      if (alpha >= 1) {
        onIntroComplete?.();
      }
    }
  });

  return {
    skipIntro: () => {
      camera.position.copy(introEndPos);
      camera.lookAt(introLookTarget.x, introLookTarget.y, introLookTarget.z);
      onIntroComplete?.();
    }
  };
}

function useMemo<T>(fn: () => T, deps: any[]): T {
  return React.useMemo(fn, deps);
}
