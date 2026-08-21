import * as THREE from 'three';

/**
 * Procedural Pixel-Art Sprite & Voxel Texture Generator
 * Generates crisp 2D character sprite frames and 3D block materials.
 */

// Helper to create sharp Three.js canvas textures
function createPixelTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Draws a pixel grid onto a 2D canvas context
 */
function drawPixelGrid(ctx, pixelMap, colorPalette, scale = 4, offsetX = 0, offsetY = 0) {
  for (let r = 0; r < pixelMap.length; r++) {
    const row = pixelMap[r];
    for (let c = 0; c < row.length; c++) {
      const colorKey = row[c];
      if (colorKey && colorPalette[colorKey]) {
        ctx.fillStyle = colorPalette[colorKey];
        ctx.fillRect(offsetX + c * scale, offsetY + r * scale, scale, scale);
      }
    }
  }
}

/**
 * Generates all character sprite textures
 * Directions: 'down' (front/camera), 'up' (back), 'left', 'right'
 * States: 'idle', 'walk', 'jump'
 */
export function generateCharacterSprites() {
  const spriteMap = {};
  const directions = ['down', 'up', 'left', 'right'];
  const spriteWidth = 32;
  const spriteHeight = 32;
  const scale = 4; // 128x128 texture resolution for crispness

  // Palette: Vibrant heroic knight / adventurer colors
  const palette = {
    // Skin
    s: '#fcd34d', // skin light
    S: '#f59e0b', // skin shadow
    // Hair / Helmet
    h: '#3b82f6', // helmet blue
    H: '#1d4ed8', // helmet shadow
    g: '#fef08a', // gold visor/crest
    G: '#eab308', // dark gold
    // Armor / Clothing
    a: '#06b6d4', // cyan tunic
    A: '#0891b2', // cyan shadow
    b: '#38bdf8', // bright accent
    w: '#ffffff', // white / glint
    // Pants / Boots
    p: '#334155', // dark pants
    P: '#1e293b', // pants shadow
    k: '#78350f', // leather boots
    K: '#451a03', // boot shadow
    // Eyes
    e: '#0f172a', // dark eye
    // Outline
    o: 'rgba(15, 23, 42, 0.6)'
  };

  // Helper to generate a sprite canvas
  function makeFrameCanvas(pixelRows) {
    const canvas = document.createElement('canvas');
    canvas.width = spriteWidth * scale;
    canvas.height = spriteHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Draw soft drop shadow at bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      canvas.height - 4 * scale,
      8 * scale,
      3 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    drawPixelGrid(ctx, pixelRows, palette, scale, 4 * scale, 2 * scale);
    return createPixelTexture(canvas);
  }

  // --- DOWN / FRONT (Facing camera) ---
  const downIdleFrames = [
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "     sAabbbbaAs     ",
      "     sAAAAAAAAAs    ",
      "      ssssssss      ",
      "       PPPPPP       ",
      "       pp  pp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "     sAabbbbaAs     ",
      "     sAAAAAAAAAs    ",
      "      ssssssss      ",
      "       PPPPPP       ",
      "       pppppp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ]
  ];

  const downWalkFrames = [
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "      sAAAAAAs      ",
      "      sAbbbbaA      ",
      "      sAbbbbaA      ",
      "       AAAAAAAs     ",
      "       sssssss      ",
      "       PPPPPP       ",
      "      pp    pp      ",
      "      pp    pp      ",
      "      KK    KK      ",
      "      kk    kk      "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "      sAAAAAAs      ",
      "       ssssss       ",
      "       PPPPPP       ",
      "       pp  pp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "      sAAAAAAs      ",
      "       AbbbbaAs     ",
      "       AbbbbaAs     ",
      "      sAAAAAAA      ",
      "       sssssss      ",
      "       PPPPPP       ",
      "      pp    pp      ",
      "      pp    pp      ",
      "      KK    KK      ",
      "      kk    kk      "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "      sAAAAAAs      ",
      "       ssssss       ",
      "       PPPPPP       ",
      "       pp  pp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ]
  ];

  const downJumpFrame = [
    [
      "     s  GGGG  s     ",
      "     s GggggG s     ",
      "     sHHhhhhHHs     ",
      "      HhhhhhhH      ",
      "      HhsssssH      ",
      "      HseeeesH      ",
      "      HssssssH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "      AabbbbaA      ",
      "      AAAAAAAA      ",
      "       PPPPPP       ",
      "      pp    pp      ",
      "     pp      pp     ",
      "     KK      KK     ",
      "     kk      kk     "
    ]
  ];

  // --- UP / BACK (Facing away from camera) ---
  const upIdleFrames = [
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "     sAabbbbaAs     ",
      "     sAAAAAAAAAs    ",
      "      ssssssss      ",
      "       PPPPPP       ",
      "       pp  pp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "     sAabbbbaAs     ",
      "     sAAAAAAAAAs    ",
      "      ssssssss      ",
      "       PPPPPP       ",
      "       pppppp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ]
  ];

  const upWalkFrames = [
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "      sAAAAAAs      ",
      "      sAbbbbaA      ",
      "      sAbbbbaA      ",
      "       AAAAAAAs     ",
      "       sssssss      ",
      "       PPPPPP       ",
      "      pp    pp      ",
      "      pp    pp      ",
      "      KK    KK      ",
      "      kk    kk      "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "      sAAAAAAs      ",
      "       ssssss       ",
      "       PPPPPP       ",
      "       pp  pp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "      sAAAAAAs      ",
      "       AbbbbaAs     ",
      "       AbbbbaAs     ",
      "      sAAAAAAA      ",
      "       sssssss      ",
      "       PPPPPP       ",
      "      pp    pp      ",
      "      pp    pp      ",
      "      KK    KK      ",
      "      kk    kk      "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhHH      ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "     sAabbbbaAs     ",
      "      sAAAAAAs      ",
      "       ssssss       ",
      "       PPPPPP       ",
      "       pp  pp       ",
      "       pp  pp       ",
      "       KK  KK       ",
      "       kk  kk       "
    ]
  ];

  const upJumpFrame = [
    [
      "     s  GGGG  s     ",
      "     s GggggG s     ",
      "     sHHhhhhHHs     ",
      "      HhhhhhhH      ",
      "      HHhhhhHH      ",
      "      HHhhhhHH      ",
      "      HHHHHHHH      ",
      "       AAAAAA       ",
      "      AabbbbaA      ",
      "      AabbbbaA      ",
      "      AAAAAAAA      ",
      "       PPPPPP       ",
      "      pp    pp      ",
      "     pp      pp     ",
      "     KK      KK     ",
      "     kk      kk     "
    ]
  ];

  // --- RIGHT (Facing Right) ---
  const rightIdleFrames = [
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhh       ",
      "      Hhhhhhh       ",
      "      Hhssss      ",
      "      Hseeee      ",
      "      Hsssss        ",
      "       AAAAA        ",
      "      AabbbbA       ",
      "      Aabbbbs       ",
      "      Aabbbbs       ",
      "      AAAAAAs       ",
      "       ssssss       ",
      "       PPPPP        ",
      "       pp pp        ",
      "       pp pp        ",
      "       KK KK        ",
      "       kk kk        "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhh       ",
      "      Hhhhhhh       ",
      "      Hhssss      ",
      "      Hseeee      ",
      "      Hsssss        ",
      "       AAAAA        ",
      "      AabbbbA       ",
      "      Aabbbbs       ",
      "      Aabbbbs       ",
      "      AAAAAAs       ",
      "       ssssss       ",
      "       PPPPP        ",
      "       ppppp        ",
      "       pp pp        ",
      "       KK KK        ",
      "       kk kk        "
    ]
  ];

  const rightWalkFrames = [
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhh       ",
      "      Hhhhhhh       ",
      "      Hhssss        ",
      "      Hseeee        ",
      "      Hsssss        ",
      "       AAAAA        ",
      "      AabbbbA       ",
      "     sAabbbbs       ",
      "     sAAAAAAs       ",
      "      ssssss        ",
      "       PPPPP        ",
      "      pp   pp       ",
      "     pp     pp      ",
      "     KK     KK      ",
      "     kk     kk      "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhh       ",
      "      Hhhhhhh       ",
      "      Hhssss        ",
      "      Hseeee        ",
      "      Hsssss        ",
      "       AAAAA        ",
      "      AabbbbA       ",
      "      Aabbbbs       ",
      "      AAAAAAs       ",
      "       ssssss       ",
      "       PPPPP        ",
      "       pp pp        ",
      "       pp pp        ",
      "       KK KK        ",
      "       kk kk        "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhh       ",
      "      Hhhhhhh       ",
      "      Hhssss        ",
      "      Hseeee        ",
      "      Hsssss        ",
      "       AAAAA        ",
      "     sAabbbbA       ",
      "     sAabbbbs       ",
      "      AAAAAAs       ",
      "       ssssss       ",
      "       PPPPP        ",
      "     pp   pp        ",
      "    pp     pp       ",
      "    KK     KK       ",
      "    kk     kk       "
    ],
    [
      "        GGGG        ",
      "       GggggG       ",
      "      HHhhhhh       ",
      "      Hhhhhhh       ",
      "      Hhssss        ",
      "      Hseeee        ",
      "      Hsssss        ",
      "       AAAAA        ",
      "      AabbbbA       ",
      "      Aabbbbs       ",
      "      AAAAAAs       ",
      "       ssssss       ",
      "       PPPPP        ",
      "       pp pp        ",
      "       pp pp        ",
      "       KK KK        ",
      "       kk kk        "
    ]
  ];

  const rightJumpFrame = [
    [
      "        GGGG        ",
      "      sGggggGs      ",
      "      sHhhhhhs      ",
      "      Hhhhhhh       ",
      "      Hhssss        ",
      "      Hseeee        ",
      "      Hsssss        ",
      "       AAAAA        ",
      "      AabbbbA       ",
      "      AabbbbA       ",
      "      AAAAAAA       ",
      "       PPPPP        ",
      "     pp     pp      ",
      "    pp       pp     ",
      "    KK       KK     ",
      "    kk       kk     "
    ]
  ];

  // Helper to horizontally flip pixel grid string arrays for LEFT facing
  function flipGrid(grid) {
    return grid.map(row => row.split('').reverse().join(''));
  }

  // Populate Sprite Map
  spriteMap.down = {
    idle: downIdleFrames.map(f => makeFrameCanvas(f)),
    walk: downWalkFrames.map(f => makeFrameCanvas(f)),
    jump: downJumpFrame.map(f => makeFrameCanvas(f))
  };

  spriteMap.up = {
    idle: upIdleFrames.map(f => makeFrameCanvas(f)),
    walk: upWalkFrames.map(f => makeFrameCanvas(f)),
    jump: upJumpFrame.map(f => makeFrameCanvas(f))
  };

  spriteMap.right = {
    idle: rightIdleFrames.map(f => makeFrameCanvas(f)),
    walk: rightWalkFrames.map(f => makeFrameCanvas(f)),
    jump: rightJumpFrame.map(f => makeFrameCanvas(f))
  };

  spriteMap.left = {
    idle: downIdleFrames.map((_, i) => makeFrameCanvas(flipGrid(rightIdleFrames[i]))),
    walk: downWalkFrames.map((_, i) => makeFrameCanvas(flipGrid(rightWalkFrames[i]))),
    jump: downJumpFrame.map((_, i) => makeFrameCanvas(flipGrid(rightJumpFrame[i])))
  };

  return spriteMap;
}

