const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 200;

const initialBallSpeed = 5;
const paddleHeightRatio = 0.25; // 25% da altura do canvas

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: canvas.height,
    color: "#fff"
};

class Paddle {
    constructor(x, y, width, height, dy, score) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dy = dy;
        this.score = score;
    }

    move() {
        this.y += this.dy;
        this.y = Math.max(Math.min(this.y, canvas.height - this.height), 0);
    }
}

const player = new Paddle(0, canvas.height / 2 - (canvas.height * paddleHeightRatio) / 2, 10, canvas.height * paddleHeightRatio, 0, 0);
const opponent = new Paddle(canvas.width - 10, canvas.height / 2 - (canvas.height * paddleHeightRatio) / 2, 10, canvas.height * paddleHeightRatio, 0, 0);

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: initialBallSpeed,
    velocityX: 5,
    velocityY: 5,
    color: "#fff"
};

const hitSound = new Audio('sounds/hit.mp3');
const scoreSound = new Audio('sounds/score.mp3');
const wallSound = new Audio('sounds/wall.mp3');

const keysPressed = {};

document.addEventListener('keydown', function(event) {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
});

function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = "45px sans-serif";
    context.fillText(text, x, y);
}

function drawNet() {
    drawRect(net.x, net.y, net.width, net.height, net.color);
}

function drawElement(element) {
    if (element.radius) {
        drawCircle(element.x, element.y, element.radius, element.color);
    } else {
        drawRect(element.x, element.y, element.width, element.height, element.color);
    }
}

function checkCollision(ball, paddle) {
    paddle.top = paddle.y;
    paddle.bottom = paddle.y + paddle.height;
    paddle.left = paddle.x;
    paddle.right = paddle.x + paddle.width;

    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    return ball.right > paddle.left && ball.bottom > paddle.top && ball.left < paddle.right && ball.top < paddle.bottom;
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    drawNet();
    drawText(player.score, canvas.width / 4, canvas.height / 5, "#fff");
    drawText(opponent.score, 3 * canvas.width / 4, canvas.height / 5, "#fff");
    drawElement(player);
    drawElement(opponent);
    drawElement(ball);
}

function movePaddles() {
    if (keysPressed['w']) {
        player.dy = -5;
    } else if (keysPressed['s']) {
        player.dy = 5;
    } else {
        player.dy = 0;
    }

    if (keysPressed['ArrowUp']) {
        opponent.dy = -5;
    } else if (keysPressed['ArrowDown']) {
        opponent.dy = 5;
    } else {
        opponent.dy = 0;
    }

    player.move();
    opponent.move();
}

function update() {
    speedIncrease = 0.5;
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Check for collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius; // Correct position
        ball.velocityY = -ball.velocityY;
        wallSound.play();
    } else if (ball.y - ball.radius < 0) {
        ball.y = ball.radius; // Correct position
        ball.velocityY = -ball.velocityY;
        wallSound.play();
    }

    if (checkCollision(ball, player)) {
        handleCollision(ball, player);
    }

    if (checkCollision(ball, opponent)) {
        handleCollision(ball, opponent);
    }

    // Check for scoring
    if (ball.x - ball.radius < 0) {
        opponent.score++;
        resetBall('player');
        scoreSound.play();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall('opponent');
        scoreSound.play();
    }
}

function handleCollision(ball, paddle) {
    // Calculate the angle of impact
    let collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    let angleRad = (Math.PI / 4) * collidePoint;

    // Adjust the ball's velocity based on the angle of impact
    let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

	if (ball.speed < 15)
	    ball.speed += speedIncrease;

    hitSound.play();
}

function resetBall(scoredBy) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = 0;
    ball.velocityY = 0;
    ball.speed = initialBallSpeed;

    setTimeout(() => {
        if (scoredBy === 'player') {
            ball.velocityX = -initialBallSpeed;
        } else {
            ball.velocityX = initialBallSpeed;
        }
        ball.velocityY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    }, 1000);
}

function game() {
    update();
    movePaddles();
    render();
}

const framePerSecond = 75;
setInterval(game, 1000 / framePerSecond);
