
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

const HeartTop: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, 0, -0.8, 0.4, -0.8, 1.0);
    shape.bezierCurveTo(-0.8, 1.5, 0, 1.5, 0, 1.0);
    shape.bezierCurveTo(0, 1.7, 0.8, 1.7, 0.8, 1.0);
    shape.bezierCurveTo(0.8, 0.4, 0, 0, 0, 0);
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.35,
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 1,
    bevelSize: 0.15,
    bevelThickness: 0.15,
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 1.5;
    }
  });

  return (
    // 稍微调高位置，避免与树顶粒子重叠产生光斑
    <group position={[0, TREE_CONFIG.HEIGHT + 0.5, 0]}>
      <mesh ref={meshRef}>
        <extrudeGeometry args={[heartShape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#ffb3d9" 
          emissive="#ff007f" 
          emissiveIntensity={1.2} // 降低自发光强度
          metalness={0.9} 
          roughness={0.1}
          transparent
          opacity={1.0}
        />
      </mesh>
      {/* 彻底移除所有 pointLight，确保绝对没有向下的光晕 */}
    </group>
  );
};

export default HeartTop;
