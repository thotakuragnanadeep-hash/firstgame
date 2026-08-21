import * as THREE from 'three';

/**
 * 3D Scene, Lighting & Fixed Perspective Chase Camera System
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep twilight slate
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    // 2. Camera: Fixed 3D Perspective Chase Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.cameraMode = 'iso'; // 'iso' or 'chase'

    // Camera offset presets
    this.cameraOffsets = {
      iso: new THREE.Vector3(14, 18, 14),   // Classic high 2.5D isometric 3/4 angle
      chase: new THREE.Vector3(0, 10, 15)    // Over-the-shoulder 3/4 chase angle
    };
    this.currentOffset = this.cameraOffsets.iso.clone();
    this.targetLookAt = new THREE.Vector3(0, 1, 0);
    this.currentLookAt = new THREE.Vector3(0, 1, 0);

    // Initial camera position
    this.camera.position.copy(this.currentOffset);
    this.camera.lookAt(this.targetLookAt);

    // 3. Renderer with Soft Shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Lighting Setup
    this.setupLighting();

    // 5. Window Resize Handler
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Ambient / Hemisphere Light (Sky & Ground bounce)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.7);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // Directional Sunlight with Shadows
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    this.sunLight.position.set(25, 40, 20);
    this.sunLight.castShadow = true;

    // Shadow map configuration
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;
    this.sunLight.shadow.bias = -0.0005;

    this.scene.add(this.sunLight);

    // Soft colored accent lights for game atmosphere
    const cyanLight = new THREE.PointLight(0x06b6d4, 1.5, 20);
    cyanLight.position.set(-6, 3, -2);
    this.scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 1.5, 20);
    purpleLight.position.set(15, 5, -2);
    this.scene.add(purpleLight);
  }

  toggleCameraMode() {
    this.cameraMode = this.cameraMode === 'iso' ? 'chase' : 'iso';
    return this.cameraMode.toUpperCase();
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Smoothly follow player from fixed 3D perspective
   */
  updateCamera(targetPos, delta) {
    const targetOffset = this.cameraOffsets[this.cameraMode];

    // Smoothly blend camera offset if toggling
    this.currentOffset.lerp(targetOffset, delta * 4);

    // Calculate desired camera position in 3D
    const targetCamPos = new THREE.Vector3(
      targetPos.x + this.currentOffset.x,
      targetPos.y + this.currentOffset.y,
      targetPos.z + this.currentOffset.z
    );

    // Smooth camera damping
    this.camera.position.lerp(targetCamPos, delta * 5.0);

    // Smooth look-at target damping
    this.targetLookAt.set(targetPos.x, targetPos.y + 1.2, targetPos.z);
    this.currentLookAt.lerp(this.targetLookAt, delta * 6.0);
    this.camera.lookAt(this.currentLookAt);

    // Sunlight follows player to ensure high-resolution shadows stay centered
    this.sunLight.position.set(targetPos.x + 25, targetPos.y + 40, targetPos.z + 20);
    this.sunLight.target.position.copy(targetPos);
    this.sunLight.target.updateMatrixWorld();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
