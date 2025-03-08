document.addEventListener('DOMContentLoaded', function() {
    routing();
});

window.addEventListener("popstate", () => {
    loadContentBasedOnUrl();
});