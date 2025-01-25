function game() {
  "use strict";

  console.log("[game.js] Iniciando o jogo Pong...");

  /*************************************************************
   * Seleciona elementos HTML
   *************************************************************/
  const canvas = document.getElementById("gameCanvas");
  const restartBtn = document.getElementById("restartBtn");
  if (!canvas || !restartBtn) {
    console.error("[game.js] Canvas ou botão não encontrado. Abortando...");
    return;
  }

  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = LOGICAL_WIDTH * dpr;
  canvas.height = LOGICAL_HEIGHT * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  // Escala para manter coordenadas lógicas
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const WIDTH = LOGICAL_WIDTH;
  const HEIGHT = LOGICAL_HEIGHT;

  /*************************************************************
   * Configurações e variáveis do Pong
   *************************************************************/
  // Raquete
  const PADDLE_SPEED = 6;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 70;
  const PADDLE_OFFSET = 30;

  // Bola
  const BALL_RADIUS = 6;
  const BALL_MIN_SPEED = 7;
  const BALL_MAX_SPEED = 20;
  const BALL_SPEED_INCREMENT = 0.5;

  // Ângulos e rotação
  const SPIN_FACTOR = 0.5;
  const MAX_BOUNCE_ANGLE = Math.PI / 3;

  // Placar
  const MAX_SCORE = 5;
  
  // Posições das raquetes
  let playerX = PADDLE_OFFSET;
  let playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
  let aiX = WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;
  let aiY = (HEIGHT - PADDLE_HEIGHT) / 2;
  
  // Posição da bola
  let ballX = WIDTH / 2;
  let ballY = HEIGHT / 2;

  // Placar
  let playerScore = 0;
  let aiScore = 0;
  let isGameOver = false;

  // Controles do jogador
  let upPressed = false;
  let downPressed = false;

  // Parâmetros de "IA"
  let aiVisionInterval = 0; // de quanto em quanto tempo "enxerga" a bola
  let nextAiCheckTime = 0;
  let aiTargetY = aiY;

  let ballSpeed = BALL_MIN_SPEED;
  let ballAngle = Math.random() * Math.PI * 2;

  /**
   * Resets the ball to the center of the game area with a random angle and minimum speed.
   * The angle is chosen such that it avoids the vertical and horizontal directions.
   */
  function resetBall() {
    do {
      ballAngle = Math.random() * 2 * Math.PI;
    } while (
      (ballAngle >= Math.PI / 4 && ballAngle <= (3 * Math.PI) / 4) ||
      (ballAngle >= (5 * Math.PI) / 4 && ballAngle <= (7 * Math.PI) / 4)
    );

    ballX = WIDTH / 2;
    ballY = HEIGHT / 2;
    ballSpeed = BALL_MIN_SPEED;
  }

  function resetGame() {
    playerScore = 0;
    aiScore = 0;
    isGameOver = false;
    resetBall();
  }

  /*************************************************************
   * IA
   *************************************************************/
  function updateAI() {
    // Verifica se é hora de "enxergar" novamente
    if (performance.now() > nextAiCheckTime) {
      nextAiCheckTime = performance.now() + aiVisionInterval;

      // Calcula a velocidade X e Y da bola
      const vx = Math.cos(ballAngle) * ballSpeed;
      const vy = Math.sin(ballAngle) * ballSpeed;

      // Se a bola está se movendo para a direita (em direção à IA)
      if (vx > 0) {
        const distX = aiX - ballX - BALL_RADIUS;
        const timeToReach = distX / vx;

        if (timeToReach > 0) {
          // Predição de onde a bola estará em "timeToReach" segundos
          let predictedY = ballY + vy * timeToReach;

          // Limita a predição ao canvas
          if (predictedY < 0) predictedY = 0;
          if (predictedY > HEIGHT) predictedY = HEIGHT;

          // Centraliza a raquete na posição prevista da bola
          aiTargetY = predictedY - PADDLE_HEIGHT / 2;
        } else {
          // Se a bola já passou do ponto de interceptação
          aiTargetY = (HEIGHT - PADDLE_HEIGHT) / 2;
        }
      } else {
        // Se a bola não está vindo para a direita
        aiTargetY = (HEIGHT - PADDLE_HEIGHT) / 2;
      }
    }

    // Move a raquete em direção ao target
    if (aiY < aiTargetY) {
      aiY += PADDLE_SPEED;
    } else if (aiY > aiTargetY) {
      aiY -= PADDLE_SPEED;
    }

    // Limita as bordas
    if (aiY < 0) aiY = 0;
    if (aiY + PADDLE_HEIGHT > HEIGHT) {
      aiY = HEIGHT - PADDLE_HEIGHT;
    }
  }

  /*************************************************************
   * Jogador
   *************************************************************/
  function updatePlayer() {
    if (upPressed) {
      playerY -= PADDLE_SPEED;
    } else if (downPressed) {
      playerY += PADDLE_SPEED;
    }

    // Limita as bordas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > HEIGHT) {
      playerY = HEIGHT - PADDLE_HEIGHT;
    }
  }

  /*************************************************************
   * Física de rebote na raquete
   *************************************************************/
  function bounceOffPaddle(isPlayer) {
    // Identifica qual raquete
    const paddleY = isPlayer ? playerY : aiY;
    const paddleCenter = paddleY + PADDLE_HEIGHT / 2;

    // Descobre a posição de contato da bola com a raquete
    let contactY = ballY - paddleCenter;
    let normalized = contactY / (PADDLE_HEIGHT / 2);
    normalized = Math.max(Math.min(normalized, 1), -1);

    // Define o ângulo de saída
    const bounceAngle = normalized * MAX_BOUNCE_ANGLE;

    // Acelera um pouco a bola
    ballSpeed += BALL_SPEED_INCREMENT;
    if (ballSpeed > BALL_MAX_SPEED) {
      ballSpeed = BALL_MAX_SPEED;
    }

    // Calcula spin adicional baseado no movimento da raquete
    let extraSpin = 0;
    if (isPlayer) {
      if (upPressed) extraSpin = -SPIN_FACTOR * PADDLE_SPEED;
      if (downPressed) extraSpin = SPIN_FACTOR * PADDLE_SPEED;
    }

    // Ajusta direção X (player => bola pra direita, IA => bola pra esquerda)
    const directionX = isPlayer ? 1 : -1;
    const vx = ballSpeed * Math.cos(bounceAngle) * directionX;
    const vy = ballSpeed * Math.sin(bounceAngle) + extraSpin;

    ballAngle = Math.atan2(vy, vx);

    // Reposiciona a bola para evitar ficar "presa" na raquete
    if (isPlayer) {
      ballX = playerX + PADDLE_WIDTH + BALL_RADIUS;
    } else {
      ballX = aiX - BALL_RADIUS;
    }
  }

  /*************************************************************
   * Atualiza a posição da bola
   *************************************************************/
  function updateBall() {
    const vx = Math.cos(ballAngle) * ballSpeed;
    const vy = Math.sin(ballAngle) * ballSpeed;

    ballX += vx;
    ballY += vy;

    // Colisão no topo/baixo
    if (ballY - BALL_RADIUS < 0) {
      ballY = BALL_RADIUS;
      ballAngle = -ballAngle;
    }
    if (ballY + BALL_RADIUS > HEIGHT) {
      ballY = HEIGHT - BALL_RADIUS;
      ballAngle = -ballAngle;
    }

    // Colisão com a raquete do jogador
    if (
      ballX - BALL_RADIUS <= playerX + PADDLE_WIDTH &&
      ballY + BALL_RADIUS >= playerY &&
      ballY - BALL_RADIUS <= playerY + PADDLE_HEIGHT
    ) {
      bounceOffPaddle(true);
    }

    // Colisão com a raquete da IA
    if (
      ballX + BALL_RADIUS >= aiX &&
      ballY + BALL_RADIUS >= aiY &&
      ballY - BALL_RADIUS <= aiY + PADDLE_HEIGHT
    ) {
      bounceOffPaddle(false);
    }

    // Saiu pela esquerda
    if (ballX + BALL_RADIUS < 0) {
      aiScore++;
      if (aiScore >= MAX_SCORE) {
        isGameOver = true;
      } else {
        resetBall();
      }
    }

    // Saiu pela direita
    if (ballX - BALL_RADIUS > WIDTH) {
      playerScore++;
      if (playerScore >= MAX_SCORE) {
        isGameOver = true;
      } else {
        resetBall();
      }
    }
  }

  /*************************************************************
   * Desenho (campo, linhas, raquetes, placar, etc.)
   *************************************************************/
  function draw() {
    // Fundo
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Linha horizontal no meio (opcional)
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT / 2);
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    // Linha vertical central
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bola
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Raquete do jogador (esquerda, roxa p.ex.)
    ctx.fillStyle = "#bb66ff";
    ctx.fillRect(playerX, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Raquete da IA (direita, outra cor)
    ctx.fillStyle = "#66ffda";
    ctx.fillRect(aiX, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Placar
    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`${playerScore}`, WIDTH * 0.25, HEIGHT - 15);
    ctx.fillText(`${aiScore}`, WIDTH * 0.75, HEIGHT - 15);

    // Game over overlay
    if (isGameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#fff";
      ctx.font = "36px Arial";
      ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);

      const winnerText =
        playerScore >= MAX_SCORE ? "Você venceu!" : "IA venceu!";
      ctx.font = "24px Arial";
      ctx.fillText(winnerText, WIDTH / 2, HEIGHT / 2 + 15);
    }
  }

  /*************************************************************
   * Loop principal do jogo
   *************************************************************/
  function gameLoop() {
    if (!isGameOver) {
      updatePlayer();
      updateAI();
      updateBall();
    }
    draw();
    requestAnimationFrame(gameLoop);
  }

  /*************************************************************
   * Eventos de teclado e botão "restart"
   *************************************************************/
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") upPressed = false;
    if (e.key === "ArrowDown") downPressed = false;
  });

  restartBtn.addEventListener("click", resetGame);

  /*************************************************************
   * Inicializa o jogo
   *************************************************************/
  resetGame();
  gameLoop();
}
