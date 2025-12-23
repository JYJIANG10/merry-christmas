
import React, { useMemo, useState, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface GiftBoxProps {
  id: number;
  position: [number, number, number];
  color: string;
  imageUrl: string;
  onGiftClick: (imageUrl: string) => void;
}

const GiftBox: React.FC<GiftBoxProps> = ({ position: targetPos, color, imageUrl, onGiftClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  const [phase, setPhase] = useState<'falling' | 'landed'>('falling');
  
  // Physics-like state
  const currentY = useRef(25); // Start high
  const velocityY = useRef(0);
  const rotationOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const boxScale = useMemo(() => 0.6 + Math.random() * 0.4, []);
  
  // Generate a slightly brighter version of the color for emissive glow
  const glowColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(1.5);
    return c;
  }, [color]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (phase === 'falling') {
        // Accelerate downwards
        velocityY.current -= delta * 15;
        currentY.current += velocityY.current * delta;

        // Hit the ground
        if (currentY.current <= targetPos[1]) {
          currentY.current = targetPos[1];
          // Small bounce logic
          if (Math.abs(velocityY.current) > 2) {
             velocityY.current *= -0.3; // Dampened bounce
          } else {
             setPhase('landed');
          }
        }
        
        meshRef.current.position.y = currentY.current;
        meshRef.current.rotation.y += delta * 2; // Spinning while falling
      } else {
        // Idle animation when landed
        const t = state.clock.elapsedTime;
        meshRef.current.position.y = targetPos[1] + Math.sin(t * 1.5 + rotationOffset) * 0.05;
        meshRef.current.rotation.y = rotationOffset + Math.sin(t * 0.5) * 0.1;
      }

      // Hover scaling
      const targetScale = boxScale * (hovered ? 1.25 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <group 
      ref={meshRef}
      position={[targetPos[0], currentY.current, targetPos[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => {
        e.stopPropagation();
        onGiftClick(imageUrl);
      }}
    >
      {/* Internal Light - Makes the box pop from within */}
      <pointLight 
        color={color} 
        intensity={hovered ? 8 : 4} 
        distance={3} 
        decay={2}
      />

      {/* Rim Light / Outer Glow Effect */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.4 : 0.2} 
          side={THREE.BackSide}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Main Box Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.4} 
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
        />
      </mesh>
      
      {/* High-Contrast Gold Ribbons */}
      <mesh scale={[1.05, 0.15, 1.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#ffd700" 
          metalness={1} 
          roughness={0} 
          emissive="#ffd700"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh scale={[0.15, 1.05, 1.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#ffd700" 
          metalness={1} 
          roughness={0} 
          emissive="#ffd700"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Ribbon Knot with Glow */}
      <group position={[0, 0.55, 0]}>
        <mesh rotation={[0, 0, Math.PI/4]}>
          <torusGeometry args={[0.18, 0.04, 16, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0} emissive="#ffd700" emissiveIntensity={1} />
        </mesh>
        <mesh rotation={[0, Math.PI/2, Math.PI/4]}>
          <torusGeometry args={[0.18, 0.04, 16, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0} emissive="#ffd700" emissiveIntensity={1} />
        </mesh>
      </group>
    </group>
  );
};

interface GiftsProps {
  onGiftClick: (imageUrl: string) => void;
  gifts: Array<{ id: number, position: [number, number, number], color: string, imageUrl: string }>;
}

const Gifts: React.FC<GiftsProps> = ({ onGiftClick, gifts }) => {
  return (
    <group>
      {gifts.map((gift) => (
        <GiftBox key={gift.id} {...gift} onGiftClick={onGiftClick} />
      ))}
    </group>
  );
};

export default Gifts;
