document.addEventListener('DOMContentLoaded', function() {

    console.log("[base.js] script loaded");
    routing();
});

window.addEventListener("popstate", () => {
    console.log("[routing.js] popstate event triggered");
    loadContentBasedOnUrl();
});