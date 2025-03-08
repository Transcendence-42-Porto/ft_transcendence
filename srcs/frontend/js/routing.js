function routing() {
    console.log("[routing.js] script loaded");
    loadContentBasedOnUrl();
};

function loadContentBasedOnUrl() {
    const url = window.location.pathname;
    console.log(`[routing.js] URL: ${url}`);
    
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
            throw new Error('Error to load content');
        })
        .then(html => {
            app.innerHTML = html;

            switch (endpoint) {
                case "profile":
                    history.pushState({}, '', '/profile');
                    loadProfile();
                    loadEditProfile();
                    break;
                case "menu":
                    history.pushState({}, '', '/menu');
                    loadMenu();
                    break;
                case "login":
                    history.pushState({}, '', '/login');
                    break;
                case "signup":
                    history.pushState({}, '', '/signup');
                    break;
                case "game":
                    history.pushState({}, '', '/game');
                    initializeGameForm();
                    loadGameMenu();
                    break;
            }
        })
        .catch(error => {
            history.pushState({}, '', '/login');
            loadContent('login');
        });
}
