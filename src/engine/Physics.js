import * as THREE from 'three';

/**
 * 3D AABB Physics and Collision System
 */

export class BoxCollider {
  constructor(minX, minY, minZ, maxX, maxY, maxZ) {
    this.min = new THREE.Vector3(minX, minY, minZ);
    this.max = new THREE.Vector3(maxX, maxY, maxZ);
  }

  static fromPositionSize(pos, size) {
    const halfX = size.x / 2;
    const halfZ = size.z / 2;
    return new BoxCollider(
      pos.x - halfX,
      pos.y,
      pos.z - halfZ,
      pos.x + halfX,
      pos.y + size.y,
      pos.z + halfZ
    );
  }

  intersects(other) {
    return (
      this.min.x < other.max.x &&
      this.max.x > other.min.x &&
      this.min.y < other.max.y &&
      this.max.y > other.min.y &&
      this.min.z < other.max.z &&
      this.max.z > other.min.z
    );
  }
}

export class PhysicsEngine {
  constructor() {
    this.gravity = -36.0; // Responsive crisp gravity
    this.colliders = [];
  }

  addCollider(collider) {
    this.colliders.push(collider);
  }

  clearColliders() {
    this.colliders = [];
  }

  /**
   * Resolves player movement and collision with all world colliders.
   * Player bounding box size is width=0.8, height=1.6, depth=0.8
   */
  updatePlayer(player, delta) {
    const size = player.size; // Vector3(0.8, 1.6, 0.8)
    const pos = player.position;
    const vel = player.velocity;

    // Apply Gravity
    vel.y += this.gravity * delta;
    if (vel.y < -30) vel.y = -30; // Terminal velocity clamp

    // 1. Move & Resolve along X axis
    const moveX = vel.x * delta;
    if (moveX !== 0) {
      pos.x += moveX;
      let playerBox = BoxCollider.fromPositionSize(pos, size);
      for (const col of this.colliders) {
        if (playerBox.intersects(col)) {
          if (moveX > 0) {
            pos.x = col.min.x - size.x / 2 - 0.001;
          } else {
            pos.x = col.max.x + size.x / 2 + 0.001;
          }
          vel.x = 0;
          playerBox = BoxCollider.fromPositionSize(pos, size);
          player.onHitWall();
        }
      }
    }

    // 2. Move & Resolve along Z axis
    const moveZ = vel.z * delta;
    if (moveZ !== 0) {
      pos.z += moveZ;
      let playerBox = BoxCollider.fromPositionSize(pos, size);
      for (const col of this.colliders) {
        if (playerBox.intersects(col)) {
          if (moveZ > 0) {
            pos.z = col.min.z - size.z / 2 - 0.001;
          } else {
            pos.z = col.max.z + size.z / 2 + 0.001;
          }
          vel.z = 0;
          playerBox = BoxCollider.fromPositionSize(pos, size);
          player.onHitWall();
        }
      }
    }

    // 3. Move & Resolve along Y axis (Vertical / Gravity / Platforms / Ground)
    const moveY = vel.y * delta;
    pos.y += moveY;
    let playerBox = BoxCollider.fromPositionSize(pos, size);
    let onGround = false;

    // Check ground plane (Y = 0)
    if (pos.y <= 0) {
      pos.y = 0;
      vel.y = 0;
      onGround = true;
    }

    // Check collision against all obstacle boxes
    for (const col of this.colliders) {
      if (playerBox.intersects(col)) {
        if (vel.y <= 0) {
          // Landing on top of a block
          pos.y = col.max.y;
          vel.y = 0;
          onGround = true;
        } else {
          // Hitting head on ceiling/bottom of floating block
          pos.y = col.min.y - size.y - 0.001;
          vel.y = 0;
        }
        playerBox = BoxCollider.fromPositionSize(pos, size);
      }
    }

    // Check if grounded on step
    if (!onGround) {
      const feetBox = new BoxCollider(
        pos.x - size.x / 2 + 0.05,
        pos.y - 0.08,
        pos.z - size.z / 2 + 0.05,
        pos.x + size.x / 2 - 0.05,
        pos.y,
        pos.z + size.z / 2 - 0.05
      );

      if (pos.y <= 0.05) {
        onGround = true;
      } else {
        for (const col of this.colliders) {
          if (feetBox.intersects(col)) {
            onGround = true;
            break;
          }
        }
      }
    }

    player.isGrounded = onGround;

    // World bounds safety clamp
    const limit = 32;
    pos.x = THREE.MathUtils.clamp(pos.x, -limit, limit);
    pos.z = THREE.MathUtils.clamp(pos.z, -limit, limit);
    if (pos.y < -10) {
      // Fall recovery
      pos.set(0, 4, 0);
      vel.set(0, 0, 0);
    }
  }
}
