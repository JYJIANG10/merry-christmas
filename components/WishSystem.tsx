
import React, { useMemo, useRef, useState } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG } from '../constants';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface WishSystemProps {
  text: string;
  onArrive: () => void;
}

const WishSystem: React.FC<WishSystemProps> = ({ onArrive }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const trailRef = useRef<THREE.Points>(null);
  
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const hasTriggeredArrival = useRef(false);

  // Cinematic Trajectory: Start from near the UI, arc high, hit the peak
  const startPos = new THREE.Vector3(0, -6, 12);
  const endPos = new THREE.Vector3(0, TREE_CONFIG.HEIGHT + 0.5, 0);
  const midPos = new THREE.Vector3(12, 10, 8); 
  
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(startPos, midPos, endPos), []);

  const starParticles = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c1 = new THREE.Color('#ff007f'); // Core Pink
    const c2 = new THREE.Color('#ffccdd'); // Bright Highlight
    const c3 = new THREE.Color('#ffffff'); // Pure White

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.5) * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = c1.clone().lerp(c2, Math.random()).lerp(c3, Math.pow(Math.random(), 2));
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { pos, colors };
  }, []);

  const trailData = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) pos[i] = -100;
    return { pos };
  }, []);

  useFrame((state, delta) => {
    if (isDone) return;

    const nextProgress = progress + delta * 0.5; // Flight speed
    if (nextProgress >= 1) {
      if (!hasTriggeredArrival.current) {
        hasTriggeredArrival.current = true;
        onArrive();
      }
      setIsDone(true);
    } else {
      // Cubic In-Out for snappy but elegant motion
      const eased = nextProgress < 0.5 
        ? 4 * nextProgress * nextProgress * nextProgress 
        : 1 - Math.pow(-2 * nextProgress + 2, 3) / 2;

      const p = curve.getPoint(eased);
      
      if (pointsRef.current) {
        pointsRef.current.position.copy(p);
        pointsRef.current.rotation.y += delta * 6;
        pointsRef.current.rotation.z += delta * 3;
      }

      if (trailRef.current) {
        const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
        // Shift trail history
        for (let i = trailData.pos.length / 3 - 1; i > 0; i--) {
          positions[i * 3] = positions[(i - 1) * 3];
          positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
          positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        }
        // Add jitter to tail
        positions[0] = p.x + (Math.random() - 0.5) * 0.15;
        positions[1] = p.y + (Math.random() - 0.5) * 0.15;
        positions[2] = p.z + (Math.random() - 0.5) * 0.15;
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      setProgress(nextProgress);
    }
  });

  if (isDone) return null;

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={starParticles.pos.length / 3} array={starParticles.pos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={starParticles.colors.length / 3} array={starParticles.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.35} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={trailData.pos.length / 3} array={trailData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#ffccdd" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
};

export default WishSystem;
