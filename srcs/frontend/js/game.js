function initGame() {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
      console.error("Canvas não encontrado!");
      return;
    }
    const ctx = canvas.getContext("2d");
  
    // Exemplo de animação simples
    let x = 50;
    let y = 50;
    let dx = 2;
    let dy = 2;
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(x, y, 20, 20);
      x += dx;
      y += dy;
      if (x <= 0 || x + 20 >= canvas.width) dx *= -1;
      if (y <= 0 || y + 20 >= canvas.height) dy *= -1;
      requestAnimationFrame(draw);
    }
  
    draw();
  }
  