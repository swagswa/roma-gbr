
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera, RoundedBox, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const IPhone17Pro = () => {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture('/logo.jpg');
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Smooth orbit and tilt
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t * 0.4) * 0.2, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.cos(t * 0.3) * 0.1, 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef} scale={0.95}>
        {/* Titanium Frame */}
        <RoundedBox args={[3.2, 6.4, 0.35]} radius={0.4} smoothness={10}>
          <meshPhysicalMaterial 
            color="#2a2a2a" 
            roughness={0.1} 
            metalness={1} 
            reflectivity={1}
            clearcoat={1}
          />
        </RoundedBox>
        
        {/* Front Screen */}
        <RoundedBox args={[3.05, 6.25, 0.36]} radius={0.35} smoothness={10} position={[0, 0, 0.02]}>
          <meshPhysicalMaterial 
            color="#000000" 
            roughness={0.02} 
            metalness={0.8}
            emissive="#000811"
            emissiveIntensity={0.5}
          />
        </RoundedBox>

        {/* Logo on Screen - Maximum visibility settings */}
        <mesh position={[0, 0, 0.25]} renderOrder={100}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshStandardMaterial 
            map={texture} 
            transparent={false}
            roughness={0}
            metalness={0}
            emissive="#ffffff"
            emissiveIntensity={0.5}
            toneMapped={false} 
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dynamic Island */}
        <RoundedBox args={[0.6, 0.12, 0.01]} radius={0.06} position={[0, 2.8, 0.2]}>
          <meshBasicMaterial color="#000" />
        </RoundedBox>

        {/* Back Quad-Camera System */}
        <group position={[0, 0, -0.2]}>
           <RoundedBox args={[1.7, 1.7, 0.1]} radius={0.3} position={[0.6, 2.1, 0.05]}>
             <meshPhysicalMaterial color="#111" roughness={0.3} metalness={0.9} />
           </RoundedBox>
           
           {[
             [0.25, 0.45, 0], [0.25, -0.45, 0], [-0.25, 0, 0], [0.25, 0, 0.4]
           ].map((pos, i) => (
             <mesh key={i} position={[0.6 + pos[0], 2.1 + pos[1], 0.1]}>
               <cylinderGeometry args={[0.22, 0.22, 0.1, 32]} />
               <meshPhysicalMaterial 
                 color="#050505" 
                 metalness={1} 
                 roughness={0} 
                 transmission={0.4} 
                 thickness={1}
               />
             </mesh>
           ))}
        </group>

        {/* Internal Energy Core */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <MeshDistortMaterial 
            color="#3b82f6" 
            speed={2.5} 
            distort={0.5} 
            radius={1}
            opacity={0.15}
            transparent
          />
        </mesh>
      </group>
    </Float>
  );
};

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={30} />
          
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.8} />
          <spotLight position={[15, 20, 15]} angle={0.3} penumbra={1} intensity={3} color="#ffffff" castShadow />
          <pointLight position={[-10, -5, 10]} intensity={4} color="#3b82f6" />
          <pointLight position={[10, 5, 10]} intensity={3} color="#8b5cf6" />
          <directionalLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
          
          <IPhone17Pro />
          
          <ContactShadows 
            position={[0, -4.5, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2.5} 
            far={4.5} 
          />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};
