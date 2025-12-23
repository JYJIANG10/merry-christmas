
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface OrnamentProps {
  position: [number, number, number];
  text: string;
  color?: string;
  onClick: (text: string) => void;
}

const Ornament: React.FC<OrnamentProps> = ({ position, text, color = "#ffcce6", onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  const [materializeProgress, setMaterializeProgress] = useState(0);

  // Derive an emissive color that matches the primary color but with glow properties
  const emissiveColor = useMemo(() => {
    const c = new THREE.Color(color);
    return c.multiplyScalar(1.2);
  }, [color]);

  // Create Star Shape for Extrusion
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.4;
    const innerRadius = 0.18;
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
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  };

  useFrame((state, delta) => {
    if (materializeProgress < 1.0) {
      setMaterializeProgress(prev => Math.min(1.0, prev + delta * 1.5));
    }

    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      // Gentle idle sway and rotation
      meshRef.current.rotation.y = Math.sin(t * 0.5 + position[0]) * 0.2;
      meshRef.current.rotation.z = Math.cos(t * 0.8 + position[2]) * 0.1;
      
      // Floating offset
      meshRef.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.03;
      
      // Target scale with materialization and hover response
      const targetScale = materializeProgress * (hovered ? 1.3 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group 
      ref={meshRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(text); }}
    >
      {/* Decorative Gold Hook */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4]} />
        <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
      </mesh>

      {/* Star Ornament Body */}
      <mesh rotation={[0, 0, 0]}>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissiveColor} 
          emissiveIntensity={hovered ? 2.5 : 0.6}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={Math.min(1.0, materializeProgress)}
        />
      </mesh>

      {/* Inner Glow Core */}
      <mesh scale={0.4}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={hovered ? 0.8 : 0.4} />
      </mesh>

      {/* Interaction Light */}
      <pointLight 
        color={color} 
        intensity={hovered ? 4.0 : 0.5} 
        distance={2} 
        decay={2}
      />
    </group>
  );
};

export default Ornament;
