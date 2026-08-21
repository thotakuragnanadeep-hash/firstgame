import { SceneManager } from './engine/SceneManager.js';
import { PhysicsEngine } from './engine/Physics.js';
import { ParticleSystem } from './engine/Particles.js';
import { World } from './engine/World.js';
import { Player } from './entities/Player.js';
import { audio } from './engine/Audio.js';

/**
 * Main Application Orchestrator & Game Loop
 */
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.sceneManager = new SceneManager(this.canvas);
    this.physics = new PhysicsEngine();
    this.particles = new ParticleSystem(this.sceneManager.scene);
    this.world = new World(this.sceneManager.scene, this.physics, this.particles);
    this.player = new Player(this.sceneManager.scene, this.particles);

    // Initial player placement
    this.player.reset(0, 0.1, 0);

    // Input state
    this.keys = {};
    this.input = { x: 0, z: 0, sprint: false };

    // Timing
    this.lastTime = performance.now();
    this.maxDelta = 0.05; // 50ms clamp

    // Setup UI & Input Listeners
    this.setupInputs();
    this.setupUI();

    // Start Main Loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    this.showToast('Welcome to Voxel Venture 2.5D! Use Arrows or WASD to move.');
  }

  setupInputs() {
    // Keyboard keydown
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      audio.init();

      if (e.code === 'Space') {
        e.preventDefault();
        this.player.jump();
      } else if (e.code === 'KeyR') {
        this.player.reset(0, 3, 0);
        this.showToast('Player Position Reset!');
      } else if (e.code === 'KeyM') {
        this.toggleSound();
      } else if (e.code === 'KeyC') {
        this.toggleCamera();
      } else if (e.code === 'KeyH') {
        this.toggleHelpModal();
      }
    });

    // Keyboard keyup
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch D-Pad & Actions for Mobile
    const touchButtons = document.querySelectorAll('.dpad-btn, .action-touch-btn');
    touchButtons.forEach(btn => {
      const key = btn.dataset.key;
      if (!key) return;

      const handlePress = (e) => {
        e.preventDefault();
        audio.init();
        this.keys[key] = true;
        if (key === 'Space') {
          this.player.jump();
        }
      };

      const handleRelease = (e) => {
        e.preventDefault();
        this.keys[key] = false;
      };

      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('touchend', handleRelease, { passive: false });
      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);
    });
  }

  setupUI() {
    // Sound Button
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }

    // Camera Button
    const camBtn = document.getElementById('camera-btn');
    if (camBtn) {
      camBtn.addEventListener('click', () => this.toggleCamera());
    }

    // Help Modal
    const helpBtn = document.getElementById('help-btn');
    const closeHelpBtn = document.getElementById('close-help-btn');
    const modalStartBtn = document.getElementById('modal-start-btn');
    const helpModal = document.getElementById('help-modal');

    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
      });
    }
    if (closeHelpBtn && helpModal) {
      closeHelpBtn.addEventListener('click', () => {
        helpModal.classList.add('hidden');
      });
    }
    if (modalStartBtn && helpModal) {
      modalStartBtn.addEventListener('click', () => {
        helpModal.classList.add('hidden');
        audio.init();
      });
    }
  }

  toggleSound() {
    const isEnabled = audio.toggle();
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.querySelector('.btn-text').textContent = isEnabled ? 'SOUND: ON' : 'SOUND: OFF';
      soundBtn.querySelector('.btn-icon').textContent = isEnabled ? '🔊' : '🔇';
    }
    this.showToast(isEnabled ? 'Sound Enabled' : 'Sound Muted');
  }

  toggleCamera() {
    const mode = this.sceneManager.toggleCameraMode();
    const camBtn = document.getElementById('camera-btn');
    if (camBtn) {
      camBtn.querySelector('.btn-text').textContent = `CAM: ${mode}`;
    }
    this.showToast(`Camera View: ${mode}`);
  }

  toggleHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.classList.toggle('hidden');
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast-banner');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;

    text.textContent = message;
    toast.classList.remove('hidden');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  updateInput() {
    let x = 0;
    let z = 0;

    // Horizontal (X axis in 3D: Left = -X, Right = +X)
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;

    // Vertical / Depth (Z axis in 3D: Up/Forward = -Z, Down/Backward = +Z)
    if (this.keys['ArrowUp'] || this.keys['KeyW']) z -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) z += 1;

    this.input.x = x;
    this.input.z = z;
    this.input.sprint = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']);
  }

  updateHUD() {
    // 1. Position Coordinates
    const posEl = document.getElementById('pos-display');
    if (posEl) {
      const p = this.player.position;
      posEl.textContent = `X:${p.x.toFixed(1)} Y:${p.y.toFixed(1)} Z:${p.z.toFixed(1)}`;
    }

    // 2. State Display
    const stateEl = document.getElementById('state-display');
    if (stateEl) {
      stateEl.textContent = this.player.state.toUpperCase();
      if (this.player.state === 'jump') {
        stateEl.style.color = '#f59e0b';
      } else if (this.player.state === 'walk') {
        stateEl.style.color = this.player.sprinting ? '#c084fc' : '#10b981';
      } else {
        stateEl.style.color = '#38bdf8';
      }
    }

    // 3. Direction Compass
    const compassArrow = document.getElementById('compass-arrow');
    const compassText = document.getElementById('compass-text');
    if (compassArrow && compassText) {
      const facingNames = {
        down: 'FACING SOUTH (DOWN)',
        up: 'FACING NORTH (UP)',
        left: 'FACING WEST (LEFT)',
        right: 'FACING EAST (RIGHT)'
      };
      const rotations = {
        down: '180deg',
        up: '0deg',
        left: '270deg',
        right: '90deg'
      };

      compassText.textContent = facingNames[this.player.facing] || 'FACING SOUTH';
      compassArrow.style.transform = `rotate(${rotations[this.player.facing] || '0deg'})`;
    }
  }

  loop(timestamp) {
    const deltaMs = timestamp - this.lastTime;
    this.lastTime = timestamp;
    const delta = Math.min(deltaMs * 0.001, this.maxDelta);

    // 1. Process Input
    this.updateInput();

    // 2. Update Player Entity
    this.player.update(delta, this.input, this.sceneManager.camera);

    // 3. Physics & Collisions
    this.physics.updatePlayer(this.player, delta);

    // 4. Update World (collectibles, animations)
    this.world.update(delta, this.player.position);

    // 5. Update Particle System
    this.particles.update(delta, this.sceneManager.camera);

    // 6. Camera Tracking
    this.sceneManager.updateCamera(this.player.position, delta);

    // 7. Update HUD
    this.updateHUD();

    // 8. Render Three.js Scene
    this.sceneManager.render();

    requestAnimationFrame(this.loop);
  }
}

// Bootstrap once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
