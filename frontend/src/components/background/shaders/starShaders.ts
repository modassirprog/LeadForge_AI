export const starVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aTwinkleSpeed;
  attribute float aTwinklePhase;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Gentle twinkle calculation
    float twinkle = 0.65 + 0.35 * sin(uTime * aTwinkleSpeed + aTwinklePhase);
    vAlpha = aAlpha * twinkle;

    // Fluid 3D star movement with depth-based parallax and gentle cosmic drift
    vec3 transformed = position;
    float depthFactor = clamp((-position.z * 0.02 + 1.5), 1.0, 8.0);
    transformed.x += uMouse.x * depthFactor * 1.4;
    transformed.y += uMouse.y * depthFactor * 1.4;
    
    // Very gentle organic floating motion
    transformed.x += sin(uTime * 0.2 + position.y * 0.03) * 0.9;
    transformed.y += cos(uTime * 0.18 + position.x * 0.03) * 0.7;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation based on distance and device pixel ratio
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
  }
`;

export const starFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Distance from center of point
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    // Soft Gaussian-like circular falloff
    float intensity = exp(-dist * dist * 14.0);
    float core = smoothstep(0.5, 0.0, dist);

    float alpha = vAlpha * (intensity * 0.75 + core * 0.25);

    gl_FragColor = vec4(vColor, alpha);
  }
`;
