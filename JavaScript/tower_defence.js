const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const startButton = document.getElementById("startButton");
const addTowerButton = document.getElementById("addTower");
const coinDisplay = document.getElementById("coinDisplay");
const gameOverScreen = document.getElementById("gameOverScreen");

let towers = [];
let enemies = [];
let bullets = [];
let coins = 10000;
let wave = 10000;
let gameInterval;
let spawnInterval;
const towerCost = 1000;
const towerSize = 40;
const enemySize = 20;
const bulletSize = 10;

class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 200;
        this.fireRate = 750; // in milliseconds
        this.lastShot = 0;
    }

    draw() {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.arc(this.x + towerSize / 2, this.y + towerSize / 2, towerSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "darkgray";
        ctx.stroke();
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.fireRate) {
            const target = this.findTarget();
            if (target) {
                bullets.push(new Bullet(this.x + towerSize / 2, this.y + towerSize / 2, target));
                this.lastShot = now;
            }
        }
    }

    findTarget() {
        for (let enemy of enemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist <= this.range) {
                return enemy;
            }
        }
        return null;
    }
}

class Enemy {
    constructor(x, y, speed, hp) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.hp = hp;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, enemySize, enemySize);
    }

    move() {
        this.x += this.speed;
        if (this.x > canvas.width) {
            this.hp = 0; // Remove enemy when it reaches the end
            gameOver();
        }
    }
}

class Bullet {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 10;
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, bulletSize, bulletSize);
    }

    move() {
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);

        // Check collision with target
        if (Math.hypot(this.target.x - this.x, this.target.y - this.y) < bulletSize) {
            this.target.hp -= 20;
            return true; // Bullet hit target
        }
        return false; // Bullet didn't hit target yet
    }
}

startButton.addEventListener("click", startGame);
addTowerButton.addEventListener("click", () => {
    if (coins >= towerCost) {
        towers.push(new Tower(Math.random() * (canvas.width - towerSize), Math.random() * (canvas.height - towerSize)));
        coins -= towerCost;
        updateCoinDisplay();
    }
});

function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    if (spawnInterval) clearInterval(spawnInterval);

    towers = [];
    enemies = [];
    bullets = [];
    coins = 10000;
    wave = 10;
    updateCoinDisplay();
    gameOverScreen.style.display = "none";

    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    spawnEnemies();
}

function spawnEnemies() {
    spawnInterval = setInterval(() => {
        const hp = 50 + wave * 10;
        const speed = 1 + wave * 0.1;
        enemies.push(new Enemy(0, Math.random() * (canvas.height - enemySize), speed, hp));
        wave++;
    }, 2000 - wave * 50);
}

function updateCoinDisplay() {
    coinDisplay.textContent = `Münzen: ${coins}`;
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameOverScreen.style.display = "flex";
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and update towers
    for (let tower of towers) {
        tower.draw();
        tower.shoot();
    }

    // Draw and update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].draw();
        if (enemies[i].hp <= 0) {
            enemies.splice(i, 1);
            coins += 500;
            updateCoinDisplay();
        }
    }

    // Draw and update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].move()) {
            bullets.splice(i, 1);
        } else {
            bullets[i].draw();
        }
    }
}
