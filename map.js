const MAP_WIDTH = 28;
const MAP_HEIGHT = 31;
const TILE_SIZE = 20;

const TILE = {
    EMPTY: 0,
    WALL: 1,
    DOT: 2,
    POWER_PILL: 3,
    GHOST_DOOR: 4,
    POWER_SPEED: 5,
    POWER_FREEZE: 6,
    POWER_SHIELD: 7, // New powerup: Invincibility
    POWER_BOMB: 8    // New powerup: Kills all ghosts on screen
};

// Cyberpunk Neon Level Colors
const LEVEL_COLORS = ['#00FFFF', '#FF00FF', '#00FF00', '#FFaa00']; // Cyan, Magenta, Lime, Cyber-Yellow

const levels = [
    // Level 1: Cyber City (Cyan)
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,8,5,2,2,2,2,2,2,2,1,1,2,2,3,1], // Bomb + Speed
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Level 2: Neon Grid (Magenta)
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,7,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,7,1], // Shield
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,6,6,2,2,2,2,2,2,2,1,1,2,2,3,1], // Freeze
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,8,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,8,1], // Bomb
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Level 3: Matrix Core (Lime)
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,8,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,5,1], // Bomb & Speed
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,7,7,2,2,2,2,2,2,2,1,1,2,2,3,1], // Shield
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,8,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
];

class Map {
    constructor() {
        this.tiles = [];
        this.dotsCount = 0;
        this.wallColor = LEVEL_COLORS[0];
        this.glowPulse = 0;
        this.preRenderCanvas = document.createElement('canvas');
        this.preRenderCanvas.width = MAP_WIDTH * TILE_SIZE;
        this.preRenderCanvas.height = MAP_HEIGHT * TILE_SIZE;
        this.preRenderCtx = this.preRenderCanvas.getContext('2d');
        this.init(0);
    }

    init(levelIndex) {
        const rawLevel = levels[levelIndex % levels.length];
        this.wallColor = LEVEL_COLORS[levelIndex % LEVEL_COLORS.length];

        this.tiles = [];
        this.dotsCount = 0;

        // List of all open dot positions where we can spawn powerups
        const possiblePowerupSpawns = [];

        for (let row = 0; row < MAP_HEIGHT; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < MAP_WIDTH; col++) {
                let tileType = TILE.EMPTY;
                if (row < rawLevel.length && col < rawLevel[row].length) {
                    tileType = rawLevel[row][col];
                } else if (row === 0 || row === MAP_HEIGHT - 1 || col === 0 || col === MAP_WIDTH - 1) {
                     tileType = TILE.WALL;
                }

                // Replace any hardcoded powerups in the level maps with normal dots
                if (tileType >= 3) {
                    if (tileType !== TILE.GHOST_DOOR) {
                        tileType = TILE.DOT;
                    }
                }

                this.tiles[row][col] = tileType;

                if (tileType === TILE.DOT) {
                    this.dotsCount++;
                    // Don't spawn powerups directly in the middle area or corners
                    if (row > 4 && row < 26 && col > 2 && col < 25) {
                        possiblePowerupSpawns.push({r: row, c: col});
                    }
                }
            }
        }

        // Randomly assign powerups to empty dot locations
        this.spawnRandomPowerup(TILE.POWER_PILL, 4, possiblePowerupSpawns);
        this.spawnRandomPowerup(TILE.POWER_SPEED, 2, possiblePowerupSpawns);
        this.spawnRandomPowerup(TILE.POWER_FREEZE, 1, possiblePowerupSpawns);
        this.spawnRandomPowerup(TILE.POWER_SHIELD, 1, possiblePowerupSpawns);
        this.spawnRandomPowerup(TILE.POWER_BOMB, 1, possiblePowerupSpawns);

