const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const messageOverlay = document.getElementById('message-overlay');
const messageText = document.getElementById('message-text');
const subMessageText = document.getElementById('sub-message-text');

let map, pacman, ghosts;
let score = 0;
let level = 1;
let lives = 3;
let gameState = 'START'; // START, PLAYING, LEVEL_CLEAR, GAME_OVER
let lastTime = 0;
let ghostEatenCount = 0;

function initGame() {
    map = new Map();
    pacman = new Pacman(map);
    ghosts = [
        new Ghost(map, pacman, 0), // Blinky
        new Ghost(map, pacman, 1), // Pinky
        new Ghost(map, pacman, 2), // Inky
        new Ghost(map, pacman, 3)  // Clyde
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
    lives--;
    updateUI();
    if (lives <= 0) {
        gameState = 'GAME_OVER';
        showMessage("GAME OVER", "Press ENTER to restart");
    } else {
        // Reset positions
        pacman.reset();
        ghosts.forEach(ghost => ghost.reset());
    }
}

function updateUI() {
    scoreEl.innerText = score;
    levelEl.innerText = level;
    livesEl.innerText = lives;

    // Extra life every 10k points logic can go here if needed (e.g. check score crossing multiple of 10000)
    if (score >= 10000 && score < 10000 + 100) { // Simple one-time check
        // Handled in addScore safely
    }
}

let extraLifeThreshold = 10000;

function addScore(points) {
    score += points;
    if (score >= extraLifeThreshold) {
        lives++;
        extraLifeThreshold += 10000;
        updateUI();
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
    const pBox = { x: pacman.x + 4, y: pacman.y + 4, w: TILE_SIZE - 8, h: TILE_SIZE - 8 };

    ghosts.forEach(ghost => {
        const gBox = { x: ghost.x + 4, y: ghost.y + 4, w: TILE_SIZE - 8, h: TILE_SIZE - 8 };

        // Simple AABB collision
        if (pBox.x < gBox.x + gBox.w &&
            pBox.x + pBox.w > gBox.x &&
            pBox.y < gBox.y + gBox.h &&
            pBox.h + pBox.y > gBox.y) {

            if (ghost.mode === 'scared') {
                // Eat ghost
                ghost.setEaten();
                ghostEatenCount++;
                addScore(Math.pow(2, ghostEatenCount) * 100); // 200, 400, 800, 1600
                // Pause game slightly for impact
                // Handle in render or state machine later if desired
            } else if (ghost.mode === 'scatter' || ghost.mode === 'chase') {
                // Pacman dies
                loseLife();
            } else if (ghost.mode === 'freeze') {
                // Safely pass through frozen ghosts
            }
        }
    });
}

function update() {
    if (gameState !== 'PLAYING') return;

    // Update Pacman
    const result = pacman.update();

    if (result.points > 0) {
        addScore(result.points);
    }

    if (result.powerEvent === 'scare') {
        ghostEatenCount = 0; // Reset consecutive eaten count
        ghosts.forEach(ghost => ghost.setScared());
    } else if (result.powerEvent === 'freeze') {
        ghosts.forEach(ghost => ghost.setFrozen());
    }

    // Check Win condition (No dots left)
    if (map.dotsCount === 0) {
        nextLevel();
        return;
    }

    // Update Ghosts
    ghosts.forEach(ghost => ghost.update());

    handleCollisions();
}

function draw() {
    // Clear screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.draw(ctx);

    // Draw Eaten ghosts first, then others
    ghosts.forEach(ghost => {
        if (ghost.mode === 'eaten') ghost.draw(ctx);
    });

    ghosts.forEach(ghost => {
        if (ghost.mode !== 'eaten') ghost.draw(ctx);
    });

    pacman.draw(ctx);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;

    // Fixed timestep update (approx 60fps)
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
            case 'ArrowUp':
            case 'w':
            case 'W':
                pacman.setDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                pacman.setDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                pacman.setDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                pacman.setDirection(1, 0);
                break;
        }
    });
}