import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";

class Tournament {
  constructor(players) {
    this.players = this.shufflePlayers(players);
    this.rounds = this.generateBracket();
    this.currentRound = 0;
    this.currentMatchIndex = 0;
  }

  shufflePlayers(players) {
    return players.sort(() => Math.random() - 0.5);
  }

  

  generateBracket() {
    const numPlayers = this.players.length;
    let bracket = [];

    // Helper function to create a match structure
    const createMatch = (matchName, players) => ({
      match: matchName,
      players: players || [null, null], // If no players, we set as null for later
      winner: null,
    });

    if (numPlayers === 4) {
      // For 4 players, we create a semi-final and final bracket
      bracket = [
        createMatch("Semifinal 1", [this.players[0], this.players[1]]),
        createMatch("Semifinal 2", [this.players[2], this.players[3]]),
        createMatch("Final"),
      ];
    }
    console.log(bracket);
    return bracket;
  }


  isPowerOfTwo(n) {
    return (Math.log2(n) % 1) === 0;
  }

  getCurrentMatch() {
    return this.rounds[this.currentRound][this.currentMatchIndex];
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

function playNextMatch(tournament) {
  // Check if the tournament is over (no more rounds)
  if (tournament.isTournamentOver() || tournament.currentRound >= tournament.rounds.length) {
    alert(`Tournament winner: ${tournament.rounds[tournament.rounds.length - 1].winner}`);
    return;
  }
  // Get players for the current match
  const player1 = tournament.rounds[tournament.currentRound].players[0];
  const player2 = tournament.rounds[tournament.currentRound].players[1];

  // Create the game configuration
  const config = {
    mode: "tournament",
    maxScore: 1,
    player1: player1 ? player1 : "Bye",  // If a player is null, treat it as "Bye"
    player2: player2 ? player2 : "Bye",
    onGameEnd: (winner) => {
      // Update the match winner
      tournament.rounds[tournament.currentRound].winner = winner;
      tournament.currentRound++;

      // Hide the game canvas and show the updated bracket
      setTimeout(() => {

        if(tournament.currentRound >= tournament.rounds.length)
        {
            document.getElementById("gameCanvas").style.display = "none";
            const winner = tournament.rounds[tournament.rounds.length - 1].winner;
            const winnerAnnouncement = document.getElementById("announcementGame");
            winnerAnnouncement.style.display = "block";
            winnerAnnouncement.textContent = `${winner} is the winner 🎉`;
            setTimeout(() => {
              winnerAnnouncement.style.display = "none";
              loadContent("game");
            }, 3000); // Wait for 3 seconds before disappearing
        }
        else
        {
          showBracket(tournament); // Display the updated bracket
          document.getElementById("gameCanvas").style.display = "none";
          setTimeout(() => {
            if(tournament.rounds[tournament.currentRound].match == "Final"){ 
              verifyPlayersRound(tournament);
            }
            playNextMatch(tournament); // Continue to the next match after 3 seconds
          }, 3000);
        }
      }, 3000);
    },
  };
  
  // Show the game canvas and start the game
  document.getElementById('bracketContainer').style.display = "none";
  announcement(player1, player2, config);

}

function verifyPlayersRound(tournament){
  
    const match = tournament.rounds[tournament.currentRound];
    const semifinal1Winner = tournament.rounds.find(m => m.match === "Semifinal 1").winner;
    const semifinal2Winner = tournament.rounds.find(m => m.match === "Semifinal 2").winner;
    
    if (semifinal1Winner && semifinal2Winner) {
      match.players[0] = semifinal1Winner;
      match.players[1] = semifinal2Winner;
    }
}

function announcement(player1, player2, config){

  const announcement = document.getElementById("announcementGame");
  announcement.style.display = "block";
  announcement.textContent = `${player1} VS ${player2}`;
  
  // Countdown
  let countdown = 3;
  const countdownInterval = setInterval(() => {
    announcement.textContent = `${player1} VS ${player2}\n${countdown}`;
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      document.getElementById("gameCanvas").style.display = "block";
      announcement.style.display = "none";  
      game(config);
    }
  }, 1000);
}


function  showBracket(tournament) {
  const bracketContainer = document.getElementById("bracketContainer");
  
  // Limpar o conteúdo anterior
  bracketContainer.innerHTML = "";

  // Criar um elemento de tabela para o chaveamento
  const table = document.createElement("table");
  table.classList.add("bracket-table");
  const tbody = document.createElement("tbody");

  // Função para criar uma linha de partida
  const createMatchRow = (match) => {
      const row = document.createElement("tr");

      // Criar as células para os jogadores
      const cell1 = document.createElement("td");
      const cell2 = document.createElement("td");
      const cell3 = document.createElement("td");
      const winnerCell = document.createElement("td");

      // Exibir os jogadores ou "Bye" caso o jogador esteja ausente
      cell1.textContent = match.players[0] ? match.players[0]: "Bye";
      cell2.textContent = " vs ";
      cell3.textContent = match.players[1] ? match.players[1]: "Bye";

      // Exibir o vencedor, se já houver um
      winnerCell.textContent = match.winner ? `Winner: ${match.winner}` : "No winner yet";

      row.appendChild(cell1);
      row.appendChild(cell2);
      row.appendChild(cell3);
      row.appendChild(winnerCell);
      
      return row;
  };

  // Função para exibir todos os rounds (partidas) no bracket
  const createBracketRows = (rounds) => {
      const rows = [];
      
      tournament.rounds.forEach((round) => {
          const matchRow = createMatchRow(round);
          rows.push(matchRow);
      });

      return rows;
  };

  // Exibir cada round
  const matchRows = createBracketRows(tournament.rounds);

  // Adicionar as linhas da tabela no tbody
  matchRows.forEach((row) => {
      tbody.appendChild(row);
  });

  // Adicionar a tabela no bracketContainer
  table.appendChild(tbody);
  bracketContainer.appendChild(table);

  // Tornar o container visível
  bracketContainer.style.display = "block";
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
    ctx.font = "30px Pixel";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`${player1Score}`, WIDTH * 0.25, HEIGHT - 15);
    ctx.fillText(`${player2Score}`, WIDTH * 0.75, HEIGHT - 15);

