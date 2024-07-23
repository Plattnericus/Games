const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");

const box = 20;
let canvasSize = 400;
canvas.width = canvasSize;
canvas.height = canvasSize;

let snake;
let direction;
let food;
let score;
let game;

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
document.addEventListener("keydown", changeDirection);
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);

let xDown = null;
let yDown = null;

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';

    snake = [{ x: 9 * box, y: 9 * box }];
    direction = "RIGHT";
    score = 0;
    food = {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box,
    };

    if (game) clearInterval(game);
    game = setInterval(draw, 100);
}

function changeDirection(event) {
    if (event.keyCode == 37 && direction != "RIGHT") {
        direction = "LEFT";
    } else if (event.keyCode == 38 && direction != "DOWN") {
        direction = "UP";
    } else if (event.keyCode == 39 && direction != "LEFT") {
        direction = "RIGHT";
    } else if (event.keyCode == 40 && direction != "UP") {
        direction = "DOWN";
    }
}

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) return;

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && direction != "RIGHT") {
            direction = "LEFT";
        } else if (xDiff < 0 && direction != "LEFT") {
            direction = "RIGHT";
        }
    } else {
        if (yDiff > 0 && direction != "DOWN") {
            direction = "UP";
        } else if (yDiff < 0 && direction != "UP") {
            direction = "DOWN";
        }
    }

    xDown = null;
    yDown = null;
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }
    
    // Draw food
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Old head position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Which direction
    if (direction == "LEFT") snakeX -= box;
    if (direction == "UP") snakeY -= box;
    if (direction == "RIGHT") snakeX += box;
    if (direction == "DOWN") snakeY += box;

    // If the snake eats the food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box,
        };
    } else {
        // Remove the tail
        snake.pop();
    }

    // Add new head
    let newHead = {
        x: snakeX,
        y: snakeY
    };

    // Game over
    if (snakeX < 0 || snakeX >= canvasSize || snakeY < 0 || snakeY >= canvasSize || collision(newHead, snake)) {
        clearInterval(game);
        gameOverScreen.style.display = 'flex';
        canvas.style.display = 'none';
    }

    snake.unshift(newHead);

    // Draw score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}
