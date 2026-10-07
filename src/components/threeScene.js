import * as THREE from 'three';

/**
 * ==============================================================================
 * THREE.JS BACKGROUND SCENE
 * Luxury Japanese-Inspired Abstract Architecture, Floating Particles & Tokyo Night Grid
 * ==============================================================================
 */

export function initThreeScene(canvasElement) {
  if (!canvasElement) return null;

  // Scene & Camera
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06070a, 0.028);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 8.5);

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x0d1527, 2.0);
  scene.add(ambientLight);

  const cyanKeyLight = new THREE.DirectionalLight(0x00d2ff, 1.8);
  cyanKeyLight.position.set(5, 8, 4);
  scene.add(cyanKeyLight);

  const crimsonPointLight = new THREE.PointLight(0xe63946, 3.5, 18);
  crimsonPointLight.position.set(0, -0.5, 2);
  scene.add(crimsonPointLight);

  // Group for all architectural objects (for collective mouse parallax)
  const architecturalGroup = new THREE.Group();
  scene.add(architecturalGroup);

  // ----------------------------------------------------------------------------
  // 1. ABSTRACT JAPANESE ARCHITECTURAL STRUCTURE (Torii / Pavilion Geometry)
  // ----------------------------------------------------------------------------
  const darkLacquerMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    metalness: 0.85,
    roughness: 0.25
  });

  const crimsonGlowMat = new THREE.MeshBasicMaterial({
    color: 0xe63946
  });

  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x223558,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  // Torii Pillars (Left & Right)
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.16, 5.5, 16);
  
  const leftPillar = new THREE.Mesh(pillarGeo, darkLacquerMat);
  leftPillar.position.set(-2.8, 0, -1);
  architecturalGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, darkLacquerMat);
  rightPillar.position.set(2.8, 0, -1);
  architecturalGroup.add(rightPillar);

  // Torii Crossbeam - Kasagi (Top Lintel with slight upward curve)
  const topLintelGeo = new THREE.BoxGeometry(7.2, 0.26, 0.45);
  const topLintel = new THREE.Mesh(topLintelGeo, darkLacquerMat);
  topLintel.position.set(0, 2.5, -1);
  architecturalGroup.add(topLintel);

  // Glowing Crimson Underside Trim
  const crimsonTrimGeo = new THREE.BoxGeometry(6.8, 0.04, 0.47);
  const crimsonTrim = new THREE.Mesh(crimsonTrimGeo, crimsonGlowMat);
  crimsonTrim.position.set(0, 2.34, -1);
  architecturalGroup.add(crimsonTrim);

  // Secondary Beam (Nuki)
  const secondaryBeamGeo = new THREE.BoxGeometry(6.2, 0.18, 0.35);
  const secondaryBeam = new THREE.Mesh(secondaryBeamGeo, darkLacquerMat);
  secondaryBeam.position.set(0, 1.8, -1);
  architecturalGroup.add(secondaryBeam);

  // Kumiko / Shoji Lattice Screen Panel (Subtle Glass & Wireframe Mesh)
  const screenGeo = new THREE.PlaneGeometry(3.6, 2.2, 12, 8);
  const screenMesh = new THREE.Mesh(screenGeo, wireframeMat);
  screenMesh.position.set(0, 0.4, -1.8);
  architecturalGroup.add(screenMesh);

  // Floating Zen Geometric Rings
  const ringGeo = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.3
  });
  const floatingRing1 = new THREE.Mesh(ringGeo, ringMat);
  floatingRing1.position.set(0, 0.5, -2.5);
  floatingRing1.rotation.x = Math.PI / 3;
  architecturalGroup.add(floatingRing1);

  const floatingRing2 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
    color: 0xe63946,
    transparent: true,
    opacity: 0.25
  }));
  floatingRing2.position.set(0, 0.5, -2.5);
  floatingRing2.rotation.x = -Math.PI / 4;
  floatingRing2.rotation.y = Math.PI / 6;
  architecturalGroup.add(floatingRing2);

  // Floating Sleek Octahedrons
  const octaGeo = new THREE.OctahedronGeometry(0.55, 0);
  const octaMesh1 = new THREE.Mesh(octaGeo, darkLacquerMat);
  octaMesh1.position.set(-3.8, 1.8, -2);
  architecturalGroup.add(octaMesh1);

  const octaWire1 = new THREE.Mesh(octaGeo, new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true }));
  octaMesh1.add(octaWire1);

  const octaMesh2 = new THREE.Mesh(octaGeo, darkLacquerMat);
  octaMesh2.position.set(3.8, 1.2, -2.2);
  architecturalGroup.add(octaMesh2);

  const octaWire2 = new THREE.Mesh(octaGeo, new THREE.MeshBasicMaterial({ color: 0xe63946, wireframe: true }));
  octaMesh2.add(octaWire2);

  // ----------------------------------------------------------------------------
  // 2. PERSPECTIVE WIREFRAME GRID FLOOR (Tokyo Night Horizon)
  // ----------------------------------------------------------------------------
  const gridHelper = new THREE.GridHelper(30, 36, 0xe63946, 0x142036);
  gridHelper.position.set(0, -2.7, 0);
  scene.add(gridHelper);

  // ----------------------------------------------------------------------------
  // 3. ATMOSPHERIC PARTICLES (Tokyo Rain / Luminescent Embers)
  // ----------------------------------------------------------------------------
  const particleCount = 750;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  const colorCrimson = new THREE.Color(0xe63946);
  const colorCyan = new THREE.Color(0x00d2ff);
  const colorWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;

    speeds[i] = 0.008 + Math.random() * 0.018;

    const rand = Math.random();
    let c = colorWhite;
    if (rand < 0.35) c = colorCrimson;
    else if (rand < 0.7) c = colorCyan;

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Canvas-generated circular soft particle texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  pCtx.fillStyle = gradient;
  pCtx.fillRect(0, 0, 32, 32);

  const particleTexture = new THREE.CanvasTexture(pCanvas);

  const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    map: particleTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // ----------------------------------------------------------------------------
  // 4. INTERACTIVE MOUSE PARALLAX & ANIMATION LOOP
  // ----------------------------------------------------------------------------
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let isVisible = true;
  let animationFrameId = null;

  function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Handle device orientation for subtle mobile gyroscope
  function onDeviceOrientation(event) {
    if (event.gamma !== null && event.beta !== null) {
      mouseX = (event.gamma / 45);
      mouseY = ((event.beta - 45) / 45);
    }
  }
  window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });

  // Responsive Resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onResize);

  // Visibility optimization via IntersectionObserver
  const heroElement = document.querySelector('.hero-section');
  if (heroElement && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(heroElement);
  }

  // Clock for smooth delta timing
  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (!isVisible) return; // Optimization: do not render when out of viewport

    const elapsedTime = clock.getElapsedTime();

    // Smooth camera / group parallax easing
    targetX += (mouseX * 0.45 - targetX) * 0.04;
    targetY += (-mouseY * 0.25 - targetY) * 0.04;

    camera.position.x = targetX;
    camera.position.y = 1.2 + targetY;
    camera.lookAt(0, 0.7, 0);

    // Subtle gentle movement of architectural structures
    architecturalGroup.rotation.y = Math.sin(elapsedTime * 0.25) * 0.04;
    floatingRing1.rotation.z = elapsedTime * 0.15;
    floatingRing2.rotation.z = -elapsedTime * 0.18;

    octaMesh1.rotation.x = elapsedTime * 0.4;
    octaMesh1.rotation.y = elapsedTime * 0.5;
    octaMesh2.rotation.x = -elapsedTime * 0.35;
    octaMesh2.rotation.y = elapsedTime * 0.45;

    // Pulse crimson light
    crimsonPointLight.intensity = 2.8 + Math.sin(elapsedTime * 2) * 0.8;

    // Animate atmospheric particles (gentle descent & sway)
    const posAttr = particleGeo.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      let py = posAttr.getY(i);
      py -= speeds[i];

      // Reset when particle drops below floor
      if (py < -3.5) {
        py = 7;
        posAttr.setX(i, (Math.random() - 0.5) * 22);
      }

      posAttr.setY(i, py);
      // Subtle horizontal wind drift
      const px = posAttr.getX(i);
      posAttr.setX(i, px + Math.sin(elapsedTime + i) * 0.002);
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  return {
    destroy: () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
