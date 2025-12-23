
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG } from '../constants';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const VERTEX_SHADER = `
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uPulse;

  void main() {
    vColor = color;
    vec3 pos = position;
    
    // Smooth cone breathing
    float breathe = sin(pos.y * 0.5) * 0.05;
    pos.x += pos.x * breathe;
    pos.z += pos.z * breathe;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Reduced particle size scaling from pulse for a gentler sparkle
    float size = 0.15 * (1.0 + uPulse * 1.2);
    gl_PointSize = size * (1000.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  uniform float uPulse;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.2, dist);
    // Reduced brightness multiplier for the pulse effect to feel more elegant
    vec3 finalColor = vColor * (1.0 + uPulse * 2.5);
    gl_FragColor = vec4(finalColor, alpha * 0.65);
  }
`;

const PinkTreeParticles: React.FC<{ unleashFactor: number, pulseIntensity: number }> = ({ unleashFactor, pulseIntensity }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const particles = useMemo(() => {
    const { PARTICLE_COUNT, HEIGHT, BASE_RADIUS, CENTER_COLOR, OUTER_COLOR, EDGE_COLOR } = TREE_CONFIG;
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const h = Math.random() * HEIGHT;
      const radiusAtH = (1 - (h / HEIGHT)) * BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.7) * radiusAtH;
      
      pos[i * 3 + 0] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(angle) * dist;

      const radialFactor = (dist / radiusAtH) || 0;
      const color = new THREE.Color().copy(CENTER_COLOR);
      
      if (radialFactor > 0.4) {
        color.lerp(OUTER_COLOR, (radialFactor - 0.4) * 1.5);
      }
      if (radialFactor > 0.8) {
        color.lerp(EDGE_COLOR, (radialFactor - 0.8) * 4.0);
      }
      
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { pos, colors };
  }, []);

  const uniforms = useMemo(() => ({
    uPulse: { value: 0 }
  }), []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uPulse.value = pulseIntensity;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.pos.length / 3}
          array={particles.pos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default PinkTreeParticles;
