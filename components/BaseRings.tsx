
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { BASE_RINGS_CONFIG, TREE_CONFIG } from '../constants';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const BaseRings: React.FC = () => {
  const ringsRef = useRef<THREE.Group>(null);
  const { RADIUS_MULT, WHITE_COLOR, GOLD_COLOR, PARTICLES_PER_RING } = BASE_RINGS_CONFIG;
  const baseRadius = TREE_CONFIG.BASE_RADIUS;

  const ringsData = useMemo(() => {
    return RADIUS_MULT.map((mult, ringIdx) => {
      const radius = baseRadius * mult;
      const pos = new Float32Array(PARTICLES_PER_RING * 3);
      const colors = new Float32Array(PARTICLES_PER_RING * 3);

      for (let i = 0; i < PARTICLES_PER_RING; i++) {
        const angle = (i / PARTICLES_PER_RING) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.8; // Slightly more jitter for organic feel
        const x = Math.cos(angle) * (radius + jitter);
        const z = Math.sin(angle) * (radius + jitter);
        
        // Elevate the rings slightly so they "float" off the ground (y=0)
        // Adding a per-particle vertical variance
        const y = 0.4 + (Math.random() - 0.5) * 0.3; 

        pos[i * 3 + 0] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;

        const mixColor = new THREE.Color().copy(WHITE_COLOR).lerp(GOLD_COLOR, Math.random() * 0.8);
        colors[i * 3 + 0] = mixColor.r;
        colors[i * 3 + 1] = mixColor.g;
        colors[i * 3 + 2] = mixColor.b;
      }

      return { pos, colors, speed: (ringIdx + 1) * 0.12 };
    });
  }, [RADIUS_MULT, WHITE_COLOR, GOLD_COLOR, PARTICLES_PER_RING, baseRadius]);

  useFrame((state) => {
    if (ringsRef.current) {
      const t = state.clock.elapsedTime;
      ringsRef.current.children.forEach((child, i) => {
        // Horizontal rotation
        child.rotation.y += ringsData[i].speed * 0.005;
        // Subtle vertical bobbing for the entire ring group
        child.position.y = Math.sin(t * 0.5 + i) * 0.15;
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {ringsData.map((data, idx) => (
        <points key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={data.pos.length / 3}
              array={data.pos}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={data.colors.length / 3}
              array={data.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.08}
            color="#ffffff"
            transparent
            opacity={0.6}
            sizeAttenuation={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
};

export default BaseRings;
