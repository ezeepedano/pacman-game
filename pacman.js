class Pacman {
    constructor(map) {
        this.map = map;
        this.reset();
        this.frame = 0;
        this.frameCount = 0;

        // Laser System
        this.lasers = [];
        this.energy = 100; // % for laser
        this.maxEnergy = 100;
        this.energyRechargeRate = 0.5; // per frame
        this.laserCost = 30; // Cost per shot
    }

    reset() {
        this.x = 14 * TILE_SIZE;
        this.y = 23 * TILE_SIZE;
        this.col = 14;
        this.row = 23;

        this.baseSpeed = 2; // Needs to divide evenly into TILE_SIZE (20)
        this.speedMultiplier = 1;

        this.vx = 0;
        this.vy = 0;
        this.nextVx = 0;
        this.nextVy = 0;
        this.direction = 0; // 0=Right, 1=Down, 2=Left, 3=Up

        // Target-based movement variables to prevent misalignment
        this.targetX = this.x;
        this.targetY = this.y;
        this.isMovingToTarget = false;

        this.powerMode = false;
        this.powerTimer = 0;
        this.speedTimer = 0;
        this.shieldTimer = 0;
        this.isInvincible = false;

        this.energy = 100;
        this.lasers = [];
    }

    setDirection(dx, dy) {
        this.nextVx = dx;
        this.nextVy = dy;
    }

    shootLaser() {
        if (this.energy >= this.laserCost) {
            this.energy -= this.laserCost;
            const laser = {
                x: this.x + TILE_SIZE/2,
                y: this.y + TILE_SIZE/2,
                vx: (this.direction === 0 ? 1 : this.direction === 2 ? -1 : 0) * 8, // Fast projectile
                vy: (this.direction === 1 ? 1 : this.direction === 3 ? -1 : 0) * 8,
                active: true,
                color: '#0ff'
            };
            this.lasers.push(laser);
            return true;
        }
        return false;
    }

    update() {
        // Timers
        if (this.powerMode) {
            this.powerTimer--;
            if (this.powerTimer <= 0) this.powerMode = false;
        }

        if (this.speedMultiplier > 1) {
            this.speedTimer--;
            if (this.speedTimer <= 0) this.speedMultiplier = 1;
        }

        if (this.shieldTimer > 0) {
            this.shieldTimer--;
            this.isInvincible = true;
        } else {
            this.isInvincible = false;
        }

        // Recharge weapon energy
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyRechargeRate);
        }

        // --- Target-Based Grid Movement ---
        const currentSpeed = this.baseSpeed * this.speedMultiplier;

        // If we reached our target, stop and pick next target
        if (this.x === this.targetX && this.y === this.targetY) {
            this.isMovingToTarget = false;
            this.col = Math.floor(this.x / TILE_SIZE);
            this.row = Math.floor(this.y / TILE_SIZE);
        }

        if (!this.isMovingToTarget) {
            // Can we apply the NEXT requested direction?
            if (this.nextVx !== 0 || this.nextVy !== 0) {
                const checkCol = this.col + this.nextVx;
                const checkRow = this.row + this.nextVy;

                if (!this.map.isWall(checkCol, checkRow) && !this.map.isGhostDoor(checkCol, checkRow)) {
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

            // Are we blocked in our current direction?
            if (this.vx !== 0 || this.vy !== 0) {
                const checkCol = this.col + this.vx;
                const checkRow = this.row + this.vy;

                if (this.map.isWall(checkCol, checkRow) || this.map.isGhostDoor(checkCol, checkRow)) {
                    this.vx = 0;
                    this.vy = 0;
                } else {
                    // Set new target tile
                    this.targetX = checkCol * TILE_SIZE;
                    this.targetY = checkRow * TILE_SIZE;
                    this.isMovingToTarget = true;
                }
            }
        }

        // Move towards target
        if (this.isMovingToTarget) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;

            // Move by currentSpeed or exactly the distance remaining (prevent overshooting)
            const moveX = Math.sign(dx) * Math.min(Math.abs(dx), currentSpeed);
            const moveY = Math.sign(dy) * Math.min(Math.abs(dy), currentSpeed);

            this.x += moveX;
            this.y += moveY;

            // Generate glowing particle trail while moving
            if (Math.random() < 0.3) {
                createParticle(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, '#0ff', 1, 0.5);
            }

            // Tunnel Handling
            if (this.x < -TILE_SIZE) {
                this.x = MAP_WIDTH * TILE_SIZE;
                this.targetX = this.x; // reset target
            } else if (this.x > MAP_WIDTH * TILE_SIZE) {
                this.x = -TILE_SIZE;
                this.targetX = this.x;
            }
        }

        // Animation
        if (this.vx !== 0 || this.vy !== 0) {
            this.frameCount++;
            if (this.frameCount > 5) {
                this.frame = (this.frame + 1) % 3;
                this.frameCount = 0;
            }
        } else {
            this.frame = 1;
        }

        // Handle Eating
        let points = 0;
        let powerEvent = null;

        // Eat dot anytime we are over the tile, making gameplay feel much faster
        const eatCol = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
        const eatRow = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);

        const tile = this.map.eatDot(eatCol, eatRow);
        if (tile === TILE.DOT) {
            points = 10;
        } else if (tile === TILE.POWER_PILL) {
            points = 50;
            this.powerMode = true;
            this.powerTimer = 300;
            powerEvent = 'scare';
        } else if (tile === TILE.POWER_SPEED) {
            points = 100;
            this.speedMultiplier = 2;
            this.speedTimer = 300;
        } else if (tile === TILE.POWER_FREEZE) {
            points = 100;
            powerEvent = 'freeze';
        } else if (tile === TILE.POWER_SHIELD) {
            points = 200;
            this.shieldTimer = 400;
        } else if (tile === TILE.POWER_BOMB) {
            points = 500;
            powerEvent = 'bomb';
        }

        // Update Lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            let l = this.lasers[i];
            l.x += l.vx;
            l.y += l.vy;

            // Wall collision for lasers
            let lCol = Math.floor(l.x / TILE_SIZE);
            let lRow = Math.floor(l.y / TILE_SIZE);
            if (this.map.isWall(lCol, lRow) || l.x < 0 || l.x > MAP_WIDTH * TILE_SIZE) {
                l.active = false;
                // Laser spark
                for(let s=0; s<5; s++) createParticle(l.x, l.y, '#0ff', 2, 2);
            }

            if (!l.active) {
                this.lasers.splice(i, 1);
            }
        }

        return { points, powerEvent };
    }

    draw(ctx) {
        ctx.save();

        // Draw Lasers
        this.lasers.forEach(l => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = l.color;
            ctx.fillStyle = '#fff';
            ctx.fillRect(l.x - 2, l.y - 2, 4, 4);
        });

        // Translate and draw PACMAN
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);

        // Rotation based on direction
        const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        ctx.rotate(angles[this.direction]);

        // Draw Pacman using Cyber Canvas API
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffff00';
        ctx.fillStyle = '#ffcc00';
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

        // Draw Cyber Eye
        ctx.rotate(-angles[this.direction]); // Unrotate for eye
        ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.beginPath();
        if (this.direction === 0) ctx.arc(2, -4, 2, 0, Math.PI*2); // R
        if (this.direction === 2) ctx.arc(-2, -4, 2, 0, Math.PI*2); // L
        if (this.direction === 1) ctx.arc(-4, 2, 2, 0, Math.PI*2); // D
        if (this.direction === 3) ctx.arc(4, -2, 2, 0, Math.PI*2); // U
        ctx.fill();

        ctx.restore();

        // Draw active power auras (Speed)
        if (this.speedMultiplier > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'yellow';
            ctx.beginPath();
            ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, TILE_SIZE / 2 + 2 + Math.random()*2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw Shield Aura (Invincibility)
        if (this.isInvincible) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'lime';
            ctx.setLineDash([5, 5]); // Cyber hex-like dash
            ctx.beginPath();
            ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, TILE_SIZE / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
        }
    }
}