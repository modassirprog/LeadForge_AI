"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ForceFieldBackgroundProps {
  imageUrl?: string;
  hue?: number;
  saturation?: number;
  threshold?: number;
  minStroke?: number;
  maxStroke?: number;
  spacing?: number;
  noiseScale?: number;
  density?: number;
  invertImage?: boolean;
  invertWireframe?: boolean;
  magnifierEnabled?: boolean;
  magnifierRadius?: number;
  forceStrength?: number;
  friction?: number;
  restoreSpeed?: number;
  className?: string;
}

export function ForceFieldBackground({
  imageUrl,
  hue = 32, // Warm amber / golden orange default
  saturation = 100,
  threshold = 255,
  minStroke = 2,
  maxStroke = 5.5,
  spacing = 11,
  noiseScale = 0,
  density = 2.0,
  invertImage = true,
  invertWireframe = true,
  magnifierEnabled = true,
  magnifierRadius = 170,
  forceStrength = 14,
  friction = 0.9,
  restoreSpeed = 0.05,
  className = "",
}: ForceFieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const propsRef = useRef({
    hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, 
    density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
    forceStrength, friction, restoreSpeed
  });

  useEffect(() => {
    propsRef.current = {
      hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
      density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
      forceStrength, friction, restoreSpeed
    };
  }, [hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius, forceStrength, friction, restoreSpeed]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;
    let windowMoveListener: ((e: MouseEvent) => void) | null = null;

    async function initSketch() {
      try {
        const p5Module = (await import("p5")).default;

        if (!isMounted || !containerRef.current) return;

        if (p5InstanceRef.current) {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        }

        const sketch = (p: any) => {
          let img: any = null;
          let palette: any[] = [];
          let points: {
            pos: any;
            originalPos: any;
            vel: any;
          }[] = [];
          
          let lastHue = -1;
          let lastSaturation = -1;
          let lastSpacing = -1;
          let lastNoiseScale = -1;
          let lastDensity = -1;
          let magnifierX = -1000;
          let magnifierY = -1000;
          let targetX = -1000;
          let targetY = -1000;
          let magnifierInertia = 0.15;

          // Generate topographical landscape brightness map internally (Zero CORS, 100% reliable)
          function createHeightMap(w: number, h: number) {
            const g = p.createGraphics(Math.max(w, 200), Math.max(h, 200));
            g.pixelDensity(1);
            g.loadPixels();
            for (let y = 0; y < g.height; y++) {
              for (let x = 0; x < g.width; x++) {
                const nx = x * 0.005;
                const ny = y * 0.005;
                // Layered octave noise producing mountainous topography
                const n1 = p.noise(nx, ny);
                const n2 = p.noise(nx * 2.2 + 100, ny * 2.2 + 100) * 0.5;
                const val = (n1 * 0.7 + n2 * 0.3) * 255;
                const idx = (x + y * g.width) * 4;
                g.pixels[idx] = val;
                g.pixels[idx + 1] = val;
                g.pixels[idx + 2] = val;
                g.pixels[idx + 3] = 255;
              }
            }
            g.updatePixels();
            return g;
          }

          p.setup = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth || window.innerWidth;
            const h = containerRef.current.clientHeight || window.innerHeight;

            const canvasObj = p.createCanvas(w, h);
            if (canvasObj && canvasObj.elt) {
              canvasObj.elt.style.position = "absolute";
              canvasObj.elt.style.top = "0";
              canvasObj.elt.style.left = "0";
              canvasObj.elt.style.width = "100%";
              canvasObj.elt.style.height = "100%";
              canvasObj.elt.style.pointerEvents = "none";
            }
            
            magnifierX = w / 2;
            magnifierY = h / 2;
            targetX = w / 2;
            targetY = h / 2;

            img = createHeightMap(w, h);
            generatePalette(propsRef.current.hue, propsRef.current.saturation);
            generatePoints();
            setIsReady(true);

            // Window-wide cursor tracking so particles react everywhere on the hero
            windowMoveListener = (e: MouseEvent) => {
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              targetX = e.clientX - rect.left;
              targetY = e.clientY - rect.top;
            };
            window.addEventListener("mousemove", windowMoveListener, { passive: true });
          };

          p.windowResized = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            if (w > 0 && h > 0) {
              p.resizeCanvas(w, h);
              img = createHeightMap(w, h);
              generatePoints();
            }
          };

          function generatePalette(h: number, s: number) {
            palette = [];
            p.push();
            p.colorMode(p.HSL);
            for (let i = 0; i < 14; i++) {
              let lightness = p.map(i, 0, 13, 90, 15);
              palette.push(p.color(h, s, lightness));
            }
            p.pop();
          }

          function generatePoints() {
            if (!img) return;
            points = [];
            const { spacing, density, noiseScale } = propsRef.current;
            const safeSpacing = Math.max(4, spacing); 

            for (let y = 0; y < p.height; y += safeSpacing) {
              for (let x = 0; x < p.width; x += safeSpacing) {
                if (p.random() > density) continue;
                
                let nx = p.noise(x * noiseScale, y * noiseScale) - 0.5;
                let ny = p.noise((x + 500) * noiseScale, (y + 500) * noiseScale) - 0.5;
                let px = x + nx * safeSpacing;
                let py = y + ny * safeSpacing;
                
                points.push({
                  pos: p.createVector(px, py),
                  originalPos: p.createVector(px, py),
                  vel: p.createVector(0, 0)
                });
              }
            }
            
            lastSpacing = spacing;
            lastNoiseScale = noiseScale;
            lastDensity = density;
          }

          function applyForceField(mx: number, my: number) {
            const props = propsRef.current;
            if (!props.magnifierEnabled) return;

            const mouseVec = p.createVector(mx, my);

            for (let pt of points) {
              let dir = p5Module.Vector.sub(pt.pos, mouseVec);
              let d = dir.mag();
              
              if (d < props.magnifierRadius) {
                dir.normalize();
                let force = dir.mult((props.forceStrength * 1.6) / Math.max(1, d));
                pt.vel.add(force);
              }
              
              pt.vel.mult(props.friction);
              
              let restore = p5Module.Vector.sub(pt.pos, pt.originalPos).mult(-props.restoreSpeed);
              pt.vel.add(restore);
              
              pt.pos.add(pt.vel);
            }
          }

          p.draw = () => {
            if (!img) return;
            p.clear();

            const props = propsRef.current;

            if (props.hue !== lastHue || props.saturation !== lastSaturation) {
              generatePalette(props.hue, props.saturation);
              lastHue = props.hue;
              lastSaturation = props.saturation;
            }

            if (props.spacing !== lastSpacing || props.noiseScale !== lastNoiseScale || props.density !== lastDensity) {
              generatePoints();
            }

            // Smooth cursor interpolation
            magnifierX = p.lerp(magnifierX, targetX, magnifierInertia);
            magnifierY = p.lerp(magnifierY, targetY, magnifierInertia);

            applyForceField(magnifierX, magnifierY);

            img.loadPixels();
            p.noFill();

            for (let pt of points) {
              let x = pt.pos.x;
              let y = pt.pos.y;
              let d = p.dist(x, y, magnifierX, magnifierY);
              
              let px = p.constrain(p.floor(x), 0, img.width - 1);
              let py = p.constrain(p.floor(y), 0, img.height - 1);
              
              let index = (px + py * img.width) * 4;
              let brightness = img.pixels[index]; 
              
              if (brightness === undefined) continue;

              let shadeIndex = Math.floor(p.map(brightness, 0, 255, 0, palette.length - 1));
              shadeIndex = p.constrain(shadeIndex, 0, palette.length - 1);
              
              let strokeSize = p.map(brightness, 0, 255, props.minStroke, props.maxStroke);
              
              if (props.magnifierEnabled && d < props.magnifierRadius) {
                let factor = p.map(d, 0, props.magnifierRadius, 2.2, 1);
                strokeSize *= factor;
              }
              
              if (palette[shadeIndex]) {
                p.stroke(palette[shadeIndex]);
                p.strokeWeight(strokeSize);
                p.point(x, y);
              }
            }
          };
        };

        const myP5 = new p5Module(sketch, containerRef.current);
        p5InstanceRef.current = myP5;
      } catch (err: any) {
        console.error("Error initializing ForceFieldBackground:", err);
      }
    }

    initSketch();

    return () => {
      isMounted = false;
      if (windowMoveListener) {
        window.removeEventListener("mousemove", windowMoveListener);
      }
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`} 
      ref={containerRef}
    />
  );
}

export default ForceFieldBackground;
