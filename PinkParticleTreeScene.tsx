
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import PinkTreeParticles from './components/PinkTreeParticles';
import SnowParticles from './components/SnowParticles';
import BaseRings from './components/BaseRings';
import HeartTop from './components/HeartTop';
import Gifts from './components/Gifts';
import WishSystem from './components/WishSystem';
import Ornament from './components/Ornament';
import { POST_PROCESSING, TREE_CONFIG, DEFAULT_GIFT_IMAGES, DEFAULT_WISHES } from './constants';

// Fix for R3F JSX intrinsic elements types
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  onGiftClick: (imageUrl: string) => void;
  cameraEnabled: boolean;
  newWish: { id: number, text: string } | null;
  newGift: { id: number, imageUrl: string } | null;
  onWishComplete: () => void;
  onGiftComplete: () => void;
  onOrnamentClick: (text: string) => void;
}

const GIFT_COLORS = [
  '#ff0055', // Neon Pink
  '#00ffcc', // Vivid Teal
  '#ffcc00', // Bright Gold
  '#ffffff', // Clean White
  '#7d00ff', // Deep Purple
  '#ff5500', // Neon Orange
  '#0099ff'  // Electric Blue
];

const ORNAMENT_COLORS = [
  '#ffd700', // Classic Gold
  '#ff007f', // Deep Pink
  '#e5b09e', // Rose Gold
  '#fff4e0', // Warm White
  '#ffcce6', // Soft Pink
  '#ffffff', // Pure Silver
];

