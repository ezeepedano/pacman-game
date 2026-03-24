const GHOST_NAMES = ['Blinky', 'Pinky', 'Inky', 'Clyde'];
const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];

// Start positions for ghosts in the ghost house
const START_POSITIONS = [
    {x: 13.5, y: 11}, // Blinky (Outside)
    {x: 13.5, y: 14}, // Pinky (Inside Center)
    {x: 11.5, y: 14}, // Inky (Inside Left)
    {x: 15.5, y: 14}  // Clyde (Inside Right)
];

// Scatter targets for each ghost (Corners)
const SCATTER_TARGETS = [
    {x: 25, y: -2},  // Blinky (Top Right)
    {x: 2, y: -2},   // Pinky (Top Left)
    {x: 27, y: 31},  // Inky (Bottom Right)
    {x: 0, y: 31}    // Clyde (Bottom Left)
];

class Ghost {
    constructor(map, pacman, id) {
        this.map = map;
        this.pacman = pacman;
        this.id = id; // 0=Blinky, 1=Pinky, 2=Inky, 3=Clyde
        this.name = GHOST_NAMES[id];
        this.color = GHOST_COLORS[id];

        this.startX = START_POSITIONS[id].x * TILE_SIZE;
        this.startY = START_POSITIONS[id].y * TILE_SIZE;

        // Target Based Movement to fix grid alignment bugs
        this.x = this.startX;
        this.y = this.startY;
        this.targetX = this.x;
        this.targetY = this.y;
        this.isMovingToTarget = false;

        this.vx = (id === 0) ? -1 : 0;
        this.vy = (id === 0) ? 0 : -1;

        this.baseSpeed = 1.0; // Needs to divide evenly into TILE_SIZE (20)
        this.speed = this.baseSpeed;

        // State
        this.mode = 'scatter';
        this.modeTimer = 0;
        this.scaredTimer = 0;
        this.freezeTimer = 0;

        this.level = 1;
        this.chaseDuration = 1000;
        this.scatterDuration = 400;

        this.wobble = 0;
        this.wobbleSpeed = 0.2;
    }

    setLevelDifficulty(level) {
        this.level = level;
        // Cyber-Speed increase
        let speedMult = 1.0 + (level * 0.2); // Base + 20% per level
        this.baseSpeed = 1.0 * speedMult;
        // Cap speed so it divides into 20 evenly (1, 1.25, 2, 2.5, 4, 5)
        if (this.baseSpeed > 1 && this.baseSpeed < 1.25) this.baseSpeed = 1.25;
        if (this.baseSpeed > 1.25 && this.baseSpeed < 2) this.baseSpeed = 2.0;
        if (this.baseSpeed > 2 && this.baseSpeed < 2.5) this.baseSpeed = 2.5;

        this.chaseDuration = 1000 + (level * 300); // Chase longer
        this.scatterDuration = Math.max(50, 400 - (level * 80)); // Scatter less
        this.speed = this.baseSpeed;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.targetX = this.x;
        this.targetY = this.y;
        this.isMovingToTarget = false;

        this.vx = (this.id === 0) ? -1 : 0;
        this.vy = (this.id === 0) ? 0 : -1;

        this.mode = 'scatter';
        this.modeTimer = this.scatterDuration;
        this.scaredTimer = 0;
        this.freezeTimer = 0;
        this.speed = this.baseSpeed;
    }

    setScared() {
        if (this.mode !== 'eaten') {
            this.mode = 'scared';
            this.scaredTimer = 300 - (this.level * 15);
            // Reversing logic handled when reaching next tile center
            this.speed = this.baseSpeed * 0.5; // Slow down
        }
    }

    setEaten() {
        this.mode = 'eaten';
        this.speed = this.baseSpeed * 4; // Move ultra fast to ghost house
        // Snap to grid to prevent collision desync
        this.targetX = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
        this.targetY = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
        explode(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, this.color); // Death explosion
    }

    setFrozen() {
        this.mode = 'freeze';
        this.freezeTimer = 300; // 5 seconds
        this.speed = 0;
    }

