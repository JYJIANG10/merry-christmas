
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

const STAR_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const STAR_FRAGMENT_SHADER = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  
  void main() {
    // Gradient from center to points
    float dist = length(vPosition.xy);
    float factor = clamp(dist / 1.2, 0.0, 1.0);
    
    // Warm Pink Gold energy palette
    vec3 pinkGold = vec3(1.0, 0.3, 0.55); // Rich Pink
    vec3 brightGold = vec3(1.0, 0.85, 0.4); // Warm Gold
    
    vec3 color = mix(brightGold, pinkGold, factor);
    
    // Energy pulsing and shimmering
    float pulse = 1.0 + sin(uTime * 4.0) * 0.15;
    float shimmer = 0.8 + 0.4 * sin(vPosition.x * 12.0 + uTime * 6.0);
    
    gl_FragColor = vec4(color * pulse * shimmer * 2.5, 1.0);
  }
`;

const StarTop: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Points>(null);

  // 5-pointed star shape geometry
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.35,
    bevelEnabled: true,
    bevelSegments: 10,
    steps: 1,
    bevelSize: 0.15,
    bevelThickness: 0.15,
  };

  // Volumetric particle aura for the star
  const auraData = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c1 = new THREE.Color('#ff007f'); // Rich Pink
    const c2 = new THREE.Color('#ffd700'); // Gold

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.5) * 1.8;
      pos[i * 3 + 0] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      const color = new THREE.Color().copy(c1).lerp(c2, Math.random());
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { pos, colors };
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      // Rotation as requested
      meshRef.current.rotation.y = t * 1.2;
      meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    }
    if (auraRef.current) {
      auraRef.current.rotation.y = -t * 0.6;
    }
  });

  return (
    <group position={[0, TREE_CONFIG.HEIGHT + 0.8, 0]}>
      {/* 3D Star Core */}
      <mesh ref={meshRef}>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <shaderMaterial 
          vertexShader={STAR_VERTEX_SHADER}
          fragmentShader={STAR_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Volumetric Aura Particles */}
      <points ref={auraRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={auraData.pos.length / 3}
            array={auraData.pos}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={auraData.colors.length / 3}
            array={auraData.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.07} 
          vertexColors 
          transparent 
          opacity={0.6} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Star Lights */}
      <pointLight color="#ffd700" intensity={15} distance={12} />
      <pointLight color="#ff007f" intensity={8} distance={8} />
    </group>
  );
};

export default StarTop;