        this.preDrawWalls();
    }

    spawnRandomPowerup(type, count, spawnList) {
        for (let i = 0; i < count; i++) {
            if (spawnList.length === 0) return;
            // Pick a random index
            const index = Math.floor(Math.random() * spawnList.length);
            const pos = spawnList[index];
            // Remove it so we don't pick it again
            spawnList.splice(index, 1);

            // Set the tile to the powerup
            this.tiles[pos.r][pos.c] = type;
        }
    }

    isWall(col, row) {
        if (col < 0 || col >= MAP_WIDTH || row < 0 || row >= MAP_HEIGHT) return false;
        return this.tiles[row][col] === TILE.WALL;
    }

    isGhostDoor(col, row) {
        if (col < 0 || col >= MAP_WIDTH || row < 0 || row >= MAP_HEIGHT) return false;
        return this.tiles[row][col] === TILE.GHOST_DOOR;
    }

    eatDot(col, row) {
        if (col < 0 || col >= MAP_WIDTH || row < 0 || row >= MAP_HEIGHT) return null;
        const tile = this.tiles[row][col];
        if (tile === TILE.DOT || tile === TILE.POWER_PILL || tile >= 5) {
            this.tiles[row][col] = TILE.EMPTY;
            this.dotsCount--;
            return tile;
        }
        return null;
    }

    preDrawWalls() {
        this.preRenderCtx.clearRect(0, 0, this.preRenderCanvas.width, this.preRenderCanvas.height);

        this.preRenderCtx.strokeStyle = this.wallColor;
        this.preRenderCtx.lineWidth = 2;
        this.preRenderCtx.lineCap = 'round';
        this.preRenderCtx.lineJoin = 'round';
        this.preRenderCtx.shadowBlur = 10;
        this.preRenderCtx.shadowColor = this.wallColor;

        for (let row = 0; row < MAP_HEIGHT; row++) {
            for (let col = 0; col < MAP_WIDTH; col++) {
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;
                const tile = this.tiles[row][col];

                if (tile === TILE.WALL) {
                    this.preRenderCtx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    this.preRenderCtx.fillStyle = '#050210';
                    this.preRenderCtx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
                else if (tile === TILE.GHOST_DOOR) {
                    this.preRenderCtx.strokeStyle = '#f0f';
                    this.preRenderCtx.shadowColor = '#f0f';
                    this.preRenderCtx.beginPath();
                    this.preRenderCtx.moveTo(x, y + TILE_SIZE / 2);
                    this.preRenderCtx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
                    this.preRenderCtx.stroke();
                }
            }
        }
        this.preRenderCtx.shadowBlur = 0;
    }

    draw(ctx) {
        this.glowPulse += 0.05;

        // Draw pre-rendered walls fast
        ctx.drawImage(this.preRenderCanvas, 0, 0);

        for (let row = 0; row < MAP_HEIGHT; row++) {
            for (let col = 0; col < MAP_WIDTH; col++) {
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;
                const tile = this.tiles[row][col];

                if (tile === TILE.DOT) {
                    ctx.fillStyle = '#ccffff';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                else if (tile === TILE.POWER_PILL) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ff00ff';
                    ctx.fillStyle = '#ffccff';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6 + Math.sin(this.glowPulse * 2)*2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
                else if (tile === TILE.POWER_SPEED) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ffff00';
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.moveTo(x + TILE_SIZE/2 + 3, y + 4);
                    ctx.lineTo(x + 4, y + TILE_SIZE/2 + 2);
                    ctx.lineTo(x + TILE_SIZE/2 + 2, y + TILE_SIZE/2 + 2);
                    ctx.lineTo(x + TILE_SIZE/2 - 3, y + TILE_SIZE - 4);
                    ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE/2 - 2);
                    ctx.lineTo(x + TILE_SIZE/2 - 2, y + TILE_SIZE/2 - 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
                else if (tile === TILE.POWER_FREEZE) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#00ffff';
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
                    ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    ctx.shadowBlur = 0;
                }
                else if (tile === TILE.POWER_SHIELD) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#00ff00';
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2 - 2, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
                else if (tile === TILE.POWER_BOMB) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ff0000';
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2 + 2, TILE_SIZE/2 - 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.beginPath();
                    ctx.moveTo(x + TILE_SIZE/2, y + 6);
                    ctx.lineTo(x + TILE_SIZE/2 + 4, y + 2);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
        }
    }
}