    getTarget() {
        if (this.mode === 'eaten') {
            return {x: 13, y: 11}; // Ghost House
        }

        if (this.mode === 'scatter') {
            return SCATTER_TARGETS[this.id];
        }

        if (this.mode === 'chase') {
            const pacCol = Math.floor(this.pacman.x / TILE_SIZE);
            const pacRow = Math.floor(this.pacman.y / TILE_SIZE);

            if (this.id === 0) { // Blinky - Perfect Tracking
                return {x: pacCol, y: pacRow};
            }
            if (this.id === 1) { // Pinky - Ambush
                let targetX = pacCol;
                let targetY = pacRow;
                if (this.pacman.direction === 0) targetX += 4;
                else if (this.pacman.direction === 1) targetY += 4;
                else if (this.pacman.direction === 2) targetX -= 4;
                else if (this.pacman.direction === 3) targetY -= 4;
                return {x: targetX, y: targetY};
            }
            if (this.id === 2) { // Inky - Flank
                 let targetX = pacCol;
                 let targetY = pacRow;
                 if (this.pacman.direction === 0) targetX -= 2;
                 else if (this.pacman.direction === 1) targetY -= 2;
                 else if (this.pacman.direction === 2) targetX += 2;
                 else if (this.pacman.direction === 3) targetY += 2;
                 return {x: targetX, y: targetY};
            }
            if (this.id === 3) { // Clyde - Flee if close
                const dist = Math.abs(this.x/TILE_SIZE - pacCol) + Math.abs(this.y/TILE_SIZE - pacRow);
                const fleeDist = Math.max(2, 8 - (this.level - 1));
                if (dist < fleeDist) return SCATTER_TARGETS[3];
                return {x: pacCol, y: pacRow};
            }
        }
        return {x: Math.floor(Math.random() * MAP_WIDTH), y: Math.floor(Math.random() * MAP_HEIGHT)};
    }

    update() {
        // Timers
        if (this.mode === 'freeze') {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) {
                this.mode = 'scatter';
                this.speed = this.baseSpeed;
            } else {
                return;
            }
        }

        if (this.mode === 'scared') {
            this.scaredTimer--;
            if (this.scaredTimer <= 0) {
                this.mode = 'chase';
                this.speed = this.baseSpeed;
            }
        } else if (this.mode === 'scatter') {
            this.modeTimer--;
            if (this.modeTimer <= 0) {
                this.mode = 'chase';
                this.modeTimer = this.chaseDuration;
            }
        } else if (this.mode === 'chase') {
            this.modeTimer--;
            if (this.modeTimer <= 0) {
                this.mode = 'scatter';
                this.modeTimer = this.scatterDuration;
            }
        }

        // --- Target-Based Grid Movement Engine ---
        if (this.x === this.targetX && this.y === this.targetY) {
            this.isMovingToTarget = false;
        }

        if (!this.isMovingToTarget) {
            const currentCol = Math.floor(this.x / TILE_SIZE);
            const currentRow = Math.floor(this.y / TILE_SIZE);

            // House Exit Logic
            if (this.mode === 'eaten' && Math.abs(currentCol - 13) <= 1 && Math.abs(currentRow - 11) <= 1) {
                this.mode = 'scatter';
                this.speed = this.baseSpeed;
            }
            if (currentRow >= 13 && currentRow <= 15 && this.mode !== 'eaten') {
                // Force exit
                this.targetX = 13.5 * TILE_SIZE;
                this.targetY = 11 * TILE_SIZE;
                this.isMovingToTarget = true;
                // Pre-calculate velocities
                this.vx = Math.sign(this.targetX - this.x);
                this.vy = Math.sign(this.targetY - this.y);
            } else {
                // Normal intersection logic
                const target = this.getTarget();
                const directions = [
                    {dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 1, dy: 0}
                ];

                let bestDist = Infinity;
                let bestDir = null;

                const reverseVx = -this.vx;
                const reverseVy = -this.vy;

                for (const dir of directions) {
                    if (dir.dx === reverseVx && dir.dy === reverseVy && (this.vx !== 0 || this.vy !== 0)) continue;

                    const nextCol = currentCol + dir.dx;
                    const nextRow = currentRow + dir.dy;

                    const isWall = this.map.isWall(nextCol, nextRow);
                    const isDoor = this.map.isGhostDoor(nextCol, nextRow);

                    let canMove = false;

                    // Cyber-Wraith mode: They don't respect walls, they phase right through them.
                    // But they still can't enter the ghost door unless eaten to avoid getting stuck inside.
                    if (this.mode === 'eaten') {
                         canMove = (!isWall && !isDoor) || isDoor;
                    } else {
                         // Intelligent & Relentless: Ignore walls entirely to chase the player
                         if (!isDoor) canMove = true;
                    }

                    if (canMove) {
                        if (this.mode === 'scared') {
                            // When scared, try to move away or randomly, but they still phase through walls
                            bestDir = dir;
                            if (Math.random() > 0.5) break;
                        } else {
                            // True pathfinding distance ignoring walls entirely
                            const dist = Math.sqrt(Math.pow(nextCol - target.x, 2) + Math.pow(nextRow - target.y, 2));
                            if (dist < bestDist) {
                                bestDist = dist;
                                bestDir = dir;
                            }
                        }
                    }
                }

                if (bestDir) {
                    this.vx = bestDir.dx;
                    this.vy = bestDir.dy;
                    this.targetX = this.x + (this.vx * TILE_SIZE);
                    this.targetY = this.y + (this.vy * TILE_SIZE);
                    this.isMovingToTarget = true;
                }
            }
        }

