function initializeGameForm() {
  const modeButtons = document.querySelectorAll(".mode-btn");
  const player1Group = document.getElementById("player1").parentElement;
  const player2Group = document.getElementById("player2Group");
  const player3Group = document.getElementById("player3Group");
  const player4Group = document.getElementById("player4Group");
  const difficultyGroup = document.getElementById("difficultyGroup");
  const tournamentGroup = document.getElementById("tournamentGroup");
  const form = document.getElementById("gameSettings");

  // Toggle modes
  function toggleMode(mode) {
      modeButtons.forEach((btn) => btn.classList.remove("active"));
      const activeBtn = Array.from(modeButtons).find(
          (btn) => btn.dataset.mode === mode
      );
      activeBtn.classList.add("active");

      // Toggle visibility and requirements
      player1Group.style.display = mode === "tournament" ? "none" : "block";
      document.getElementById("player1").required = mode !== "tournament";
      
      player2Group.style.display = (mode === "multiplayer" || mode === "2X2") ? "block" : "none";
      document.getElementById("player2").required = (mode === "multiplayer" || mode === "2X2");
      
      player3Group.style.display = mode === "2X2" ? "block" : "none";
      document.getElementById("player3").required = mode === "2X2";
      
      player4Group.style.display = mode === "2X2" ? "block" : "none";
      document.getElementById("player4").required = mode === "2X2";
      
      difficultyGroup.style.display = mode === "singleplayer" ? "block" : "none";
      tournamentGroup.style.display = mode === "tournament" ? "block" : "none";
  }
  
    modeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleMode(btn.dataset.mode);
      });
    });
  
    toggleMode("singleplayer");

    const addPlayerBtn = document.getElementById("addPlayer");
    const newPlayerInput = document.getElementById("newPlayer");
    const playerList = document.getElementById("playerList");
    let tournamentPlayers = [];

    addPlayerBtn.addEventListener("click", () => {
      const name = newPlayerInput.value.trim();
      
      if (name) {
        if (tournamentPlayers.includes(name)) {
          alert("This player is already in the tournament!");
        } else if (tournamentPlayers.length < 4) {
          tournamentPlayers.push(name);
          updatePlayerList();

          newPlayerInput.value = "";

          if (tournamentPlayers.length === 4) {
            addPlayerBtn.disabled = true;
          }
        }
      }
    });
  
    function updatePlayerList() {
      playerList.innerHTML = tournamentPlayers
        .map(
          (player, index) => `
          <div class="player-tag" style="display: inline-block; margin-right: 5px; margin-bottom: 5px;">
            ${player}
            <span class="remove-player" onclick="removePlayer(${index})">×</span>
          </div>
        `
        )
        .join("");
  
      if (tournamentPlayers.length > 4) {
        const playerTags = playerList.querySelectorAll(".player-tag");
        playerTags[4].style.display = "inline-block";
        playerTags[4].style.marginTop = "5px";
      }
    }
  
    window.removePlayer = (index) => {
      tournamentPlayers.splice(index, 1);
      updatePlayerList();
    };
  
    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = document.querySelector(".mode-btn.active").dataset.mode;
      const maxScore = 1; // set to 1 for testing
      // const maxScore = parseInt(document.getElementById("maxScore").value);
      const speedIncrement = document.getElementById("speedIncrement").value === "True";
      const player1 = document.getElementById("player1").value.trim();
      const player2 = document.getElementById("player2").value.trim();
      const player3 = mode === "2X2" ? document.getElementById("player3").value.trim() : "";
      const player4 = mode === "2X2" ? document.getElementById("player4").value.trim() : "";
      
      // Validações

      if (mode === "tournament") {
        const tournamentName = document.getElementById("tournamentName").value.trim();
    
        if (!tournamentName) {
          alert("Tournament name is required!");
          return;
        }

        if (tournamentPlayers.length < 4) {
            alert("Minimum 4 players required for tournament!");
            return;
        }
        startTournament(tournamentPlayers);
      } else {
          const config = {
              mode,
              maxScore,
              player1,
              player2: mode === "singleplayer" ? "CPU" : player2,
              difficulty: document.getElementById("difficulty").value,
              speedIncrement
          };

          // Adiciona jogadores 3 e 4 para o modo 2X2
          if (mode === "2X2") {
              config.player3 = player3;
              config.player4 = player4;
          }

          document.querySelector(".game-config").style.display = "none";
          document.getElementById("gameCanvas").style.display = "block";
          document.getElementById("restartBtn").style.display = "block";
          game(config);
      }
    });
  }
  
  window.initializeGameForm = initializeGameForm;

