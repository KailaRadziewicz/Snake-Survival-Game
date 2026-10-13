"use strict";
window.onload = function () {
    let snakeImg = new Image();
    let bombImg = new Image();
    let appleImg = new Image();

    snakeImg.src = "snake.png";
    bombImg.src = "bomb.png";
    appleImg.src = "apple.png";


    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.style.backgroundColor = "gray";


    let snake = {
        width: 150,
        height: 150,
        //start snake in middle of screen.
        x: canvas.width / 2,
        y: canvas.height / 2
    }

    let apple = {
        width: 100,
        height: 100,
        x: canvas.width / 2,
        y: canvas.height / 2,
        active: false
    }

    function moveApple() { 
        apple.x = Math.random() * (canvas.width - apple.width);
        apple.y = Math.random() * (canvas.height - apple.height);
        apple.active = true;
    }

    moveApple();

    const numberOfBombs = 8; 
    let bombs = [];

    function createBomb() {
        return {
            width: 100,
            height: 100,
            //random spot but far enough from the bottom and right edges.

            x: 50+ Math.random() * (canvas.width - 100),
            y: Math.random() * (canvas.height - 100)
        };
    }
    
    for (let i = 0; i < numberOfBombs; i++) {
        bombs.push(createBomb());
    }

    let gameOver = false;
    let score = 0;
    let scoreTime = performance.now();
    let level = 1;
    let bombSpeed = 3;

    function isColliding(a, b) {
        let pad = 50;
        return a.x + pad < b.x + b.width - pad &&
            a.x + a.width - pad > b.x + pad &&
            a.y + pad < b.y + b.height - pad &&
            a.y + a.height - pad > b.y + pad;
    }
    
    let highScore = localStorage.getItem("snakeHighScore") || 0; 

    function checkHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
        }
    }

    function update(bomb) {
        if (gameOver) return;

        if (isColliding(snake, bomb)) {
            gameOver = true;
            checkHighScore();
            return; 
        }

        if (bomb.x > snake.x) {
            bomb.x -= bombSpeed;
        } else if (bomb.x < snake.x) {
            bomb.x += bombSpeed;
        }

        if (bomb.y > snake.y) {
            bomb.y -= bombSpeed;
        } else if (bomb.y < snake.y) {
            bomb.y += bombSpeed;
        }
    }

    function levelUp() {
        level += 1;
        bombs.push(createBomb());
        bombs.push(createBomb());
        bombs.push(createBomb());
    }

    function updateApple() {
        if (!apple.active) { 
            return;
        }

        if (isColliding(snake, apple)) {
            score += 10;
            checkHighScore();
            moveApple();
          
            if (score >= level * 50) {
                levelUp();
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(snakeImg, snake.x, snake.y, snake.width, snake.height);

        if (apple.active) {
            ctx.fillStyle = "red";
            ctx.drawImage(appleImg, apple.x, apple.y, apple.width, apple.height);
        }

        bombs.forEach(b => {
            ctx.drawImage(bombImg, b.x, b.y, b.width, b.height);
        });

        ctx.fillStyle = "purple";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + score, 40, 50);

        ctx.textAlign = "center";
        ctx.fillText("High Score: " + highScore, canvas.width / 2, 50);

        ctx.textAlign = "right";
        ctx.fillText("Level: " + level, canvas.width - 40, 50);


        if (gameOver) {
            let text = "gameover, press space to play again";
            ctx.font = "bold 40px Arial"
            ctx.textAlign = "center";

            let metrics = ctx.measureText(text);
            let paddingX = 30;
            let paddingY = 20;

            let boxWidth = metrics.width + paddingX * 2;
            let boxHeight = 40 + paddingY * 2; 

            let boxX = (canvas.width / 2) - (boxWidth / 2);
            let boxY = (canvas.height / 2) - (boxHeight / 2);

            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            ctx.strokeStyle = "purple";
            ctx.lineWidth = 4;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = "white";
            ctx.textBaseline = "middle";
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        }
    }
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && gameOver) {
            restartGame();
        }
    });

    function restartGame() {
        gameOver = false;
        score = 0;
        level = 1;
        bombSpeed = 3;
        scoreTime = performance.now(); 

        snake.x = canvas.width / 2;
        snake.y = canvas.height / 2;

        bombs = []
        for (let i = 0; i < numberOfBombs; i++) {
            bombs.push(createBomb());
        }
        moveApple();
    }

    document.addEventListener("mousemove", (e) => {
        snake.x = e.clientX - (snake.width / 2);
        snake.y = e.clientY - (snake.height / 2);
    });

    function animate(timestamp) {
        if (!gameOver) {
            bombs.forEach(b => update(b)); 
            updateApple();

            if (timestamp - scoreTime >= 1000) {
                score++;
                scoreTime = timestamp;
            }
        }
        draw();
        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
}