        // Apply movement towards target
        if (this.isMovingToTarget) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;

            const moveX = Math.sign(dx) * Math.min(Math.abs(dx), this.speed);
            const moveY = Math.sign(dy) * Math.min(Math.abs(dy), this.speed);

            this.x += moveX;
            this.y += moveY;

            // Cyber Particles
            if (this.mode !== 'eaten' && Math.random() < 0.1) {
                createParticle(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, this.color, 1, 0.2);
            }

            // Tunnel
            if (this.x < -TILE_SIZE) {
                this.x = MAP_WIDTH * TILE_SIZE;
                this.targetX = this.x;
            } else if (this.x > MAP_WIDTH * TILE_SIZE) {
                this.x = -TILE_SIZE;
                this.targetX = this.x;
            }
        }

        this.wobble += this.wobbleSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);

        const radius = TILE_SIZE / 2 - 2;

        if (this.mode === 'eaten') {
            // Glitched Data Eyes
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'blue';
            ctx.fillStyle = '#0ff';
            ctx.fillText("01", -8, 4);
            ctx.restore();
            return;
        }

        let currentColor = this.color;

        if (this.mode === 'scared') {
            if (this.scaredTimer < 60 && Math.floor(this.scaredTimer / 10) % 2 === 0) currentColor = '#fff';
            else currentColor = '#0000FF';
        } else if (this.mode === 'freeze') {
            currentColor = '#00FFFF';
        }

        if (this.mode === 'freeze') {
             ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
             ctx.strokeStyle = '#0ff';
             ctx.lineWidth = 1;
             ctx.strokeRect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
             ctx.fillRect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
        }

        // Check if wall-phasing
        const currentCol = Math.floor(this.x / TILE_SIZE);
        const currentRow = Math.floor(this.y / TILE_SIZE);
        const isPhasing = this.mode !== 'eaten' && this.map.isWall(currentCol, currentRow);

        // Cyber Body (Neon Fill & Stroke)
        ctx.shadowBlur = 15;
        ctx.shadowColor = currentColor;
        ctx.fillStyle = currentColor;
        ctx.globalAlpha = isPhasing ? 0.4 : 1.0; // Phase effect

        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI, 0);
        ctx.lineTo(radius, radius);

        const waveHeight = Math.sin(this.wobble) * 2;
        ctx.lineTo(radius / 2, radius - waveHeight);
        ctx.lineTo(0, radius + waveHeight);
        ctx.lineTo(-radius / 2, radius - waveHeight);
        ctx.lineTo(-radius, radius);

        ctx.closePath();
        ctx.fill();

        // Wireframe stroke overlay
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (this.mode !== 'scared' && this.mode !== 'freeze') {
            // Cyber Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f0f'; // Neon magenta pupil
            ctx.shadowColor = '#f0f';
            ctx.beginPath();
            const eyeLookX = this.vx * 1.5;
            const eyeLookY = this.vy * 1.5;
            ctx.arc(-3 + eyeLookX, -2 + eyeLookY, 1, 0, Math.PI * 2);
            ctx.arc(3 + eyeLookX, -2 + eyeLookY, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.mode === 'scared') {
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-4, 4); ctx.lineTo(-2, 2); ctx.lineTo(0, 4); ctx.lineTo(2, 2); ctx.lineTo(4, 4);
            ctx.stroke();
        }

        ctx.restore();
    }
}