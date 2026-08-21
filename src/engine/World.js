import * as THREE from 'three';
import { BoxCollider } from './Physics.js';
import { generateBlockTextures } from './Sprites.js';
import { audio } from './Audio.js';

/**
 * 3D Blocky Voxel World Generator
 */
export class World {
  constructor(scene, physics, particles) {
    this.scene = scene;
    this.physics = physics;
    this.particles = particles;
    this.textures = generateBlockTextures();
    this.collectibles = [];
    this.collectedCount = 0;
    this.totalGems = 0;

    // Materials
    this.materials = {
      ground: new THREE.MeshStandardMaterial({
        map: this.textures.ground,
        roughness: 0.85,
        metalness: 0.1
      }),
      grassTop: new THREE.MeshStandardMaterial({
        map: this.textures.grassTop,
        roughness: 0.7
      }),
      stone: new THREE.MeshStandardMaterial({
        map: this.textures.stone,
        roughness: 0.9,
        metalness: 0.05
      }),
      crate: new THREE.MeshStandardMaterial({
        map: this.textures.crate,
        roughness: 0.6
      }),
      crystal: new THREE.MeshStandardMaterial({
        map: this.textures.crystal,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.6
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0x5c2c16,
        roughness: 0.8
      }),
      leaves: new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.6
      }),
      fence: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.8
      }),
      gem: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8
      })
    };

    this.buildWorld();
  }

  createBlock(x, y, z, width = 1, height = 1, depth = 1, material = this.materials.stone, castShadow = true) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, material);
    // Position center in Three.js
    mesh.position.set(x + width / 2, y + height / 2, z + depth / 2);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Register 3D Physics AABB Collider
    const collider = new BoxCollider(x, y, z, x + width, y + height, z + depth);
    this.physics.addCollider(collider);

    return mesh;
  }

  createTree(x, z) {
    // Wood Trunk (1x3x1)
    this.createBlock(x, 0, z, 1, 3, 1, this.materials.wood);
    // Foliage Bottom (3x2x3)
    this.createBlock(x - 1, 3, z - 1, 3, 2, 3, this.materials.leaves);
    // Foliage Top (1x1.5x1)
    this.createBlock(x, 5, z, 1, 1.5, 1, this.materials.leaves);
  }

  createGem(x, y, z) {
    const geo = new THREE.OctahedronGeometry(0.4, 0);
    const mesh = new THREE.Mesh(geo, this.materials.gem);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.collectibles.push({
      mesh,
      pos: new THREE.Vector3(x, y, z),
      baseY: y,
      collected: false,
      rotSpeed: 2.0 + Math.random()
    });
    this.totalGems++;
  }

  buildWorld() {
    // 1. Flat 3D Ground Plane
    const groundSize = 64;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMesh = new THREE.Mesh(groundGeo, this.materials.ground);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // 2. Center Starter Area & Low Obstacle Blocks (for basic collision & jump test)
    this.createBlock(3, 0, 2, 2, 1, 2, this.materials.crate);
    this.createBlock(3, 1, 2, 1.5, 1, 1.5, this.materials.crate);

    this.createBlock(-4, 0, 3, 2, 1.2, 2, this.materials.stone);
    this.createBlock(-6, 0, -2, 2, 2, 2, this.materials.crystal);
    this.createBlock(4, 0, -4, 2.5, 1.5, 2.5, this.materials.stone);

    // 3. Stepped Staircase of Blocks (test elevation & hopping up)
    for (let i = 0; i < 5; i++) {
      this.createBlock(8 + i * 1.5, 0, -2, 1.5, (i + 1) * 0.8, 2.5, this.materials.stone);
    }
    // High lookout platform at top of stairs
    this.createBlock(15.5, 0, -3, 3, 4.0, 4, this.materials.crystal);
    this.createGem(17.0, 5.0, -1.0);

    // 4. Floating 3D Platforms (test jumping under and across)
    this.createBlock(-3, 2.2, -7, 3, 0.6, 3, this.materials.grassTop);
    this.createGem(-1.5, 3.4, -5.5);

    this.createBlock(-8, 3.5, -8, 3, 0.6, 3, this.materials.grassTop);
    this.createGem(-6.5, 4.7, -6.5);

    this.createBlock(-13, 4.8, -7, 3, 0.6, 3, this.materials.grassTop);
    this.createGem(-11.5, 6.0, -5.5);

    // 5. Blocky Voxel Maze / Ruins in South-West Quadrant
    const mazeBlocks = [
      [-10, 0, 6, 6, 2.5, 1],
      [-10, 0, 7, 1, 2.5, 6],
      [-5, 0, 7, 1, 2.5, 4],
      [-8, 0, 12, 5, 2.5, 1],
      [-7, 0, 9, 2, 1.0, 2] // low vaulting block inside maze
    ];
    for (const b of mazeBlocks) {
      this.createBlock(b[0], b[1], b[2], b[3], b[4], b[5], this.materials.stone);
    }
    this.createGem(-7.0, 1.8, 10.0);

    // 6. Blocky Parkour Pillars in South-East Quadrant
    const pillars = [
      [6, 0, 6, 1.6, 1.0, 1.6],
      [9, 0, 8, 1.6, 1.8, 1.6],
      [12, 0, 6, 1.6, 2.6, 1.6],
      [10, 0, 3, 1.6, 3.4, 1.6]
    ];
    for (const p of pillars) {
      this.createBlock(p[0], p[1], p[2], p[3], p[4], p[5], this.materials.crate);
    }
    this.createGem(10.8, 4.4, 3.8);

    // 7. Decorative Voxel Trees
    const treeCoords = [
      [-15, -15], [-8, -16], [5, -14], [14, -12],
      [-18, 2], [-16, 16], [16, 14], [18, -4],
      [-4, 16], [4, 16], [14, 18]
    ];
    for (const [tx, tz] of treeCoords) {
      this.createTree(tx, tz);
    }

    // 8. Ground Collectibles
    this.createGem(0, 0.8, -3);
    this.createGem(-2, 0.8, 3);
    this.createGem(5, 0.8, 0);
    this.createGem(-12, 0.8, -12);
    this.createGem(12, 0.8, 12);
    this.createGem(0, 0.8, 10);
    this.createGem(0, 0.8, -10);

    // 9. World Boundary Fence Walls
    const bound = 26;
    const fenceHeight = 2.0;
    const thickness = 1.0;
    // North & South
    this.createBlock(-bound, 0, -bound, bound * 2, fenceHeight, thickness, this.materials.fence, false);
    this.createBlock(-bound, 0, bound, bound * 2, fenceHeight, thickness, this.materials.fence, false);
    // East & West
    this.createBlock(-bound, 0, -bound, thickness, fenceHeight, bound * 2, this.materials.fence, false);
    this.createBlock(bound, 0, -bound, thickness, fenceHeight, bound * 2, this.materials.fence, false);
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.001;

    // Animate & Check Collection for 3D Gems
    for (const gem of this.collectibles) {
      if (gem.collected) continue;

      // Rotate & Bobbing
      gem.mesh.rotation.y += gem.rotSpeed * delta;
      gem.mesh.rotation.x = Math.sin(time * 2) * 0.2;
      gem.mesh.position.y = gem.baseY + Math.sin(time * 3 + gem.pos.x) * 0.2;

      // Distance check to player (cylinder / sphere check)
      const dx = playerPos.x - gem.mesh.position.x;
      const dy = playerPos.y + 0.8 - gem.mesh.position.y;
      const dz = playerPos.z - gem.mesh.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 1.4 * 1.4) {
        // Collect gem
        gem.collected = true;
        this.scene.remove(gem.mesh);
        this.collectedCount++;
        audio.playGemCollect();
        this.particles.spawnSparkles(gem.mesh.position, 16);

        // Update HUD
        const gemCountEl = document.getElementById('gem-count');
        if (gemCountEl) {
          gemCountEl.textContent = `${this.collectedCount} / ${this.totalGems}`;
        }

        if (this.collectedCount === this.totalGems) {
          audio.playFanfare();
        }
      }
    }
  }
}
