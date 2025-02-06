function routing() {
  console.log("[routing.js] script loaded");

  function loadContentBasedOnUrl() {
    const url = window.location.pathname;
    console.log(`[routing.js] URL: ${url}`);
    if (url === "/") {
      loadContent("menu");
    } else {
      const endpoint = url.replace("/", "");
      loadContent(endpoint);
    }
  }

  loadContentBasedOnUrl();
}

function loadContent(endpoint) {
  const app = document.getElementById("app");

  fetch(`/html/${endpoint}.html`)
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      throw new Error("Erro ao carregar o conteúdo");
    })
    .then((html) => {
      app.innerHTML = html;
      if (endpoint === "game") {
        initializeGameForm();
      }
    })
    .catch((error) => {
      console.error(`[routing.js] ${error}`);
    });
}
