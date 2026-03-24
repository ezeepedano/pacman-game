class Pacman {
    constructor(map) {
        this.map = map;
        this.x = 14 * TILE_SIZE; // Initial spawn
        this.y = 23 * TILE_SIZE;
        this.col = 14;
        this.row = 23;
        this.speed = 2; // Normal speed
        this.baseSpeed = 2;
        this.speedMultiplier = 1;
        this.vx = 0;
        this.vy = 0;
        this.nextVx = 0;
        this.nextVy = 0;
        this.direction = 0; // 0=Right, 1=Down, 2=Left, 3=Up
        this.frame = 0;
        this.frameCount = 0;
        this.powerMode = false;
        this.powerTimer = 0;
        this.speedTimer = 0;
    }

    reset() {
        this.x = 14 * TILE_SIZE;
        this.y = 23 * TILE_SIZE;
        this.col = 14;
        this.row = 23;
        this.vx = 0;
        this.vy = 0;
        this.nextVx = 0;
        this.nextVy = 0;
        this.direction = 0;
        this.powerMode = false;
        this.powerTimer = 0;
        this.speedMultiplier = 1;
        this.speedTimer = 0;
    }

    setDirection(dx, dy) {
        this.nextVx = dx;
        this.nextVy = dy;
    }

    update() {
        // Handle custom power-ups timers
        if (this.powerMode) {
            this.powerTimer--;
            if (this.powerTimer <= 0) {
                this.powerMode = false;
            }
        }

        if (this.speedMultiplier > 1) {
            this.speedTimer--;
            if (this.speedTimer <= 0) {
                this.speedMultiplier = 1;
            }
        }

        const currentSpeed = this.baseSpeed * this.speedMultiplier;

        // Try to change direction
        if (this.nextVx !== 0 || this.nextVy !== 0) {
            // Check if we can move in the requested direction
            // Allow turning exactly on grid lines or moving in opposite direction
            if ((this.nextVx === -this.vx && this.nextVy === -this.vy) ||
                (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0)) {

                const nextCol = Math.floor(this.x / TILE_SIZE) + this.nextVx;
                const nextRow = Math.floor(this.y / TILE_SIZE) + this.nextVy;

                if (!this.map.isWall(nextCol, nextRow) && !this.map.isGhostDoor(nextCol, nextRow)) {
                    this.vx = this.nextVx;
                    this.vy = this.nextVy;
                    this.nextVx = 0;
                    this.nextVy = 0;

                    if (this.vx > 0) this.direction = 0;
                    else if (this.vy > 0) this.direction = 1;
                    else if (this.vx < 0) this.direction = 2;
                    else if (this.vy < 0) this.direction = 3;
                }
            }
        }

        // Check if current direction is blocked
        if (this.vx !== 0 || this.vy !== 0) {
            if (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0) {
                const nextCol = Math.floor(this.x / TILE_SIZE) + this.vx;
                const nextRow = Math.floor(this.y / TILE_SIZE) + this.vy;

                if (this.map.isWall(nextCol, nextRow) || this.map.isGhostDoor(nextCol, nextRow)) {
                    this.vx = 0;
                    this.vy = 0;
                }
            }
        }

        // Move
        this.x += this.vx * currentSpeed;
        this.y += this.vy * currentSpeed;

        // Tunnel handling
        if (this.x < -TILE_SIZE / 2) {
            this.x = MAP_WIDTH * TILE_SIZE;
        } else if (this.x > MAP_WIDTH * TILE_SIZE) {
            this.x = -TILE_SIZE / 2;
        }

        // Snap to grid for smoother turns when stopping
        if (this.vx === 0 && this.vy === 0) {
            this.x = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
            this.y = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
        }

        // Update logical position
        this.col = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
        this.row = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);

        // Animation
        if (this.vx !== 0 || this.vy !== 0) {
            this.frameCount++;
            if (this.frameCount > 5) {
                this.frame = (this.frame + 1) % 3; // 3 frames: closed, half-open, open
                this.frameCount = 0;
            }
        } else {
            this.frame = 1; // Half-open when stopped
        }

        // Handle Eating
        let points = 0;
        let powerEvent = null;
        if (this.x % TILE_SIZE < TILE_SIZE / 2 && this.y % TILE_SIZE < TILE_SIZE / 2) {
            const tile = this.map.eatDot(this.col, this.row);
            if (tile === TILE.DOT) {
                points = 10;
            } else if (tile === TILE.POWER_PILL) {
                points = 50;
                this.powerMode = true;
                this.powerTimer = 300; // ~5 seconds at 60fps
                powerEvent = 'scare';
            } else if (tile === TILE.POWER_SPEED) {
                points = 100;
                this.speedMultiplier = 2; // Double speed
                this.speedTimer = 300; // 5 seconds
            } else if (tile === TILE.POWER_FREEZE) {
                points = 100;
                powerEvent = 'freeze';
            }
        }

        return { points, powerEvent };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);

        // Rotation based on direction
        const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        ctx.rotate(angles[this.direction]);

        // Draw Pacman using Canvas API
        ctx.fillStyle = 'yellow';
        ctx.beginPath();

        const radius = TILE_SIZE / 2 - 2;
        let startAngle = 0;
        let endAngle = Math.PI * 2;

        if (this.frame === 1) { // Half open
            startAngle = 0.15 * Math.PI;
            endAngle = 1.85 * Math.PI;
        } else if (this.frame === 2) { // Fully open
            startAngle = 0.25 * Math.PI;
            endAngle = 1.75 * Math.PI;
        }

        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();

        // Draw active power aura (Speed)
        if (this.speedMultiplier > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, TILE_SIZE / 2 + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}