const InteractionController: React.FC<{ 
  cameraEnabled: boolean, 
  newWish: { id: number, text: string } | null,
  newGift: { id: number, imageUrl: string } | null,
  onWishComplete: () => void,
  onGiftComplete: () => void,
  onOrnamentClick: (text: string) => void,
  onGiftClick: (imageUrl: string) => void
}> = ({ cameraEnabled, newWish, newGift, onWishComplete, onGiftComplete, onOrnamentClick, onGiftClick }) => {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(1.0);
  const rotationTarget = useRef({ x: 0, y: 0 });
  
  const [gesture, setGesture] = useState({ isOpen: false });
  const [wishes, setWishes] = useState<any[]>([]);
  const [treePulse, setTreePulse] = useState(0);

  // Initialize with 5 default ornaments (stars) already on the tree
  const [placedOrnaments, setPlacedOrnaments] = useState<any[]>(() => {
    return DEFAULT_WISHES.map((wish, i) => {
      const h = Math.random() * (TREE_CONFIG.HEIGHT * 0.7) + 1.5;
      const radiusAtH = (1 - (h / TREE_CONFIG.HEIGHT)) * TREE_CONFIG.BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: `default-wish-${i}`,
        text: wish.text,
        position: [
          Math.cos(angle) * (radiusAtH + 0.15),
          h,
          Math.sin(angle) * (radiusAtH + 0.15)
        ],
        color: ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]
      };
    });
  });

  // Initialize with 5 default gift boxes
  const [placedGifts, setPlacedGifts] = useState<any[]>(() => {
    return DEFAULT_GIFT_IMAGES.map((url, i) => {
      const angle = (i * 1.25); 
      const radiusMin = TREE_CONFIG.BASE_RADIUS * 1.4;
      const radiusMax = TREE_CONFIG.BASE_RADIUS * 2.0;
      const dist = radiusMin + (Math.random() * (radiusMax - radiusMin));
      
      return {
        id: -(i + 1),
        imageUrl: url,
        color: GIFT_COLORS[i % GIFT_COLORS.length],
        position: [
          Math.cos(angle) * dist,
          0.5,
          Math.sin(angle) * dist
        ]
      };
    });
  });

  // Handle New Wishes
  useEffect(() => {
    if (newWish) {
      setWishes(prev => [...prev, newWish]);
      onWishComplete();
    }
  }, [newWish, onWishComplete]);

  // Handle New Gifts
  useEffect(() => {
    if (newGift) {
      const radiusMin = TREE_CONFIG.BASE_RADIUS * 1.3;
      const radiusMax = TREE_CONFIG.BASE_RADIUS * 2.3;
      const count = placedGifts.length;
      const angle = (count * 1.6) + (Math.random() * 0.4);
      const dist = radiusMin + (Math.random() * (radiusMax - radiusMin));
      
      const position: [number, number, number] = [
        Math.cos(angle) * dist,
        0.5,
        Math.sin(angle) * dist
      ];

      setPlacedGifts(prev => [...prev, {
        id: newGift.id,
        imageUrl: newGift.imageUrl,
        color: GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)],
        position
      }]);
      
      onGiftComplete();
    }
  }, [newGift, onGiftComplete, placedGifts.length]);

  const handleWishArrive = (id: number, text: string) => {
    setWishes(prev => prev.filter(w => w.id !== id));
    setTreePulse(0.8);

    setTimeout(() => {
      const h = Math.random() * (TREE_CONFIG.HEIGHT * 0.7) + 1.5;
      const radiusAtH = (1 - (h / TREE_CONFIG.HEIGHT)) * TREE_CONFIG.BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const pos: [number, number, number] = [
        Math.cos(angle) * (radiusAtH + 0.15),
        h,
        Math.sin(angle) * (radiusAtH + 0.15)
      ];
      const selectedColor = ORNAMENT_COLORS[Math.floor(Math.random() * ORNAMENT_COLORS.length)];
      setPlacedOrnaments(prev => [...prev, { id, text, position: pos, color: selectedColor }]);
    }, 1000);
  };

  useEffect(() => {
    if (!cameraEnabled) return;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        const video = document.createElement('video');
        video.style.display = 'none';
        videoRef.current = video;
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
      } catch (err) { console.error("MediaPipe Error:", err); }
    };
    initMediaPipe();
    return () => {
      if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
  }, [cameraEnabled]);

  useFrame((state, delta) => {
    if (cameraEnabled && landmarkerRef.current && videoRef.current?.readyState >= 2) {
      const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      if (results.landmarks?.length > 0) {
        const landmarks = results.landmarks[0];
        const dist = Math.sqrt(Math.pow(landmarks[4].x - landmarks[20].x, 2) + Math.pow(landmarks[4].y - landmarks[20].y, 2));
        setGesture({ isOpen: dist > 0.4 });
        rotationTarget.current.y = (landmarks[9].x - 0.5) * 2.2;
        rotationTarget.current.x = (landmarks[9].y - 0.5) * 1.0;
      }
    }
    const targetScale = gesture.isOpen ? 2.5 : 1.0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.1;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      if (cameraEnabled) {
        groupRef.current.rotation.y += (rotationTarget.current.y - groupRef.current.rotation.y) * 0.05;
        groupRef.current.rotation.x += (rotationTarget.current.x - groupRef.current.rotation.x) * 0.05;
      }
    }
    if (treePulse > 0) setTreePulse(prev => Math.max(0, prev - delta * 0.7));
  });

  return (
    <group ref={groupRef} position={[0, -6, 0]}>
      <PinkTreeParticles unleashFactor={gesture.isOpen ? 1 : 0} pulseIntensity={treePulse} />
      <BaseRings />
      <HeartTop />
      <Gifts onGiftClick={onGiftClick} gifts={placedGifts} />
      {wishes.map((w) => <WishSystem key={w.id} text={w.text} onArrive={() => handleWishArrive(w.id, w.text)} />)}
      {placedOrnaments.map((o) => <Ornament key={o.id} position={o.position} text={o.text} color={o.color} onClick={onOrnamentClick} />)}
    </group>
  );
};

const PinkParticleTreeScene: React.FC<SceneProps> = ({ onGiftClick, cameraEnabled, newWish, newGift, onWishComplete, onGiftComplete, onOrnamentClick }) => {
  return (
    <div className="w-full h-full relative z-10">
      <Canvas shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true, stencil: false }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 6, 25]} fov={40} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 6} autoRotate={!cameraEnabled} autoRotateSpeed={0.3} enableDamping minDistance={12} maxDistance={55} />
          <ambientLight intensity={0.4} />
          <InteractionController 
            cameraEnabled={cameraEnabled} 
            newWish={newWish} 
            newGift={newGift}
            onWishComplete={onWishComplete}
            onGiftComplete={onGiftComplete}
            onOrnamentClick={onOrnamentClick}
            onGiftClick={onGiftClick}
          />
          <SnowParticles />
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={POST_PROCESSING.BLOOM_INTENSITY} luminanceThreshold={POST_PROCESSING.BLOOM_LUMINANCE_THRESHOLD} luminanceSmoothing={POST_PROCESSING.BLOOM_LUMINANCE_SMOOTHING} mipmapBlur />
            <Noise opacity={0.015} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PinkParticleTreeScene;
