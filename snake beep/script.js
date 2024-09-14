const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

let snake;
let food;
let specialFood;
let score = 0;
let d = 'RIGHT';
let specialFoodTimer = 0;
let startTime;
let elapsedTime = 0;

function setup() {
    snake = new Snake();
    food = new Food();
    specialFood = new SpecialFood();
    d = 'RIGHT';
    startTime = Date.now();

    document.addEventListener('keydown', changeDirection);

    // Start the game loop
    setInterval(gameLoop, 100);

    // Start the special food timer
    setInterval(() => {
        specialFoodTimer++;
        if (specialFoodTimer === 10) {  // Show special food every 10 seconds
            specialFood.show = true;
            setTimeout(() => specialFood.show = false, 5000); // Show for 5 seconds
            specialFoodTimer = 0;
        }
    }, 1000);
}

function changeDirection(e) {
    // Prevent the snake from reversing
    if (e.keyCode === 37 && d !== 'RIGHT') d = 'LEFT';
    if (e.keyCode === 38 && d !== 'DOWN') d = 'UP';
    if (e.keyCode === 39 && d !== 'LEFT') d = 'RIGHT';
    if (e.keyCode === 40 && d !== 'UP') d = 'DOWN';
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.update();
    snake.show();
    food.show();
    if (specialFood.show) specialFood.showSpecial();
    checkCollision();
    checkFood();
    checkSpecialFood();
    updateTimer();
    document.getElementById('score').textContent = `Score: ${score}`;
}

function checkCollision() {
    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
        resetGame();
    }

    for (let i = 0; i < snake.tail.length; i++) {
        if (snake.x === snake.tail[i].x && snake.y === snake.tail[i].y) {
            resetGame();
        }
    }
}

function checkFood() {
    if (snake.x === food.x && snake.y === food.y) {
        snake.grow();
        food.randomize();
        score++;
        beep();
    }
}

function checkSpecialFood() {
    if (specialFood.show && snake.x === specialFood.x && snake.y === specialFood.y) {
        // Double the size of the snake
        for (let i = 0; i < 2; i++) { // Add two new segments to effectively double size
            snake.grow();
        }
        score += 20;
        specialFood.show = false;
        beep();
    }
}

function updateTimer() {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
    let minutes = Math.floor(elapsedTime / 60);
    let seconds = elapsedTime % 60;
    if (seconds < 10) seconds = '0' + seconds; // Pad seconds with leading zero
    document.getElementById('timer').textContent = `Time: ${minutes}:${seconds}`;
}

function resetGame() {
    snake = new Snake();
    food = new Food();
    specialFood = new SpecialFood();
    score = 0;
    d = 'RIGHT';
    startTime = Date.now(); // Reset the timer
}

class Snake {
    constructor() {
        this.x = scale * 2;
        this.y = scale * 2;
        this.xSpeed = scale;
        this.ySpeed = 0;
        this.tail = [];
        this.total = 0;
    }


    

    update() {
        const head = {x: this.x, y: this.y};

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        this.tail.push(head);

        if (this.tail.length > this.total) {
            this.tail.shift();
        }

        // Update direction
        switch (d) {
            case 'LEFT':
                this.xSpeed = -scale;
                this.ySpeed = 0;
                break;
            case 'UP':
                this.xSpeed = 0;
                this.ySpeed = -scale;
                break;
            case 'RIGHT':
                this.xSpeed = scale;
                this.ySpeed = 0;
                break;
            case 'DOWN':
                this.xSpeed = 0;
                this.ySpeed = scale;
                break;
        }
    }

    grow() {
        this.total++;
    }

    show() {
        ctx.fillStyle = 'green';
        for (const segment of this.tail) {
            ctx.fillRect(segment.x, segment.y, scale, scale);
        }
        ctx.fillRect(this.x, this.y, scale, scale);
    }
}

class Food {
    constructor() {
        this.randomize();
    }

    randomize() {
        this.x = Math.floor(Math.random() * cols) * scale;
        this.y = Math.floor(Math.random() * rows) * scale;
    }

    show() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, scale, scale);
    }
}

class SpecialFood {
    constructor() {
        this.randomize();
        this.show = false;
    }

    randomize() {
        this.x = Math.floor(Math.random() * cols) * scale;
        this.y = Math.floor(Math.random() * rows) * scale;
    }

    showSpecial() {
        ctx.fillStyle = 'blue'; // Different color for special food
        ctx.beginPath();
        ctx.arc(this.x + scale / 2, this.y + scale / 2, scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

setup();
function beep() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, context.currentTime); // 440 Hz is the frequency of the beep
    oscillator.connect(context.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100); // Beep duration (100 ms)
}

