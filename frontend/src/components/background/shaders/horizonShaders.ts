export const horizonVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const horizonFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScrollProgress;

  varying vec2 vUv;

  // Color palette constants
  const vec3 COLOR_DEEP_SPACE   = vec3(0.0118, 0.0196, 0.0392); // #03050A
  const vec3 COLOR_MIDNIGHT     = vec3(0.0314, 0.0431, 0.0863); // #080B16
  const vec3 COLOR_ATMOS_BLUE   = vec3(0.2039, 0.2980, 0.5137); // #344C83
  const vec3 COLOR_ATMOS_VIOLET = vec3(0.3176, 0.2510, 0.4706); // #514078
  const vec3 COLOR_ATMOS_WHITE  = vec3(0.8627, 0.9059, 1.0000); // #DCE7FF

  void main() {
    // Aspect ratio correction for uniform curvature
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vUv;

    // Centered normalized coordinates
    vec2 pos = vec2((p.x - 0.5) * aspect, p.y);

    // Subtle interactive parallax
    vec2 mouseOffset = uMouse * 0.025;
    float scrollOffset = uScrollProgress * 0.12;

    // Planetary Horizon Geometry:
    // Rock-solid stable horizon arc (no mouse hovering up and down)
    // Planet center is fixed below screen so the curvature stays perfectly still
    float planetRadius = 2.82;
    vec2 planetCenter = vec2(0.0, -2.05);

    // Coordinate relative to planet center with slight vertical squish (elliptical perspective)
    vec2 rel = pos - planetCenter;
    rel.y *= 1.15; // subtle flattening creates realistic planetary limb perspective

    float dist = length(rel);
    float horizonDist = dist - planetRadius; // 0.0 is the exact atmospheric rim line

    // Atmospheric lighting layers
    // Layer 1: Razor-thin luminous white boundary
    float rimWidth = 0.0035;
    float rimIntensity = exp(-pow(horizonDist / rimWidth, 2.0));
    
    // Layer 2: Soft Rayleigh blue atmospheric scattering (concentrated above the rim)
    float blueHaze = 0.0;
    if (horizonDist > -0.01) {
      blueHaze = exp(-max(horizonDist, 0.0) * 38.0) * 0.95;
    }

    // Layer 3: Wide subtle violet diffusion (extended atmospheric glow)
    float violetHaze = 0.0;
    if (horizonDist > -0.02) {
      violetHaze = exp(-max(horizonDist, 0.0) * 12.0) * 0.55;
    }

    // Layer 4: Subtle ambient outer atmosphere
    float outerGlow = exp(-max(horizonDist, 0.0) * 4.2) * 0.18;

    // Dynamic Halo Light & Sunlight Illumination:
    // The physical curvature stays still, while the luminous halo light moves slightly
    // with cursor position and gentle cosmic breathing
    float lightDriftX = 0.5 + uMouse.x * 0.09 + sin(uTime * 0.22) * 0.04;
    float curveAngle = clamp(1.0 - abs(p.x - lightDriftX) * 1.25, 0.0, 1.0);
    curveAngle = pow(curveAngle, 0.88);

    // Subtle atmospheric halo light breathing and gentle illumination shift
    float haloShift = 0.96 + 0.06 * sin(uTime * 0.4 + p.x * 2.8) + (uMouse.y * 0.05);

    // Combine atmospheric illumination
    vec3 atmosColor = vec3(0.0);
    atmosColor += COLOR_ATMOS_WHITE * rimIntensity * 1.15;
    atmosColor += COLOR_ATMOS_BLUE * blueHaze * 0.90 * haloShift;
    atmosColor += COLOR_ATMOS_VIOLET * violetHaze * 0.70 * haloShift;
    atmosColor += mix(COLOR_ATMOS_BLUE, COLOR_ATMOS_VIOLET, 0.5) * outerGlow * 0.45 * haloShift;
    atmosColor *= curveAngle;

    // Planetary body (below the rim)
    // Deep midnight black with ultra-subtle planetary surface falloff
    vec3 surfaceColor = COLOR_DEEP_SPACE;
    float surfaceMask = smoothstep(0.0, -0.012, horizonDist);
    surfaceColor = mix(COLOR_MIDNIGHT, COLOR_DEEP_SPACE, smoothstep(-0.01, -0.25, horizonDist));

    // Combine planet body and glowing atmospheric scattering
    vec3 finalColor = vec3(0.0);
    float finalAlpha = 0.0;

    if (horizonDist < 0.0) {
      // On the planet body
      finalColor = mix(surfaceColor, atmosColor, rimIntensity * 0.5);
      finalAlpha = 0.98; // Solid planetary body occludes background stars
    } else {
      // In the atmosphere and space
      finalColor = atmosColor;
      finalAlpha = clamp(rimIntensity * 1.0 + blueHaze * 0.8 + violetHaze * 0.5 + outerGlow * 0.3, 0.0, 1.0);
    }

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
