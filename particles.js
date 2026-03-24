class Particle {
    constructor(x, y, color, size, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size * Math.random() + 1;
        this.vx = (Math.random() - 0.5) * speed * 2;
        this.vy = (Math.random() - 0.5) * speed * 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }
}

let particles = [];

function createParticle(x, y, color, size, speed) {
    particles.push(new Particle(x, y, color, size, speed));
}

function updateAndDrawParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function shakeScreen() {
    const container = document.getElementById('game-container');
    if (container) {
        container.classList.remove('shake');
        void container.offsetWidth; // trigger reflow
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 200);
    }
}

function explode(x, y, color) {
    shakeScreen();
    for (let i = 0; i < 40; i++) {
        createParticle(x, y, color, 4, 6);
        createParticle(x, y, '#ffffff', 3, 7); // White core flash
    }
}