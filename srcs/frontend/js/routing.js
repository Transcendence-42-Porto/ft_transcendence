
function routing() {
    // Função que carrega o conteúdo HTML dentro de #app baseado no endpoint
    console.log("[routing.js] script loaded");
    loadContentBasedOnUrl();
};

function loadContentBasedOnUrl() {
    // Pega a URL atual
    const url = window.location.pathname;
    console.log(`[routing.js] URL: ${url}`);
    
    // Verifica se a URL é a raiz
    if (url === "/") {
        // Carrega o conteúdo da página inicial
        loadContent("login");
    } else {
        // Carrega o conteúdo baseado na URL
        const endpoint = url.replace("/", "");
        loadContent(endpoint);
    }
}

function loadContent(endpoint) {
    const app = document.getElementById("app");

    fetch(`/html/${endpoint}.html`)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Erro ao carregar o conteúdo');
        })
        .then(html => {
            app.innerHTML = html;

            if(endpoint == "profile")
            {
                history.pushState({}, '', '/profile');
                loadProfile();
                loadEditProfile();
            }
            if(endpoint == "menu")
            {
                history.pushState({}, '', '/menu');
                loadMenu();
            }
            if(endpoint == "login")
            {
                history.pushState({}, '', '/login');
            }
            if(endpoint == "signup")
            {
                history.pushState({}, '', '/signup');
            }
        })
        .catch(error => {
            console.error(`[routing.js] ${error}`);
        });
}
