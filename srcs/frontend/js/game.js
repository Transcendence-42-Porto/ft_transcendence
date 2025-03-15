import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";

class Tournament {
  constructor(players) {
    this.players = players;
    this.rounds = this.generateBracket();
    this.currentRound = 0;
    this.currentMatchIndex = 0;
  }

  // shufflePlayers(players) {
  //   return players.sort(() => Math.random() - 0.5);
  // }

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
    return bracket;
  }

  isPowerOfTwo(n) {
    return Math.log2(n) % 1 === 0;
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
  playNextMatch(tournament, players);
}

function playNextMatch(tournament, players) {
  // Check if the tournament is over (no more rounds)
  if (
    tournament.isTournamentOver() ||
    tournament.currentRound >= tournament.rounds.length
  ) {
    alert(
      `Tournament winner: ${
        tournament.rounds[tournament.rounds.length - 1].winner
      }`
    );
    return;
  }

  const player1 = tournament.rounds[tournament.currentRound].players[0];
  const player2 = tournament.rounds[tournament.currentRound].players[1];

  const config = {
    mode: "tournament",
    maxScore: parseInt(document.getElementById("maxScore").value),
    player1: player1 ? player1 : "Bye",
    player2: player2 ? player2 : "Bye",
    userPlayer: players[0],
    tournamentName: document.getElementById("tournamentName").value,
    onGameEnd: (winner) => {
      tournament.rounds[tournament.currentRound].winner = winner;
      tournament.currentRound++;

      setTimeout(() => {
        if (tournament.currentRound >= tournament.rounds.length) {
          document.getElementById("gameCanvas").style.display = "none";
          const winner = tournament.rounds[tournament.rounds.length - 1].winner;
          const winnerAnnouncement =
            document.getElementById("announcementGame");
          winnerAnnouncement.style.display = "block";
          winnerAnnouncement.textContent = `${winner} is the winner 🎉`;
          setTimeout(() => {
            winnerAnnouncement.style.display = "none";
            loadContent("game");
          }, 2000);
        } else {
          showBracket(tournament);
          document.getElementById("gameCanvas").style.display = "none";
          setTimeout(() => {
            if (tournament.rounds[tournament.currentRound].match == "Final") {
              verifyPlayersRound(tournament);
            }
            playNextMatch(tournament, players);
          }, 2000);
        }
      }, 2000);
    },
  };

  document.getElementById("bracketContainer").style.display = "none";
  announcement(player1, player2, config);
}

function verifyPlayersRound(tournament) {
  const match = tournament.rounds[tournament.currentRound];
  const semifinal1Winner = tournament.rounds.find(
    (m) => m.match === "Semifinal 1"
  ).winner;
  const semifinal2Winner = tournament.rounds.find(
    (m) => m.match === "Semifinal 2"
  ).winner;

  if (semifinal1Winner && semifinal2Winner) {
    match.players[0] = semifinal1Winner;
    match.players[1] = semifinal2Winner;
  }
}

