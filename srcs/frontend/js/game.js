import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";

class Tournament {
  constructor(players) {
    this.players = this.shufflePlayers(players);
    this.rounds = [];
    this.currentRound = 0;
    this.currentMatchIndex = 0;
    this.generateBracket();
  }

  shufflePlayers(players) {
    return players.sort(() => Math.random() - 0.5);
  }

  generateBracket() {
    let bracket = [this.players.map((player) => ({ player, score: 0 }))];

    while (bracket[0].length > 1) {
      const newRound = [];
      for (let i = 0; i < bracket[0].length; i += 2) {
        newRound.push({
          players: [bracket[0][i], bracket[0][i + 1]],
          winner: null,
        });
      }
      bracket.unshift(newRound);
    }

    this.rounds = bracket;
  }

  getCurrentMatch() {
    return this.rounds[this.currentRound][this.currentMatchIndex];
  }

  advanceMatch(winner) {
    const currentMatch = this.getCurrentMatch();
    currentMatch.winner = winner;

    if (this.currentMatchIndex < this.rounds[this.currentRound].length - 1) {
      this.currentMatchIndex++;
    } else {
      this.currentRound--;
      this.currentMatchIndex = 0;
    }
  }

  isTournamentOver() {
    return this.currentRound < 0;
  }
}

function startTournament(players) {
  document.querySelector(".game-config").style.display = "none";
  const tournament = new Tournament(players);
  showBracket(tournament);
  playNextMatch(tournament);
}