/**
 * Generates rich procedural voxel block materials
 */
export function generateBlockTextures() {
  const size = 64;

  // 1. Grass Top Texture
  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = size;
  grassCanvas.height = size;
  const gCtx = grassCanvas.getContext('2d');
  gCtx.fillStyle = '#22c55e'; // vibrant emerald green
  gCtx.fillRect(0, 0, size, size);

  // Grass noise & detail
  for (let x = 0; x < size; x += 4) {
    for (let y = 0; y < size; y += 4) {
      const rand = Math.random();
      if (rand > 0.65) {
        gCtx.fillStyle = '#16a34a'; // darker green
        gCtx.fillRect(x, y, 4, 4);
      } else if (rand > 0.88) {
        gCtx.fillStyle = '#4ade80'; // lighter lime highlight
        gCtx.fillRect(x, y, 4, 4);
      }
    }
  }

  // 2. Dirt / Grass Side Texture
  const dirtCanvas = document.createElement('canvas');
  dirtCanvas.width = size;
  dirtCanvas.height = size;
  const dCtx = dirtCanvas.getContext('2d');
  dCtx.fillStyle = '#78350f'; // rich warm brown
  dCtx.fillRect(0, 0, size, size);

  // Dirt flecks
  for (let x = 0; x < size; x += 4) {
    for (let y = 16; y < size; y += 4) {
      const rand = Math.random();
      if (rand > 0.7) {
        dCtx.fillStyle = '#451a03';
        dCtx.fillRect(x, y, 4, 4);
      } else if (rand > 0.9) {
        dCtx.fillStyle = '#92400e';
        dCtx.fillRect(x, y, 4, 4);
      }
    }
  }

  // Grass overhang
  dCtx.fillStyle = '#22c55e';
  dCtx.fillRect(0, 0, size, 12);
  for (let x = 0; x < size; x += 8) {
    const hang = 4 + Math.floor(Math.random() * 8);
    dCtx.fillStyle = '#16a34a';
    dCtx.fillRect(x, 12, 8, hang);
  }

  // 3. Stone Brick Texture
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = size;
  stoneCanvas.height = size;
  const sCtx = stoneCanvas.getContext('2d');
  sCtx.fillStyle = '#475569'; // Slate base
  sCtx.fillRect(0, 0, size, size);

  // Mortar lines
  sCtx.fillStyle = '#1e293b';
  sCtx.fillRect(0, 0, size, 2);
  sCtx.fillRect(0, 31, size, 2);
  sCtx.fillRect(0, size - 2, size, 2);
  sCtx.fillRect(31, 0, 2, 32);
  sCtx.fillRect(15, 32, 2, 32);
  sCtx.fillRect(47, 32, 2, 32);

  // Stone grain
  for (let x = 0; x < size; x += 4) {
    for (let y = 0; y < size; y += 4) {
      if (Math.random() > 0.7) {
        sCtx.fillStyle = '#64748b';
        sCtx.fillRect(x, y, 4, 4);
      }
    }
  }

  // 4. Wooden Crate Texture
  const crateCanvas = document.createElement('canvas');
  crateCanvas.width = size;
  crateCanvas.height = size;
  const cCtx = crateCanvas.getContext('2d');
  cCtx.fillStyle = '#b45309'; // Warm amber wood
  cCtx.fillRect(0, 0, size, size);

  // Outer border & cross brace
  cCtx.fillStyle = '#78350f';
  cCtx.lineWidth = 6;
  cCtx.strokeRect(3, 3, size - 6, size - 6);
  cCtx.beginPath();
  cCtx.moveTo(4, 4);
  cCtx.lineTo(size - 4, size - 4);
  cCtx.stroke();

  // Corner bolts
  cCtx.fillStyle = '#f59e0b';
  cCtx.fillRect(4, 4, 4, 4);
  cCtx.fillRect(size - 8, 4, 4, 4);
  cCtx.fillRect(4, size - 8, 4, 4);
  cCtx.fillRect(size - 8, size - 8, 4, 4);

  // 5. Glowing Cyan Crystal / Rune Texture
  const crystalCanvas = document.createElement('canvas');
  crystalCanvas.width = size;
  crystalCanvas.height = size;
  const crCtx = crystalCanvas.getContext('2d');
  crCtx.fillStyle = '#0f172a';
  crCtx.fillRect(0, 0, size, size);

  // Neon glowing rune glyph
  crCtx.strokeStyle = '#06b6d4';
  crCtx.lineWidth = 4;
  crCtx.strokeRect(8, 8, size - 16, size - 16);
  crCtx.fillStyle = '#22d3ee';
  crCtx.fillRect(24, 24, 16, 16);

  // 6. Ground Checkerboard Grid Texture
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 128;
  groundCanvas.height = 128;
  const gndCtx = groundCanvas.getContext('2d');
  gndCtx.fillStyle = '#1e293b'; // slate-800
  gndCtx.fillRect(0, 0, 128, 128);
  gndCtx.fillStyle = '#334155'; // slate-700
  gndCtx.fillRect(0, 0, 64, 64);
  gndCtx.fillRect(64, 64, 64, 64);

  // Grid line accents
  gndCtx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
  gndCtx.lineWidth = 2;
  gndCtx.strokeRect(0, 0, 128, 128);

  const groundTexture = createPixelTexture(groundCanvas);
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(24, 24);

  return {
    grassTop: createPixelTexture(grassCanvas),
    dirtSide: createPixelTexture(dirtCanvas),
    stone: createPixelTexture(stoneCanvas),
    crate: createPixelTexture(crateCanvas),
    crystal: createPixelTexture(crystalCanvas),
    ground: groundTexture
  };
}
