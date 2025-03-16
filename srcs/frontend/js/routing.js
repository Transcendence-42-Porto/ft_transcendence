function routing() {
    loadContentBasedOnUrl();
  
    // Add a listener for the popstate event
    window.addEventListener("popstate", () => {
      loadContentBasedOnUrl();
    });
  }
  
  function loadContentBasedOnUrl() {
    const url = window.location.pathname;
    const endpoint = url === "/" ? "login" : url.replace("/", "");
  
    // Check if the user is authenticated before loading protected pages
    if (!isAuthenticated()) {
      loadContent("login");
    } else {
      loadContent(endpoint, false);
    }
  }
  
  function loadContent(endpoint, pushState = true) {
    const app = document.getElementById("app");
  
    fetch(`/html/${endpoint}.html`)
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Error loading content");
      })
      .then((html) => {
        app.innerHTML = html;
  
        if (pushState) {
          history.pushState({}, "", `/${endpoint}`);
        }
  
        if (endpoint == "profile") {
          loadProfile();
          loadEditProfile();
        }
        if (endpoint == "menu") {
          loadMenu();
        }
        if (endpoint == "game") {
          initializeGameForm();
          loadGameMenu();
        }
      })
      .catch(() => {
        history.pushState({}, "", "/login");
        loadContent("login", false);
      });
  }
  
  // Function to check if the user is authenticated
  function isAuthenticated() {
    const accessToken = sessionStorage.getItem("accessToken");
    if(!accessToken) {
      return false;
    }
    return true;
  }
  
//   // Define which pages require authentication
//   function isProtectedRoute(endpoint) {
//     const protectedRoutes = ["game", "profile", "menu"];
//     return protectedRoutes.includes(endpoint);
//   }
