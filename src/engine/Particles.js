import * as THREE from 'three';

/**
 * 3D Particle System for Jump Dust, Landing Impacts, Sparkles and Ambient Motes
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Shared simple geometries and materials
    this.dustGeo = new THREE.PlaneGeometry(0.3, 0.3);
    this.starGeo = new THREE.PlaneGeometry(0.4, 0.4);

    // Dust canvas texture
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 32;
    dCanvas.height = 32;
    const dCtx = dCanvas.getContext('2d');
    dCtx.fillStyle = '#ffffff';
    dCtx.beginPath();
    dCtx.arc(16, 16, 14, 0, Math.PI * 2);
    dCtx.fill();
    const dustTex = new THREE.CanvasTexture(dCanvas);

    this.dustMat = new THREE.MeshBasicMaterial({
      map: dustTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      color: 0x94a3b8
    });

    this.sparkleMat = new THREE.MeshBasicMaterial({
      map: dustTex,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      color: 0x38bdf8
    });

    // Ambient floating dust motes
    this.initAmbientMotes();
  }

  initAmbientMotes() {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.ambientPoints = new THREE.Points(geo, mat);
    this.scene.add(this.ambientPoints);
  }

  spawnDustPuff(pos, count = 5) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.dustGeo, this.dustMat.clone());
      mesh.position.copy(pos);
      mesh.position.x += (Math.random() - 0.5) * 0.4;
      mesh.position.y += 0.1 + Math.random() * 0.1;
      mesh.position.z += (Math.random() - 0.5) * 0.4;

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        1.0 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.0
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        life: 0.45,
        maxLife: 0.45,
        scaleSpeed: 1.5
      });
    }
  }

  spawnSparkles(pos, count = 12) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.starGeo, this.sparkleMat.clone());
      mesh.position.copy(pos);

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 3.5 + Math.random() * 2.5;

      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 3.0,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        life: 0.65,
        maxLife: 0.65,
        scaleSpeed: -0.8
      });
    }
  }

  update(delta, camera) {
    // Animate ambient floating motes
    if (this.ambientPoints) {
      const posAttr = this.ambientPoints.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - delta * 0.3;
        if (y < 0) y = 15;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Billboard orientation
      p.mesh.quaternion.copy(camera.quaternion);

      // Move particle
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 6.0 * delta; // particle gravity

      // Fade & scale
      const progress = p.life / p.maxLife;
      p.mesh.material.opacity = progress;
      const scale = 0.5 + (1 - progress) * p.scaleSpeed;
      p.mesh.scale.set(Math.max(0.1, scale), Math.max(0.1, scale), 1);
    }
  }
}
