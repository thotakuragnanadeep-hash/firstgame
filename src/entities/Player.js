import * as THREE from 'three';
import { generateCharacterSprites } from '../engine/Sprites.js';
import { audio } from '../engine/Audio.js';

/**
 * 2D Billboard Animated Sprite Player Entity in 3D Space
 */
export class Player {
  constructor(scene, particles) {
    this.scene = scene;
    this.particles = particles;

    // Dimensions
    this.size = new THREE.Vector3(0.8, 1.6, 0.8);
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Movement tuning
    this.baseSpeed = 7.5;
    this.sprintMultiplier = 1.45;
    this.acceleration = 60.0;
    this.friction = 40.0;
    this.jumpForce = 12.0;

    // State
    this.isGrounded = false;
    this.wasGrounded = false;
    this.facing = 'down'; // 'down', 'up', 'left', 'right'
    this.state = 'idle'; // 'idle', 'walk', 'jump'
    this.sprinting = false;

    // Animation timing
    this.animTimer = 0;
    this.animFrame = 0;
    this.walkFps = 8;
    this.idleFps = 2;

    // Load / Generate 2D Sprite Textures
    this.sprites = generateCharacterSprites();

    // Create 3D Sprite Billboard Mesh
    this.spriteGeo = new THREE.PlaneGeometry(1.6, 1.6);
    this.spriteMat = new THREE.MeshStandardMaterial({
      map: this.sprites.down.idle[0],
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.spriteGeo, this.spriteMat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: this.sprites.down.idle[0],
      alphaTest: 0.1
    });

    // Shadow decal/disc at feet
    const shadowGeo = new THREE.PlaneGeometry(1.0, 1.0);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    this.shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;

    // Group to hold sprite + components
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.shadowMesh);

    this.scene.add(this.group);
  }

  jump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      audio.playJump();
      this.particles.spawnDustPuff(this.position, 6);
    }
  }

  onHitWall() {
    // Optional bump feedback when moving against obstacle
  }

  reset(x = 0, y = 2, z = 0) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.facing = 'down';
    this.state = 'idle';
  }

  update(delta, input, camera) {
    const isMoving = input.x !== 0 || input.z !== 0;
    this.sprinting = input.sprint && isMoving;
    const targetSpeed = (this.sprinting ? this.baseSpeed * this.sprintMultiplier : this.baseSpeed);

    // Determine facing direction based on input
    if (isMoving) {
      if (Math.abs(input.x) > Math.abs(input.z)) {
        this.facing = input.x > 0 ? 'right' : 'left';
      } else {
        this.facing = input.z > 0 ? 'down' : 'up';
      }
    }

    // Horizontal Movement Acceleration & Friction
    if (isMoving) {
      // Normalize diagonal speed
      const moveDir = new THREE.Vector2(input.x, input.z).normalize();
      const targetVelX = moveDir.x * targetSpeed;
      const targetVelZ = moveDir.y * targetSpeed;

      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, targetVelX, this.acceleration, delta);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, targetVelZ, this.acceleration, delta);

      if (this.isGrounded) {
        audio.playFootstep();
      }
    } else {
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, 0, this.friction, delta);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, 0, this.friction, delta);
    }

    // Landing detection sound and dust
    if (!this.wasGrounded && this.isGrounded) {
      audio.playLand();
      this.particles.spawnDustPuff(this.position, 8);
    }
    this.wasGrounded = this.isGrounded;

    // Determine Animation State
    if (!this.isGrounded) {
      this.state = 'jump';
    } else if (isMoving && this.velocity.lengthSq() > 0.5) {
      this.state = 'walk';
    } else {
      this.state = 'idle';
    }

    // Animation Frame Timing
    this.animTimer += delta * (this.sprinting ? 1.4 : 1.0);
    const currentFps = this.state === 'walk' ? this.walkFps : this.idleFps;

    if (this.animTimer >= 1 / currentFps) {
      this.animTimer = 0;
      this.animFrame++;
    }

    // Update Sprite Texture Frame
    const dirFrames = this.sprites[this.facing] || this.sprites.down;
    let activeFrames = dirFrames.idle;

    if (this.state === 'walk') {
      activeFrames = dirFrames.walk;
    } else if (this.state === 'jump') {
      activeFrames = dirFrames.jump;
    }

    const currentTex = activeFrames[this.animFrame % activeFrames.length];
    if (this.spriteMat.map !== currentTex) {
      this.spriteMat.map = currentTex;
      this.spriteMat.needsUpdate = true;
      if (this.mesh.customDepthMaterial) {
        this.mesh.customDepthMaterial.map = currentTex;
        this.mesh.customDepthMaterial.needsUpdate = true;
      }
    }

    // Billboard Orientation: Make sprite plane face camera view plane
    this.mesh.quaternion.copy(camera.quaternion);

    // Position Sprite Mesh in 3D (offset center so bottom aligns with feet position)
    this.mesh.position.set(0, this.size.y / 2, 0);

    // Update Group Position
    this.group.position.copy(this.position);

    // Shadow height clamp
    this.shadowMesh.position.y = 0.02;
  }
}
