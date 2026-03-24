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

        this.x = this.startX;
        this.y = this.startY;
        this.vx = (id === 0) ? -1 : 0;
        this.vy = (id === 0) ? 0 : -1; // Initial movement

        // Base Speed and multipliers
        this.baseSpeed = 1.5;
        this.speed = this.baseSpeed;

        // State management
        this.mode = 'scatter'; // scatter, chase, scared, eaten, freeze
        this.modeTimer = 0;
        this.scaredTimer = 0;
        this.freezeTimer = 0;

        // Level Difficulty scaling
        this.level = 1;
        this.chaseDuration = 1000;
        this.scatterDuration = 400;
        this.speedIncrease = 0;

        // Visuals
        this.wobble = 0;
        this.wobbleSpeed = 0.2;
    }

    setLevelDifficulty(level) {
        this.level = level;

        // Difficulty scaling logic
        // Ghosts get faster and spend more time chasing as levels increase
        this.speedIncrease = (level - 1) * 0.15; // +10% speed per level
        this.baseSpeed = 1.5 + this.speedIncrease;

        this.chaseDuration = 1000 + (level * 200); // Chase longer
        this.scatterDuration = Math.max(100, 400 - (level * 50)); // Scatter less

        this.speed = this.baseSpeed;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
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
            this.scaredTimer = 300 - (this.level * 20); // Less scared time on higher levels
            this.vx *= -1; // Reverse direction when scared
            this.vy *= -1;
            this.speed = this.baseSpeed * 0.5; // Slow down
        }
    }

    setEaten() {
        this.mode = 'eaten';
        this.speed = this.baseSpeed * 2; // Move fast to ghost house
    }

    setFrozen() {
        this.mode = 'freeze';
        this.freezeTimer = 240; // 4 seconds at 60fps
        this.speed = 0; // Stop completely
    }

    getTarget() {
        if (this.mode === 'scatter') {
            return SCATTER_TARGETS[this.id];
        }

        if (this.mode === 'chase') {
            const pacCol = Math.floor(this.pacman.x / TILE_SIZE);
            const pacRow = Math.floor(this.pacman.y / TILE_SIZE);

            // Blinky (Red): Direct chase
            if (this.id === 0) {
                return {x: pacCol, y: pacRow};
            }

            // Pinky (Pink): Ambush (4 tiles ahead of Pacman)
            if (this.id === 1) {
                let targetX = pacCol;
                let targetY = pacRow;

                if (this.pacman.direction === 0) targetX += 4;
                else if (this.pacman.direction === 1) targetY += 4;
                else if (this.pacman.direction === 2) targetX -= 4;
                else if (this.pacman.direction === 3) targetY -= 4;

                return {x: targetX, y: targetY};
            }

            // Inky (Cyan): Flank (Vector between Blinky and 2 tiles ahead of Pacman)
            if (this.id === 2) {
                 // Simplified flanking: Just slightly offset from Pacman based on his direction
                 let targetX = pacCol;
                 let targetY = pacRow;

                 if (this.pacman.direction === 0) targetX -= 2;
                 else if (this.pacman.direction === 1) targetY -= 2;
                 else if (this.pacman.direction === 2) targetX += 2;
                 else if (this.pacman.direction === 3) targetY += 2;

                 return {x: targetX, y: targetY};
            }

            // Clyde (Orange): Flee if too close, otherwise scatter
            if (this.id === 3) {
                const distToPacman = Math.abs(this.x/TILE_SIZE - pacCol) + Math.abs(this.y/TILE_SIZE - pacRow);
                // Brave factor increases with level
                const fleeDistance = Math.max(2, 8 - (this.level - 1));

                if (distToPacman < fleeDistance) {
                    return SCATTER_TARGETS[3]; // Flee to corner
                } else {
                    return {x: pacCol, y: pacRow}; // Chase
                }
            }
        }

        // Default or Eaten target (Ghost House)
        if (this.mode === 'eaten') {
            return {x: 13, y: 11}; // Ghost House entrance
        }

        // Scared mode target is random, handled in logic
        return {x: Math.floor(Math.random() * MAP_WIDTH), y: Math.floor(Math.random() * MAP_HEIGHT)};
    }

    update() {
        // Handle Timers and State Transitions
        if (this.mode === 'freeze') {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) {
                this.mode = 'scatter'; // Revert back safely
                this.speed = this.baseSpeed;
            } else {
                return; // Do not move
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

        // Movement Logic (Intersection Decision Making)
        // Ghosts only make decisions when perfectly aligned with the grid
        const isAligned = (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0);

        if (isAligned) {
            const currentCol = Math.floor(this.x / TILE_SIZE);
            const currentRow = Math.floor(this.y / TILE_SIZE);

            // Eaten logic: Check if reached ghost house
            if (this.mode === 'eaten' && Math.abs(currentCol - 13) <= 1 && Math.abs(currentRow - 11) <= 1) {
                this.mode = 'scatter';
                this.speed = this.baseSpeed;
            }

            // Get target tile
            const target = this.getTarget();

            // Possible directions
            const directions = [
                {dx: 0, dy: -1}, // Up
                {dx: -1, dy: 0}, // Left
                {dx: 0, dy: 1},  // Down
                {dx: 1, dy: 0}   // Right
            ];

            let bestDist = Infinity;
            let bestDir = null;

            // Ghosts cannot reverse direction unless forced (scared mode transition handles this)
            const reverseVx = -this.vx;
            const reverseVy = -this.vy;

            for (const dir of directions) {
                // Prevent reversing direction
                if (dir.dx === reverseVx && dir.dy === reverseVy && (this.vx !== 0 || this.vy !== 0)) {
                    continue;
                }

                const nextCol = currentCol + dir.dx;
                const nextRow = currentRow + dir.dy;

                // Check walls. Eaten ghosts can pass the ghost door.
                const isWall = this.map.isWall(nextCol, nextRow);
                const isDoor = this.map.isGhostDoor(nextCol, nextRow);

                let canMove = false;
                if (!isWall) {
                     if (!isDoor) canMove = true;
                     else if (this.mode === 'eaten') canMove = true; // Only eaten ghosts can enter door
                     else if (currentRow >= 13 && currentRow <= 15) canMove = true; // Let them out of house
                }

                if (canMove) {
                    // Scared ghosts move randomly at intersections
                    if (this.mode === 'scared') {
                        // Just pick any valid direction
                        bestDir = dir;
                        // Keep iterating to potentially pick another, effectively randomizing slightly
                        if (Math.random() > 0.5) break;
                    } else {
                        // Calculate Euclidean distance to target
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
            }
        }

        // Apply movement
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

        // Tunnel handling
        if (this.x < -TILE_SIZE) {
            this.x = MAP_WIDTH * TILE_SIZE;
        } else if (this.x > MAP_WIDTH * TILE_SIZE) {
            this.x = -TILE_SIZE;
        }

        // Update animation
        this.wobble += this.wobbleSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);

        // Fallback drawing API (Classic Canvas Look)
        const radius = TILE_SIZE / 2 - 2;

        if (this.mode === 'eaten') {
            // Draw Eyes only
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-4, -2, 3, 0, Math.PI * 2);
            ctx.arc(4, -2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'blue';
            ctx.beginPath();
            const eyeLookX = this.vx * 1.5;
            const eyeLookY = this.vy * 1.5;
            ctx.arc(-4 + eyeLookX, -2 + eyeLookY, 1, 0, Math.PI * 2);
            ctx.arc(4 + eyeLookX, -2 + eyeLookY, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        // Body Color
        let currentColor = this.color;

        if (this.mode === 'scared') {
            // Flash white when timer is running out
            if (this.scaredTimer < 60 && Math.floor(this.scaredTimer / 10) % 2 === 0) {
                currentColor = 'white';
            } else {
                currentColor = '#0000FF'; // Scared Blue
            }
        } else if (this.mode === 'freeze') {
            currentColor = '#00FFFF'; // Cyan freeze block
        }

        // Draw Freeze Block
        if (this.mode === 'freeze') {
             ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'; // Ice cube
             ctx.fillRect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
        }

        // Draw Ghost Body
        ctx.fillStyle = currentColor;
        ctx.beginPath();

        // Head
        ctx.arc(0, 0, radius, Math.PI, 0);

        // Body and skirt
        ctx.lineTo(radius, radius);

        // Wavy bottom
        const waveHeight = Math.sin(this.wobble) * 2;
        ctx.lineTo(radius / 2, radius - waveHeight);
        ctx.lineTo(0, radius + waveHeight);
        ctx.lineTo(-radius / 2, radius - waveHeight);
        ctx.lineTo(-radius, radius);

        ctx.closePath();
        ctx.fill();

        // Eyes (if not scared)
        if (this.mode !== 'scared' && this.mode !== 'freeze') {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'blue';
            ctx.beginPath();
            const eyeLookX = this.vx * 1.5;
            const eyeLookY = this.vy * 1.5;
            ctx.arc(-3 + eyeLookX, -2 + eyeLookY, 1, 0, Math.PI * 2);
            ctx.arc(3 + eyeLookX, -2 + eyeLookY, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.mode === 'scared') {
            // Scared Face (Squiggly mouth)
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-4, 4);
            ctx.lineTo(-2, 2);
            ctx.lineTo(0, 4);
            ctx.lineTo(2, 2);
            ctx.lineTo(4, 4);
            ctx.stroke();

            // Scared Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-3, -2, 1, 0, Math.PI * 2);
            ctx.arc(3, -2, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}