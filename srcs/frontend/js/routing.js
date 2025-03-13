function routing() {
    loadContentBasedOnUrl();
};

function loadContentBasedOnUrl() {
    const url = window.location.pathname;
    
    if (url === "/") {
        loadContent("login");
    } else {
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
            if(endpoint == "game")
              {
                  history.pushState({}, '', '/game');
                  initializeGameForm();
                  loadGameMenu();
              }
        })
        .catch(error => {
        });
}
