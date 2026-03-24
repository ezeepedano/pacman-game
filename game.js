const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const energyEl = document.getElementById('energy');
const messageOverlay = document.getElementById('message-overlay');
const messageText = document.getElementById('message-text');
const subMessageText = document.getElementById('sub-message-text');

let map, pacman, ghosts;
let score = 0;
let level = 1;
let lives = 3;
let gameState = 'START';
let lastTime = 0;
let ghostEatenCount = 0;
let extraLifeThreshold = 10000;

function initGame() {
    map = new Map();
    pacman = new Pacman(map);
    ghosts = [
        new Ghost(map, pacman, 0),
        new Ghost(map, pacman, 1),
        new Ghost(map, pacman, 2),
        new Ghost(map, pacman, 3)
    ];

    setupInput();
    resetLevel();
    requestAnimationFrame(gameLoop);
}

// Start game immediately
initGame();

function resetLevel() {
    map.init(level - 1);
    pacman.reset();
    ghosts.forEach(ghost => {
        ghost.setLevelDifficulty(level);
        ghost.reset();
    });
    particles = []; // Clear particles
    gameState = 'PLAYING';
    updateUI();
}

function nextLevel() {
    level++;
    gameState = 'LEVEL_CLEAR';
    setTimeout(() => {
        resetLevel();
    }, 2000);
}

function loseLife() {
    if (pacman.isInvincible) return; // Shield protects

    lives--;
    explode(pacman.x + TILE_SIZE/2, pacman.y + TILE_SIZE/2, '#ffcc00'); // Pacman explode
    updateUI();

    if (lives <= 0) {
        gameState = 'GAME_OVER';
        showMessage("SYSTEM FAILURE", "INITIATE REBOOT [ENTER]");
    } else {
        gameState = 'DEATH_ANIM';
        setTimeout(() => {
            pacman.reset();
            ghosts.forEach(ghost => ghost.reset());
            gameState = 'PLAYING';
        }, 1500);
    }
}

function updateUI() {
    scoreEl.innerText = score.toString().padStart(6, '0');
    levelEl.innerText = level;

    // Cyberpunk Life Bar
    let lifeBar = "";
    for(let i=0; i<lives; i++) lifeBar += "██ ";
    livesEl.innerText = lifeBar.trim();

    // Weapon Energy %
    energyEl.innerText = Math.floor(pacman.energy) + "%";
    if (pacman.energy >= pacman.laserCost) {
        energyEl.className = "neon-text-green";
    } else {
        energyEl.className = "neon-text-red";
    }
}

function addScore(points) {
    score += points;
    if (score >= extraLifeThreshold) {
        lives++;
        extraLifeThreshold += 10000;
        showMessage("LIFE +1", "SYSTEM INTEGRITY RESTORED");
        setTimeout(hideMessage, 1500);
    }
    updateUI();
}

function showMessage(main, sub) {
    messageText.innerText = main;
    subMessageText.innerText = sub;
    messageOverlay.classList.remove('hidden');
}

function hideMessage() {
    messageOverlay.classList.add('hidden');
}

function handleCollisions() {
    // 1. Pacman to Ghost Collision
    const pBox = { x: pacman.x + 4, y: pacman.y + 4, w: TILE_SIZE - 8, h: TILE_SIZE - 8 };

    ghosts.forEach(ghost => {
        if (ghost.mode === 'eaten') return; // Can't touch eaten ghosts

        const gBox = { x: ghost.x + 4, y: ghost.y + 4, w: TILE_SIZE - 8, h: TILE_SIZE - 8 };

        if (pBox.x < gBox.x + gBox.w && pBox.x + pBox.w > gBox.x && pBox.y < gBox.y + gBox.h && pBox.h + pBox.y > gBox.y) {

            if (ghost.mode === 'scared') {
                ghost.setEaten();
                ghostEatenCount++;
                addScore(Math.pow(2, ghostEatenCount) * 100);
            } else if (ghost.mode === 'scatter' || ghost.mode === 'chase') {
                if (!pacman.isInvincible) loseLife();
                else ghost.setEaten(); // Shield kills ghost instantly
            } else if (ghost.mode === 'freeze') {
                // Safely pass through
            }
        }

        // 2. Laser to Ghost Collision
        pacman.lasers.forEach(laser => {
            if (!laser.active) return;
            const lBox = { x: laser.x - 2, y: laser.y - 2, w: 4, h: 4 };

            if (lBox.x < gBox.x + gBox.w && lBox.x + lBox.w > gBox.x && lBox.y < gBox.y + gBox.h && lBox.h + lBox.y > gBox.y) {
                laser.active = false;
                ghost.setEaten();
                addScore(200); // Flat laser kill score
            }
        });
    });
}

function triggerBomb() {
    // Kills all active ghosts on screen
    // Flash screen effect
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    ghosts.forEach(ghost => {
        if (ghost.mode !== 'eaten') {
            ghost.setEaten();
            addScore(200);
        }
    });
}

function update() {
    if (gameState !== 'PLAYING') return;

    const result = pacman.update();

    if (result.points > 0) addScore(result.points);

    if (result.powerEvent === 'scare') {
        ghostEatenCount = 0;
        ghosts.forEach(ghost => ghost.setScared());
    } else if (result.powerEvent === 'freeze') {
        ghosts.forEach(ghost => ghost.setFrozen());
    } else if (result.powerEvent === 'bomb') {
        triggerBomb();
    }

    if (map.dotsCount === 0) {
        nextLevel();
        return;
    }

    ghosts.forEach(ghost => ghost.update());
    handleCollisions();

    // Update UI constantly for energy bar
    if(Math.random() < 0.1) updateUI();
}

function draw() {
    // Clear screen with slight trail effect (cyberpunk CRT burn-in)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.draw(ctx);

    if (gameState !== 'DEATH_ANIM') {
        ghosts.forEach(g => { if (g.mode === 'eaten') g.draw(ctx); });
        ghosts.forEach(g => { if (g.mode !== 'eaten') g.draw(ctx); });
        pacman.draw(ctx);
    }

    updateAndDrawParticles(ctx);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;

    // Fixed timestep 60fps
    if (deltaTime >= 16) {
        update();
        draw();
        lastTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (gameState === 'GAME_OVER' && e.key === 'Enter') {
            score = 0;
            level = 1;
            lives = 3;
            extraLifeThreshold = 10000;
            hideMessage();
            resetLevel();
            return;
        }

        if (gameState !== 'PLAYING') return;

        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W':
                pacman.setDirection(0, -1); break;
            case 'ArrowDown': case 's': case 'S':
                pacman.setDirection(0, 1); break;
            case 'ArrowLeft': case 'a': case 'A':
                pacman.setDirection(-1, 0); break;
            case 'ArrowRight': case 'd': case 'D':
                pacman.setDirection(1, 0); break;
            case ' ': // Spacebar
                if (pacman.shootLaser()) {
                    updateUI(); // Immediate UI update for energy drain
                }
                break;
        }
    });
}