function showBracket(tournament) {
  const bracketHtml = tournament.rounds
    .map(
      (round, roundIndex) => `
    <div class="bracket-round">
      <h3>${
        roundIndex === 0
          ? "Final"
          : roundIndex === 1
          ? "Semifinals"
          : roundIndex === 2
          ? "Quarterfinals"
          : `Round ${tournament.rounds.length - roundIndex}`
      }</h3>
      ${round
        .map(
          (match) => `
        <div class="matchup">
          ${match.players
            .map(
              (p) => `
            <div>${p.player} ${p.score}</div>
          `
            )
            .join(" vs ")}
          ${
            match.winner
              ? `<div class="winner">Winner: ${match.winner.player}</div>`
              : ""
          }
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("");

  const bracketDiv = document.createElement("div");
  bracketDiv.className = "tournament-bracket";
  bracketDiv.innerHTML = bracketHtml;
  document.body.appendChild(bracketDiv);
  bracketDiv.style.display = "block";
}

function playNextMatch(tournament) {
  if (tournament.isTournamentOver()) {
    alert(`Tournament winner: ${tournament.rounds[0][0].winner.player}`);
    return;
  }

  const currentMatch = tournament.getCurrentMatch();
  const config = {
    mode: "tournament",
    maxScore: 5,
    player1: currentMatch.players[0].player,
    player2: currentMatch.players[1].player,
    onGameEnd: (winner) => {
      tournament.advanceMatch(
        currentMatch.players.find((p) => p.player === winner)
      );
      document.getElementById("gameCanvas").style.display = "none";
      showBracket(tournament);
      playNextMatch(tournament);
    },
  };

  document.getElementById("gameCanvas").style.display = "block";
  game(config);
}

function game(config) {
  "use strict";

  const { mode, maxScore, player1, player2, difficulty } = config;

  console.log(`Game mode: ${mode}`);
  console.log(`Max score: ${maxScore}`);
  console.log(`Player 1: ${player1}`);
  console.log(`Player 2: ${player2}`);
  console.log(`Difficulty: ${difficulty}`);

  // Example function using the destructured variables
  function startGame() {
    console.log(
      `Starting a ${mode} game between ${player1} and ${player2} with a max score of ${maxScore} on ${difficulty} difficulty.`
    );
  }

  startGame();

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

  // Posições das raquetes
  let player1X = PADDLE_OFFSET;
  let player1Y = (HEIGHT - PADDLE_HEIGHT) / 2;
  let player2X = WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;
  let player2Y = (HEIGHT - PADDLE_HEIGHT) / 2;

  // Posição da bola
  let ballX = WIDTH / 2;
  let ballY = HEIGHT / 2;

  // Placar
  let player1Score = 0;
  let player2Score = 0;
  let isGameOver = false;

  // Controles do jogador
  let wPressed = false;
  let sPressed = false;
  let upPressed = false;
  let downPressed = false;

  let aiVisionInterval;
  switch (difficulty) {
    case "hard":
      aiVisionInterval = 0;
      break;
    case "easy":
      aiVisionInterval = 1000;
      break;
    default:
      aiVisionInterval = 500;
  }
  let nextAiCheckTime = 0;
  let aiTargetY = player2Y;

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
    player1Score = 0;
    player2Score = 0;
    isGameOver = false;
    resetBall();
  }

  /*************************************************************
   * IA (só usado no modo singleplayer)
   *************************************************************/
  function updateAI() {
    if (mode !== "singleplayer") return;

    // Verifica se é hora de "enxergar" novamente
    if (performance.now() > nextAiCheckTime) {
      nextAiCheckTime = performance.now() + aiVisionInterval;

      // Calcula a velocidade X e Y da bola
      const vx = Math.cos(ballAngle) * ballSpeed;
      const vy = Math.sin(ballAngle) * ballSpeed;

      // Se a bola está se movendo para a direita (em direção à IA)
      if (vx > 0) {
        const distX = player2X - ballX - BALL_RADIUS;
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
    if (player2Y < aiTargetY) {
      player2Y += PADDLE_SPEED;
    } else if (player2Y > aiTargetY) {
      player2Y -= PADDLE_SPEED;
    }

    // Limita as bordas
    if (player2Y < 0) player2Y = 0;
    if (player2Y + PADDLE_HEIGHT > HEIGHT) {
      player2Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  /*************************************************************
   * Jogadores
   *************************************************************/
  function updatePlayer1() {
    if (wPressed) {
      player1Y -= PADDLE_SPEED;
    } else if (sPressed) {
      player1Y += PADDLE_SPEED;
    }

    // Limita as bordas
    if (player1Y < 0) player1Y = 0;
    if (player1Y + PADDLE_HEIGHT > HEIGHT) {
      player1Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  function updatePlayer2() {
    if (mode === "multiplayer") {
      if (upPressed) {
        player2Y -= PADDLE_SPEED;
      } else if (downPressed) {
        player2Y += PADDLE_SPEED;
      }

      // Limita as bordas
      if (player2Y < 0) player2Y = 0;
      if (player2Y + PADDLE_HEIGHT > HEIGHT) {
        player2Y = HEIGHT - PADDLE_HEIGHT;
      }
    }
  }

  /*************************************************************
   * Física de rebote na raquete
   *************************************************************/
  function bounceOffPaddle(isPlayer1) {
    // Identifica qual raquete
    const paddleY = isPlayer1 ? player1Y : player2Y;
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
    if (isPlayer1) {
      if (wPressed) extraSpin = -SPIN_FACTOR * PADDLE_SPEED;
      if (sPressed) extraSpin = SPIN_FACTOR * PADDLE_SPEED;
    } else if (mode === "multiplayer") {
      if (upPressed) extraSpin = -SPIN_FACTOR * PADDLE_SPEED;
      if (downPressed) extraSpin = SPIN_FACTOR * PADDLE_SPEED;
    }

    // Ajusta direção X (player1 => bola pra direita, player2/IA => bola pra esquerda)
    const directionX = isPlayer1 ? 1 : -1;
    const vx = ballSpeed * Math.cos(bounceAngle) * directionX;
    const vy = ballSpeed * Math.sin(bounceAngle) + extraSpin;

    ballAngle = Math.atan2(vy, vx);

    // Reposiciona a bola para evitar ficar "presa" na raquete
    if (isPlayer1) {
      ballX = player1X + PADDLE_WIDTH + BALL_RADIUS;
    } else {
      ballX = player2X - BALL_RADIUS;
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

    // Colisão com a raquete do jogador 1
    if (
      ballX - BALL_RADIUS <= player1X + PADDLE_WIDTH &&
      ballY + BALL_RADIUS >= player1Y &&
      ballY - BALL_RADIUS <= player1Y + PADDLE_HEIGHT
    ) {
      bounceOffPaddle(true);
    }

    // Colisão com a raquete do jogador 2/IA
    if (
      ballX + BALL_RADIUS >= player2X &&
      ballY + BALL_RADIUS >= player2Y &&
      ballY - BALL_RADIUS <= player2Y + PADDLE_HEIGHT
    ) {
      bounceOffPaddle(false);
    }

    // Saiu pela esquerda
    if (ballX + BALL_RADIUS < 0) {
      player2Score++;
      if (player2Score >= maxScore) {
        isGameOver = true;
      } else {
        resetBall();
      }
    }

    // Saiu pela direita
    if (ballX - BALL_RADIUS > WIDTH) {
      player1Score++;
      if (player1Score >= maxScore) {
        isGameOver = true;
      } else {
        resetBall();
      }
    }
  }

  /*************************************************************
   * Desenho (campo, linhas, raquetes, placar, etc.)
   *************************************************************/
  async function draw() {
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

    // Raquete do jogador 1 (esquerda, roxa p.ex.)
    ctx.fillStyle = "#bb66ff";
    ctx.fillRect(player1X, player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Raquete do jogador 2/IA (direita, outra cor)
    ctx.fillStyle = "#66ffda";
    ctx.fillRect(player2X, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Placar
    ctx.font = "30px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`${player1Score}`, WIDTH * 0.25, HEIGHT - 15);
    ctx.fillText(`${player2Score}`, WIDTH * 0.75, HEIGHT - 15);

    // Game over overlay
    if (isGameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#fff";
      ctx.font = "36px Arial";
      ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);

      const winnerText =
        player1Score >= maxScore
          ? `${player1} venceu!`
          : `${player2 || "IA"} venceu!`;
      ctx.font = "24px Arial";
      ctx.fillText(winnerText, WIDTH / 2, HEIGHT / 2 + 15);
      await saveResult(player1, player2 || "IA", player1Score, player2Score);
    }
  }

  /*************************************************************
   * Loop principal do jogo
   *************************************************************/
  let gameOverDisplayed = false; // Variável para controlar se a tela de game over já foi exibida

  function gameLoop() {
    if (!isGameOver) {
      updatePlayer1();
      updatePlayer2();
      updateAI();
      updateBall();
      draw();
      requestAnimationFrame(gameLoop);
    } else if (!gameOverDisplayed) {
      draw(); // Desenha a tela de game over uma última vez
      gameOverDisplayed = true; // Marca que a tela de game over já foi exibida
    }
  }

  /*************************************************************
   * Eventos de teclado e botão "restart"
   *************************************************************/
  document.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W") wPressed = true;
    if (e.key === "s" || e.key === "S") sPressed = true;
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W") wPressed = false;
    if (e.key === "s" || e.key === "S") sPressed = false;
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

async function saveResult(player1Name, player2Name, player1Score, player2Score) {
  let gameType = "AI opponent";
  let tournamentName = "32";
  const userId = CookieManager.getCookie('userId');
  if (!userId) {
    return;
  }
  
  // Crie um objeto com os parâmetros para enviar como corpo da requisição
  const requestBody = {
    user: userId,
    opponent: player2Name,
    user_score: player1Score,
    opponent_score: player2Score,
    game_type: gameType,
    tournament_name: tournamentName
  };

  try {
    const response = await fetch("/api/scores/add/", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),  // Envia o objeto como JSON
    });

    if (!response.ok) {
      throw new Error("Failed to save game result");
    }

    console.log("Game result saved successfully");
  } catch (error) {
    console.error("Error saving game result:", error);
  }
}

/*************************************************************
   * Inicializa o menu de jogo 
   *************************************************************/

async function loadGameMenu() {
  let data = await loadPersonalInfo();
  let player1Input = document.getElementById('player1');
  
  player1Input.value = data.username; // Definir o valor do campo como o nome do usuário
  player1Input.disabled = true; // Bloquear o campo para edição
}


window.game = game;
window.loadGameMenu = loadGameMenu;
window.startTournament = startTournament;