    //Player's names
    ctx.font = "20px Pixel";
    ctx.fillText(`${player1}`, WIDTH * 0.25, 40);
    ctx.fillText(`${player2}`, WIDTH * 0.75, 40);


    // Game over overlay
    if (isGameOver && !gameOverDisplayed) {
      gameOverDisplayed = true; // Marca que o overlay já foi exibido
  
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      ctx.fillStyle = "#fff";
      ctx.font = "36px Pixel";
      ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);
      
      const winnerText =
        player1Score >= maxScore
          ? `${player1} won 🎉`
          : `${player2 || "IA"} won 🎉`;
      ctx.font = "24px Pixel";
      ctx.fillText(winnerText, WIDTH / 2, HEIGHT / 2 + 15);
  
      setTimeout(() => {
        const winner = player1Score >= maxScore ? player1 : player2;
        config.onGameEnd(winner); // Chama a função de callback com o vencedor
      }, 1000);
      saveResult(player1, player2, player1Score, player2Score, config);
    }
  // Botão de voltar
 
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

async function saveResult(player1Name, player2Name, player1Score, player2Score, config) {
  let gameType = config.mode;
  let tournamentName = "42";
  const userId = CookieManager.getCookie('userId');
  if (!userId) {
    return;
  }
  
  // Crie um objeto com os parâmetros para enviar como corpo da requisição
  const requestBody = {
    user: player1Name,
    opponent: player2Name,
    user_score: player1Score,
    opponent_score: player2Score,
    game_type: gameType.toUpperCase(),
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
