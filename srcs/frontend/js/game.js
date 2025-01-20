
function game(){
    
    const botao = document.getElementById('botao');
    console.log(botao);
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Raquetes
    const paddleWidth = 10;
    const paddleHeight = 60;

    // Player (esquerda)
    let leftPaddleY = (canvasHeight - paddleHeight) / 2;
    const leftPaddleX = 10;
    const paddleSpeed = 5;

    // Oponente/IA (direita)
    let rightPaddleY = (canvasHeight - paddleHeight) / 2;
    const rightPaddleX = canvasWidth - paddleWidth - 10;

    // Bola
    const ballSize = 8;
    let ballX = canvasWidth / 2;
    let ballY = canvasHeight / 2;
    let ballSpeedX = 3;
    let ballSpeedY = 3;

    // Pontuação
    let scoreLeft = 0;
    let scoreRight = 0;

    // Teclas pressionadas
    let wPressed = false;
    let sPressed = false;

    // Detecta teclas pressionadas
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w' || event.key === 'W') {
            wPressed = true;
        }
        if (event.key === 's' || event.key === 'S') {
            sPressed = true;
        }
    });

    // Detecta teclas soltas
    document.addEventListener('keyup', (event) => {
        if (event.key === 'w' || event.key === 'W') {
            wPressed = false;
        }
        if (event.key === 's' || event.key === 'S') {
            sPressed = false;
        }
    });

    // Atualiza a posição das raquetes e da bola
    function update() {
        // Mover raquete esquerda (player)
        if (wPressed && leftPaddleY > 0) {
            leftPaddleY -= paddleSpeed;
        } else if (sPressed && leftPaddleY < canvasHeight - paddleHeight) {
            leftPaddleY += paddleSpeed;
        }

        // Mover raquete direita (IA simples)
        if (rightPaddleY + paddleHeight / 2 < ballY) {
            rightPaddleY += paddleSpeed * 0.9;
        } else if (rightPaddleY + paddleHeight / 2 > ballY) {
            rightPaddleY -= paddleSpeed * 0.9;
        }

        // Mover a bola
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Colisão com topo e base
        if (ballY <= 0 || ballY + ballSize >= canvasHeight) {
            ballSpeedY = -ballSpeedY;
        }

        // Colisão com a raquete esquerda
        if (
            ballX <= leftPaddleX + paddleWidth &&
            ballY + ballSize >= leftPaddleY &&
            ballY <= leftPaddleY + paddleHeight
        ) {
            ballSpeedX = -ballSpeedX;
            // Ajuste para maior realismo (opcional)
            const diferencaCentro = (ballY + ballSize / 2) - (leftPaddleY + paddleHeight / 2);
            ballSpeedY = diferencaCentro * 0.2;
        }

        // Colisão com a raquete direita
        if (
            ballX + ballSize >= rightPaddleX &&
            ballY + ballSize >= rightPaddleY &&
            ballY <= rightPaddleY + paddleHeight
        ) {
            ballSpeedX = -ballSpeedX;
            // Ajuste para maior realismo (opcional)
            const diferencaCentro = (ballY + ballSize / 2) - (rightPaddleY + paddleHeight / 2);
            ballSpeedY = diferencaCentro * 0.2;
        }

        // Saiu pela esquerda (ponto para a direita)
        if (ballX < 0) {
            scoreRight++;
            resetBall();
        }

        // Saiu pela direita (ponto para a esquerda)
        if (ballX > canvasWidth) {
            scoreLeft++;
            resetBall();
        }
    }

    // Redesenha toda a cena
    function draw() {
        // Limpa o canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Desenha a linha tracejada no meio
        drawMiddleLine();

        // Desenha raquetes
        ctx.fillStyle = 'white';
        ctx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);

        // Desenha bola
        ctx.fillRect(ballX, ballY, ballSize, ballSize);

        // Desenha placar
        ctx.font = '20px Arial';
        ctx.fillText(scoreLeft, canvasWidth / 2 - 40, 30);
        ctx.fillText(scoreRight, canvasWidth / 2 + 30, 30);
    }

    function drawMiddleLine() {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Reseta a bola para o centro após um ponto
    function resetBall() {
        ballX = canvasWidth / 2 - ballSize / 2;
        ballY = canvasHeight / 2 - ballSize / 2;
        ballSpeedX = -ballSpeedX; // inverte a direção para recomeçar
        ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }

    // Loop principal do jogo
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Inicia o jogo
    gameLoop();
};
