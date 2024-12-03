document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById("app");

    function updateCSS() {
        var link = document.getElementById('dynamic-css');
        link.href = './css/popup.css?v=' + new Date().getTime(); // Adiciona um parâmetro únic
    }

    console.log("[base.js] script loaded");

    updateCSS();
    routing();
});

function clicar()   {
    console.log("Clicou");
}