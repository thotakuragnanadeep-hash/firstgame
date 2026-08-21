# firstgame (v0.1)

A 2.5D action-adventure game built with Three.js featuring a 2D animated pixel-art billboard sprite in a stylized 3D blocky voxel world with fixed perspective camera tracking and 3D AABB physics collisions.

## 🎮 Features
- **2D Billboard Sprite Character**: Dynamically aligns with the camera view plane in 3D space with 4-directional animated sprites (`Idle`, `Walk`, `Jump`).
- **3D Blocky Voxel World**: Ground plane, obstacle cubes, climbable staircases, floating platforms, decorative trees, and collectible floating 3D gems.
- **3D AABB Physics Engine**: Multi-axis sliding collision detection, gravity, jumping, and step landing.
- **Fixed 3D Perspective Chase Camera**: Smooth 3/4 isometric chase camera with mode toggling (`ISO` / `CHASE`).
- **Web Audio Synthesizer**: Procedural sound effects for movement, jumping, landings, and gem pickups.
- **Responsive HUD & Controls**: Coordinates display, facing direction compass, gem counter, and mobile virtual touch controls.

## 🕹️ Controls
- **Move**: `Arrow Keys` or `W`, `A`, `S`, `D`
- **Jump**: `Space`
- **Sprint**: `Shift`
- **Camera Toggle**: `C`
- **Reset Position**: `R`
- **Toggle Sound**: `M`
- **Help**: `H`

## 🚀 How to Run Locally
Run any local static HTTP server from the project directory:
```bash
# Using Python
python3 -m http.server 8000

# Or using Ruby
ruby -run -ehttpd . -p8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.
