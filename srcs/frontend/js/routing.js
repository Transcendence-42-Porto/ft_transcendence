
function routing() {
    // Função que carrega o conteúdo HTML dentro de #app baseado no endpoint
    console.log("[routing.js] script loaded");

    function loadContentBasedOnUrl() {
        // Pega a URL atual
        const url = window.location.pathname;
        console.log(`[routing.js] URL: ${url}`);
        console.log(url);
        // Verifica se a URL é a raiz
        if (url === "/") {
            // Carrega o conteúdo da página inicial
            loadContent("login");
        } else if (url === "/profile") {
            loadContent("profile");
        }
        else {
            // Carrega o conteúdo baseado na URL
            const endpoint = url.replace("/", "");
            loadContent(endpoint);
        }
    }

    loadContentBasedOnUrl();
};

function loadContent(endpoint) {
    // Pega o elemento #app
    const app = document.getElementById("app");

    // Faz a requisição fetch para o arquivo HTML dentro da pasta 'html'
    fetch(`/html/${endpoint}.html`)  // Aponta diretamente para o arquivo correto
        .then(response => {
            if (response.ok) {
                return response.text();  // Se a resposta for ok, trata como texto (HTML)
            }
            throw new Error('Erro ao carregar o conteúdo');
        })
        .then(html => {
            // Insere o conteúdo HTML dentro de #app
            app.innerHTML = html;
        })
        .catch(error => {
            console.error(`[routing.js] ${error}`);
        });
}
