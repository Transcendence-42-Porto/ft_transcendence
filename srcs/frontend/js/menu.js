// file: /js/menu.js
function showSingleplayerForm() {
	document.getElementById("singleplayerForm").style.display = "block";
	document.getElementById("multiplayerForm").style.display = "none";
  }
  
  function showMultiplayerForm() {
	// Show multiplayer form, hide singleplayer form
	document.getElementById("singleplayerForm").style.display = "none";
	document.getElementById("multiplayerForm").style.display = "block";
  }
  
  function startSingleplayer() {
	const name = document.getElementById("spPlayerName").value.trim();
	const difficulty = document.getElementById("spDifficulty").value;
	const maxScore = parseInt(document.getElementById("spMaxScore").value, 10);
  
	// Validate
	if (!name || name.length === 0 || name.length > 7) {
	  alert("Player name must be 1 to 7 chars long");
	  return;
	}
  
	let aiVision = 1000; // default easy
	if (difficulty === "medium") aiVision = 500;
	else if (difficulty === "hard") aiVision = 0;
  
	// Store config in a global var
	window.gameConfig = {
	  mode: "single",
	  player1Name: name,
	  aiVisionInterval: aiVision,
	  maxScore: maxScore
	};
  
	// Now load the actual game
	loadContent("game");
  }
  
  function startMultiplayer() {
	const p1Name = document.getElementById("mpPlayer1Name").value.trim();
	const p2Name = document.getElementById("mpPlayer2Name").value.trim();
	const maxScore = parseInt(document.getElementById("mpMaxScore").value, 10);
  
	// Validate each
	if (!p1Name || p1Name.length === 0 || p1Name.length > 7) {
	  alert("Player 1 name must be 1 to 7 chars long");
	  return;
	}
	if (!p2Name || p2Name.length === 0 || p2Name.length > 7) {
	  alert("Player 2 name must be 1 to 7 chars long");
	  return;
	}
  
	// Store config
	window.gameConfig = {
	  mode: "multi",
	  player1Name: p1Name,
	  player2Name: p2Name,
	  maxScore: maxScore
	};
  
	// Now load the actual game
	loadContent("game");
  }
  
async function loadMenu(){
    let data = await loadPersonalInfo();
    const profilePic = data.avatar ? data.avatar : getRandomAvatar();
    document.getElementById('profilePic').src = profilePic;
}

window.loadMenu = loadMenu;