function announcement(player1, player2, config) {
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

function showBracket(tournament) {
  const bracketContainer = document.getElementById("bracketContainer");

  bracketContainer.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("bracket-table");
  const tbody = document.createElement("tbody");

  const createMatchRow = (match) => {
    const row = document.createElement("tr");

    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    const cell3 = document.createElement("td");
    const winnerCell = document.createElement("td");

    cell1.textContent = match.players[0] ? match.players[0] : "Bye";
    cell2.textContent = "vs";
    cell3.textContent = match.players[1] ? match.players[1] : "Bye";

    winnerCell.textContent = match.winner
      ? `Winner: ${match.winner}`
      : "No winner yet";

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(winnerCell);

    return row;
  };

  const createBracketRows = (rounds) => {
    const rows = [];

    tournament.rounds.forEach((round) => {
      const matchRow = createMatchRow(round);
      rows.push(matchRow);
    });

    return rows;
  };

  const matchRows = createBracketRows(tournament.rounds);

  matchRows.forEach((row) => {
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  bracketContainer.appendChild(table);

  bracketContainer.style.display = "block";
}

function game(config) {
  "use strict";
  console.log(config);
  const { mode, maxScore, player1, player2, difficulty, player3, player4 } =
    config;

  function startGame() {}

  startGame();

  /*************************************************************
   * Select HTML elements
   *************************************************************/
  const canvas = document.getElementById("gameCanvas");
  const restartBtn = document.getElementById("restartBtn");
  const menuBtn = document.getElementById("menuBtn"); // New button
  if (!canvas || !restartBtn || !menuBtn) {
    return;
  }

  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 400;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = LOGICAL_WIDTH * dpr;
  canvas.height = LOGICAL_HEIGHT * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const WIDTH = LOGICAL_WIDTH;
  const HEIGHT = LOGICAL_HEIGHT;

  let buttons = {
    restart: { x: 0, y: 0, w: 150, h: 40, text: "RESTART" },
    menu: { x: 0, y: 0, w: 150, h: 40, text: "MENU" },
  };

  buttons.menu.font = "Pixel";

  /*************************************************************
   * Pong settings and variables
   *************************************************************/
  // Paddle
  const PADDLE_SPEED = 3;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 70;
  const PADDLE_OFFSET = 30;

  // Ball
  const BALL_RADIUS = 6;
  const BALL_MIN_SPEED = 2; // Start slower
  let BALL_SPEED_INCREMENT = 0;
  const BALL_MAX_SPEED = 20;

  if (config.speedIncrement) {
    BALL_SPEED_INCREMENT = 0.3;
  }

  // Angles and rotation
  const SPIN_FACTOR = 0.5;
  const MAX_BOUNCE_ANGLE = Math.PI / 3;

  // Scoreboard

  // Paddle positions
  let player1X = PADDLE_OFFSET;
  let player1Y,
    player2X = WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;
  let player2Y, player3X, player3Y, player4X, player4Y;

  if (mode === "2X2") {
    player1Y = (HEIGHT - PADDLE_HEIGHT * 2 - 20) / 2;
    player3Y = player1Y + PADDLE_HEIGHT + 20;
    player2Y = (HEIGHT - PADDLE_HEIGHT * 2 - 20) / 2;
    player4Y = player2Y + PADDLE_HEIGHT + 20;
    player3X = PADDLE_OFFSET;
    player4X = WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;
  } else {
    player1Y = (HEIGHT - PADDLE_HEIGHT) / 2;
    player2Y = (HEIGHT - PADDLE_HEIGHT) / 2;
    player3X = player4X = -100; // Move offscreen
  }

  // Additional controls
  let aPressed = false;
  let zPressed = false;
  let num6Pressed = false;
  let num3Pressed = false;

  // Ball position
  let ballX = WIDTH / 2;
  let ballY = HEIGHT / 2;

  // Scoreboard
  let player1Score = 0;
  let player2Score = 0;
  let isGameOver = false;

  // Player controls
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
   * The angle is chosen so it avoids vertical and horizontal directions.
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
    gameOverDisplayed = false;
    restartBtn.style.display = "none";
    menuBtn.style.display = "none";
    resetBall();
  }

  /*************************************************************
   * AI (only used in singleplayer mode)
   *************************************************************/
  function updateAI() {
    if (mode !== "singleplayer") return;

    if (performance.now() > nextAiCheckTime) {
      nextAiCheckTime = performance.now() + aiVisionInterval;

      const vx = Math.cos(ballAngle) * ballSpeed;
      const vy = Math.sin(ballAngle) * ballSpeed;

      if (vx > 0) {
        const distX = player2X - ballX - BALL_RADIUS;
        const timeToReach = distX / vx;

        if (timeToReach > 0) {
          let predictedY = ballY + vy * timeToReach;

          if (predictedY < 0) predictedY = 0;
          if (predictedY > HEIGHT) predictedY = HEIGHT;

          aiTargetY = predictedY - PADDLE_HEIGHT / 2;
        } else {
          aiTargetY = (HEIGHT - PADDLE_HEIGHT) / 2;
        }
      } else {
        aiTargetY = (HEIGHT - PADDLE_HEIGHT) / 2;
      }
    }

    if (player2Y < aiTargetY) {
      if (aiTargetY - player2Y < PADDLE_SPEED) {
        player2Y = aiTargetY;
      } else {
        player2Y += PADDLE_SPEED;
      }
    } else if (player2Y > aiTargetY) {
      if (player2Y - aiTargetY < PADDLE_SPEED) {
        player2Y = aiTargetY;
      } else {
        player2Y -= PADDLE_SPEED;
      }
    }

    if (player2Y < 0) player2Y = 0;
    if (player2Y + PADDLE_HEIGHT > HEIGHT) {
      player2Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  /*************************************************************
   * Players
   *************************************************************/
  function updatePlayer1() {
    if (wPressed) {
      player1Y -= PADDLE_SPEED;
    } else if (sPressed) {
      player1Y += PADDLE_SPEED;
    }

    // In 2X2 mode, prevents player 1 from overlapping player 3
    if (mode === "2X2" && player1Y + PADDLE_HEIGHT > player3Y) {
      player1Y = player3Y - PADDLE_HEIGHT;
    }

    // Limits movement at the top
    if (player1Y < 0) player1Y = 0;

    // NEW: Limits movement at the bottom of the field
    if (player1Y + PADDLE_HEIGHT > HEIGHT) {
      player1Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  function updatePlayer3() {
    if (aPressed) {
      player3Y -= PADDLE_SPEED;
    } else if (zPressed) {
      player3Y += PADDLE_SPEED;
    }

    // Limit movement so it doesn't overlap player1
    if (player3Y < player1Y + PADDLE_HEIGHT) {
      player3Y = player1Y + PADDLE_HEIGHT;
    }

    // Lower limit
    if (player3Y + PADDLE_HEIGHT > HEIGHT) {
      player3Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  function updatePlayer2() {
    if (upPressed) {
      player2Y -= PADDLE_SPEED;
    } else if (downPressed) {
      player2Y += PADDLE_SPEED;
    }

    // Limit movement so it doesn't overlap player4
    if (mode === "2X2" && player2Y + PADDLE_HEIGHT > player4Y) {
      player2Y = player4Y - PADDLE_HEIGHT;
    }

    // Upper limit
    if (player2Y < 0) player2Y = 0;
    // Lower limit
    if (player2Y + PADDLE_HEIGHT > HEIGHT) {
      player2Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  function updatePlayer4() {
    if (num6Pressed) {
      player4Y -= PADDLE_SPEED;
    } else if (num3Pressed) {
      player4Y += PADDLE_SPEED;
    }

    // Limit movement so it doesn't overlap player2
    if (player4Y < player2Y + PADDLE_HEIGHT) {
      player4Y = player2Y + PADDLE_HEIGHT;
    }

    // Lower limit
    if (player4Y + PADDLE_HEIGHT > HEIGHT) {
      player4Y = HEIGHT - PADDLE_HEIGHT;
    }
  }

  /*************************************************************
   * Paddle bounce physics
   *************************************************************/
  function bounceOffPaddle(isPlayer1, paddleNumber) {
    let paddleY;
    let movingUp, movingDown;

    if (isPlayer1) {
      paddleY = paddleNumber === 1 ? player1Y : player3Y;
      movingUp = paddleNumber === 1 ? wPressed : aPressed;
      movingDown = paddleNumber === 1 ? sPressed : zPressed;
    } else {
      paddleY = paddleNumber === 2 ? player2Y : player4Y;
      movingUp = paddleNumber === 2 ? upPressed : num6Pressed;
      movingDown = paddleNumber === 2 ? downPressed : num3Pressed;
    }

    const paddleCenter = paddleY + PADDLE_HEIGHT / 2;
    let contactY = ballY - paddleCenter;
    let normalized = contactY / (PADDLE_HEIGHT / 2);
    normalized = Math.max(Math.min(normalized, 1), -1);

    const bounceAngle = normalized * MAX_BOUNCE_ANGLE;

    // Acceleration and spin
    ballSpeed = Math.min(ballSpeed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
    const extraSpin =
      (movingUp ? -SPIN_FACTOR : movingDown ? SPIN_FACTOR : 0) * PADDLE_SPEED;

    const directionX = isPlayer1 ? 1 : -1;
    const vx = ballSpeed * Math.cos(bounceAngle) * directionX;
    const vy = ballSpeed * Math.sin(bounceAngle) + extraSpin;

    ballAngle = Math.atan2(vy, vx);

    // Reposition
    ballX = isPlayer1
      ? player1X + PADDLE_WIDTH + BALL_RADIUS
      : player2X - BALL_RADIUS;
  }

  /*************************************************************
   * Update ball position
   *************************************************************/
  function updateBall() {
    const vx = Math.cos(ballAngle) * ballSpeed;
    const vy = Math.sin(ballAngle) * ballSpeed;

    ballX += vx;
    ballY += vy;

    // Top/bottom collision
    if (ballY - BALL_RADIUS < 0) {
      ballY = BALL_RADIUS;
      ballAngle = -ballAngle;
    }
    if (ballY + BALL_RADIUS > HEIGHT) {
      ballY = HEIGHT - BALL_RADIUS;
      ballAngle = -ballAngle;
    }

    // Collision with all paddles
    const checkPaddleCollision = (
      paddleX,
      paddleY,
      isPlayer1,
      paddleNumber
    ) => {
      if (
        ballX - BALL_RADIUS <= paddleX + PADDLE_WIDTH &&
        ballX + BALL_RADIUS >= paddleX &&
        ballY + BALL_RADIUS >= paddleY &&
        ballY - BALL_RADIUS <= paddleY + PADDLE_HEIGHT
      ) {
        bounceOffPaddle(isPlayer1, paddleNumber);
        return true;
      }
      return false;
    };

    if (checkPaddleCollision(player1X, player1Y, true, 1)) return;
    if (checkPaddleCollision(player3X, player3Y, true, 3)) return;
    if (checkPaddleCollision(player2X, player2Y, false, 2)) return;
    if (checkPaddleCollision(player4X, player4Y, false, 4)) return;

    // Left boundary
    if (ballX + BALL_RADIUS < 0) {
      player2Score++;
      if (player2Score >= maxScore) {
        isGameOver = true;
      } else {
        resetBall();
      }
    }

    // Right boundary
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
   * Drawing (field, lines, paddles, scoreboard, etc.)
   *************************************************************/
  async function draw() {
    // Background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Optional horizontal line in the middle
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT / 2);
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    // Central dashed vertical line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Player 1 (left, purple for example)
    ctx.fillStyle = "#bb66ff";
    ctx.fillRect(player1X, player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Player 2/AI (right, another color)
    ctx.fillStyle = "#66ffda";
    ctx.fillRect(player2X, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Paddles
    ctx.fillStyle = "#bb66ff"; // Left team (Player 1 and 3)
    ctx.fillRect(player1X, player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    if (mode === "2X2") {
      ctx.fillRect(player3X, player3Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    ctx.fillStyle = "#66ffda"; // Right team (Player 2 and 4)
    ctx.fillRect(player2X, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    if (mode === "2X2") {
      ctx.fillRect(player4X, player4Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    // Scoreboard
    ctx.font = "30px Pixel";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`${player1Score}`, WIDTH * 0.25, HEIGHT - 15);
    ctx.fillText(`${player2Score}`, WIDTH * 0.75, HEIGHT - 15);

    // Player names
    ctx.font = "20px Pixel";
    if (mode === "2X2") {
      ctx.fillText(`${player1}/${player2}`, WIDTH * 0.25, 40);
      ctx.fillText(`${player3}/${player4}`, WIDTH * 0.75, 40);
    } else {
      ctx.fillText(`${player1}`, WIDTH * 0.25, 40);
      ctx.fillText(`${player2}`, WIDTH * 0.75, 40);
    }

    // Game over overlay
    if (isGameOver && !gameOverDisplayed) {
      gameOverDisplayed = true; // Mark that the overlay has been shown

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#fff";
      ctx.font = "36px Pixel";
      ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);

      const winnerText =
        mode === "2X2"
          ? player1Score >= maxScore
            ? `${player1}/${player2} won 🎉`
            : `${player3}/${player4} won 🎉`
          : player1Score >= maxScore
          ? `${player1} won 🎉`
          : `${player2 || "AI"} won 🎉`;
      ctx.font = "24px Pixel";
      ctx.fillText(winnerText, WIDTH / 2, HEIGHT / 2 + 15);

      const canvasStyle = window.getComputedStyle(canvas);
      const canvasScaleX = parseFloat(canvasStyle.width) / LOGICAL_WIDTH;
      const canvasScaleY = parseFloat(canvasStyle.height) / LOGICAL_HEIGHT;

      // Calculate center position relative to displayed canvas
      const centerX = parseFloat(canvasStyle.width) / 2 / canvasScaleX;
      const centerY = parseFloat(canvasStyle.height) / 2 / canvasScaleY;

      // Calculate button positions using canvas coordinates
      const showMenuButton = config.mode !== "tournament";
      const buttonSpacing = 20;

      buttons.restart.x = WIDTH / 2 - 75;
      buttons.restart.y = HEIGHT / 2 + 80;
      buttons.menu.x = WIDTH / 2 + 10;
      buttons.menu.y = HEIGHT / 2 + 80;

      // Adjust positions based on visibility
      if (config.mode === "tournament") {
        buttons.menu.x = WIDTH / 2 - 75;
      } else {
        buttons.restart.x = WIDTH / 2 - 160;
        buttons.menu.x = WIDTH / 2 + 10;
      }

      // Draw buttons using canvas API
      function drawButton(btn, visible = true) {
        if (!visible) return;
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Pixel"; // Changed font size to 20px
        ctx.textAlign = "center";
        ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + 25); // Adjusted text position
      }

      // Only show restart button in non-tournament modes
      drawButton(buttons.restart, config.mode !== "tournament");
      drawButton(buttons.menu, showMenuButton);

      setTimeout(() => {
        const winner = player1Score >= maxScore ? player1 : player2;
        if(config.mode == "tournament")
          config.onGameEnd(winner); // Calls the callback function with the winner
      }, 1000);
      saveResult(player1, player2, player1Score, player2Score, config);
    }
    // Back button
  }

  /*************************************************************
   * Main game loop
   *************************************************************/
  let gameOverDisplayed = false; // Variable to control if the game-over screen has been shown

  function gameLoop() {
    if (!isGameOver) {
      updatePlayer1();
      updatePlayer2();
      if (mode === "2X2") {
        updatePlayer3();
        updatePlayer4();
      }
      if (mode === "singleplayer") updateAI();
      updateBall();
      draw();
      requestAnimationFrame(gameLoop);
    } else if (!gameOverDisplayed) {
      draw(); // Draw the game-over screen one last time
      gameOverDisplayed = true;
    }
  }

  /*************************************************************
   * Keyboard events and "restart" button
   *************************************************************/
  document.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W") wPressed = true;
    if (e.key === "s" || e.key === "S") sPressed = true;
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;
    if (e.key === "a" || e.key === "A") aPressed = true;
    if (e.key === "z" || e.key === "Z") zPressed = true;
    if (e.key === "6") num6Pressed = true;
    if (e.key === "3") num3Pressed = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W") wPressed = false;
    if (e.key === "s" || e.key === "S") sPressed = false;
    if (e.key === "ArrowUp") upPressed = false;
    if (e.key === "ArrowDown") downPressed = false;
    if (e.key === "a" || e.key === "A") aPressed = false;
    if (e.key === "z" || e.key === "Z") zPressed = false;
    if (e.key === "6") num6Pressed = false;
    if (e.key === "3") num3Pressed = false;
  });

  restartBtn.addEventListener("click", () => {
    resetGame();
    restartBtn.style.display = "none";
    gameLoop();
  });

  // New event for the menu button
  menuBtn.addEventListener("click", () => {
    document.querySelector(".game-config").style.display = "block";
    canvas.style.display = "none";
    restartBtn.style.display = "none";
    menuBtn.style.display = "none";
    // Add any additional logic to reset the tournament if needed
  });

  canvas.addEventListener("click", (e) => {
    if (!isGameOver) return;

    // Get canvas-relative coordinates
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX - rect.left) * scaleX) / dpr;
    const y = ((e.clientY - rect.top) * scaleY) / dpr;

    // Check button collisions
    function isInside(pos, btn) {
      return (
        pos.x > btn.x &&
        pos.x < btn.x + btn.w &&
        pos.y > btn.y &&
        pos.y < btn.y + btn.h
      );
    }

    if (isInside({ x, y }, buttons.restart) && config.mode !== "tournament") {
      resetGame();
      gameLoop();
    } else if (
      isInside({ x, y }, buttons.menu) &&
      config.mode !== "tournament"
    ) {
      document.querySelector(".game-config").style.display = "block";
      canvas.style.display = "none";
      resetGame();
    }
  });

  /*************************************************************
   * Initialize the game
   *************************************************************/
  resetGame();
  gameLoop();
}

async function saveResult(
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  config
) {
  let gameType = config.mode;
  const userId = CookieManager.getCookie("userId");
  if (!userId) {
    return;
  }

  if (gameType.toUpperCase() == "TOURNAMENT") {
    if (player1Name != config.userPlayer && player1Name != config.userPlayer)
      return;

    if (player2Name == config.userPlayer) {
      swap = player1Name;
      player1Name = player2Name;
      player2Name = player1Name;
    }
  }

  if (gameType === "2X2") {
    player1Name = `${config.player1}/${config.player2}`;
    player2Name = `${config.player3}/${config.player4}`;
  }

  const requestBody = {
    user: player1Name,
    opponent: player2Name,
    user_score: player1Score,
    opponent_score: player2Score,
    game_type: gameType.toUpperCase(),
    tournament_name: config.tournamentName,
  };

  try {
    const response = await fetch("/api/scores/add/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await tokenManager.getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), 
    });

    if (!response.ok) {
      throw new Error("Failed to save game result");
    }
  } catch (error) {}
}

/*************************************************************
 * Initialize the game menu
 *************************************************************/

async function loadGameMenu() {
  let data = await loadPersonalInfo();
  let player1Input = document.getElementById("player1");
  let playerTournamentInput = document.getElementById("newPlayer");

  player1Input.value = data.username; // Set the field value to the username
  player1Input.disabled = true; // Disable the field for editing

  playerTournamentInput.value = data.username;
}

window.game = game;
window.loadGameMenu = loadGameMenu;
window.startTournament = startTournament;
