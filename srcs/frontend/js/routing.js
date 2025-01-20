function loadContent(endpoint) {
    const app = document.getElementById("app");
    fetch(`./html/${endpoint}.html`)
      .then(response => {
        if (!response.ok) throw new Error("Erro ao carregar o HTML");
        return response.text();
      })
      .then(html => {
        // Injeta o HTML no DOM
        app.innerHTML = html;
  
        // Se for a página do jogo, carrega dinamicamente o script e chama initGame()
        if (endpoint === "game") {
          loadGameScriptAndInit();
        }
      })
      .catch(error => console.error(error));
  }
  
  function loadGameScriptAndInit() {
    // Cria uma <script> que aponta para game.js
    const script = document.createElement("script");
    script.src = "./js/game.js";
  
    // Quando terminar de carregar, chama initGame()
    script.onload = () => {
      if (typeof initGame === "function") {
        initGame();
      } else {
        console.error("Função initGame() não foi encontrada em game.js!");
      }
    };
  
    // Adiciona a <script> ao <body> (ou <head>)
    document.body.appendChild(script);
  }
  
  // Exemplo: Carregando o 'game.html' logo ao iniciar
  document.addEventListener("DOMContentLoaded", () => {
    loadContent("game");
  });
  