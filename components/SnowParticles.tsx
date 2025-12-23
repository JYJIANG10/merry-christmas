
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { SNOW_CONFIG } from '../constants';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const SnowParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { COUNT, BOUNDS } = SNOW_CONFIG;

  const particles = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * BOUNDS.x * 2;
      pos[i * 3 + 1] = (Math.random()) * BOUNDS.y * 2 - BOUNDS.y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z * 2;
      speeds[i] = Math.random() * 0.05 + 0.02;
    }
    return { pos, speeds };
  }, [COUNT, BOUNDS]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3 + 1] -= particles.speeds[i];
        if (positions[i * 3 + 1] < -BOUNDS.y) {
          positions[i * 3 + 1] = BOUNDS.y;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.pos.length / 3}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.7} // 降低背景干扰
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default SnowParticles;
