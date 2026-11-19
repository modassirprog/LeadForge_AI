"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { starVertexShader, starFragmentShader } from "./shaders/starShaders";
import { horizonVertexShader, horizonFragmentShader } from "./shaders/horizonShaders";

export function SpaceBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Detection
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // 2. Scene, Camera, Renderer Setup
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: true,
      stencil: false,
      depth: true,
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x03050a, 1.0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    container.appendChild(renderer.domElement);

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 3. Procedural Starfield (1,500 - 2,500 natural stars)
    const isMobile = width < 768;
    const starCount = isMobile ? 1200 : 2200;

    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);
    const starTwinkleSpeeds = new Float32Array(starCount);
    const starTwinklePhases = new Float32Array(starCount);
    const starAlphas = new Float32Array(starCount);

    // Natural space color palette for stars
    const colorWhite = new THREE.Color(0xdce7ff); // Atmospheric white
    const colorCoolBlue = new THREE.Color(0xa5b8ff); // Cool distant blue
    const colorVioletSoft = new THREE.Color(0xbba6e8); // Subtle violet tint

    for (let i = 0; i < starCount; i++) {
      // Natural 3D distribution across deep background
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 380;
      starPositions[i3 + 1] = (Math.random() - 0.45) * 260; // Slightly more stars in upper view
      starPositions[i3 + 2] = -40 - Math.random() * 320;

      // Sizes: mostly tiny, barely visible stars, a few brighter anchors
      const sizeSeed = Math.random();
      if (sizeSeed > 0.94) {
        starSizes[i] = 2.8 + Math.random() * 1.6;
        starAlphas[i] = 0.75 + Math.random() * 0.25;
      } else if (sizeSeed > 0.65) {
        starSizes[i] = 1.6 + Math.random() * 1.0;
        starAlphas[i] = 0.45 + Math.random() * 0.3;
      } else {
        starSizes[i] = 0.9 + Math.random() * 0.7;
        starAlphas[i] = 0.2 + Math.random() * 0.3;
      }

      // Star color variation
      const colSeed = Math.random();
      const col = colSeed > 0.8 ? colorVioletSoft : colSeed > 0.45 ? colorCoolBlue : colorWhite;
      starColors[i3] = col.r;
      starColors[i3 + 1] = col.g;
      starColors[i3 + 2] = col.b;

      // Twinkling rates
      starTwinkleSpeeds[i] = prefersReducedMotion ? 0.0 : 0.8 + Math.random() * 2.2;
      starTwinklePhases[i] = Math.random() * Math.PI * 2;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute("aColor", new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute("aTwinkleSpeed", new THREE.BufferAttribute(starTwinkleSpeeds, 1));
    starGeometry.setAttribute("aTwinklePhase", new THREE.BufferAttribute(starTwinklePhases, 1));
    starGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(starAlphas, 1));

    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: dpr },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    starField.renderOrder = 0;
    scene.add(starField);

    // 4. Procedural 2.5D Planetary Horizon Mesh
    // Positioned in front of the stars at z = 2.0 to span camera view
    const horizonDistance = 4.0;
    const planeZ = camera.position.z - horizonDistance;

    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(fovRad / 2) * horizonDistance;
    const visibleWidth = visibleHeight * camera.aspect;

    const horizonGeometry = new THREE.PlaneGeometry(visibleWidth, visibleHeight);
    const horizonMaterial = new THREE.ShaderMaterial({
      vertexShader: horizonVertexShader,
      fragmentShader: horizonFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScrollProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const horizonMesh = new THREE.Mesh(horizonGeometry, horizonMaterial);
    horizonMesh.renderOrder = 1;
    horizonMesh.position.set(0, 0, planeZ);
    scene.add(horizonMesh);

    // 5. Interaction & Parallax State
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = nx;
      targetMouseY = ny;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(window.innerHeight, 1);
      targetScrollProgress = Math.min(scrollY / maxScroll, 1.5);
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Re-scale horizon plane to fit camera view perfectly
      const newHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * horizonDistance;
      const newWidth = newHeight * camera.aspect;
      horizonMesh.scale.set(newWidth / visibleWidth, newHeight / visibleHeight, 1);

      horizonMaterial.uniforms.uResolution.value.set(width, height);
      starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial sync
    handleScroll();
    handleResize();

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth damping (lerp) for cursor and scroll parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

      // Update uniforms
      starMaterial.uniforms.uTime.value = elapsedTime;
      starMaterial.uniforms.uMouse.value.set(mouseX, mouseY);

      horizonMaterial.uniforms.uTime.value = elapsedTime;
      horizonMaterial.uniforms.uMouse.value.set(mouseX, mouseY);
      horizonMaterial.uniforms.uScrollProgress.value = scrollProgress;

      // Subtle slow starfield cosmic drift
      if (!prefersReducedMotion) {
        starField.rotation.y = elapsedTime * 0.003;
        starField.rotation.x = Math.sin(elapsedTime * 0.002) * 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      starGeometry.dispose();
      starMaterial.dispose();
      horizonGeometry.dispose();
      horizonMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        backgroundColor: "#03050a",
      }}
    >
      {/* Graceful CSS fallback if WebGL is unavailable on device */}
      {!webglSupported && (
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 120% 70% at 50% 100%, #172448 0%, #080b16 55%, #03050a 100%)",
          }}
        />
      )}
    </div>
  );
}
