const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//definiranje konstanti
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_TOTAL = 50;

const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 20;

const BRICK_GAP_X = 30;
const BRICK_GAP_Y = 15;
const BRICK_OFFSET_TOP = 80;
const BRICK_OFFSET_LEFT = 40;

const BALL_SIZE = 10;
const PADDLE_WIDTH = 90;
const PADDLE_HEIGHT = 20;

const BALL_SPEED = 4;

const BRICK_COLORS = [
    "rgb(153, 51, 0)",
    "rgb(255, 0, 0)",
    "rgb(255, 153, 204)",
    "rgb(0, 255, 0)",
    "rgb(255, 255, 153)"
];

let bricks = [];
let ball = { x: 0, y: 0, dx: 0, dy: 0 }; //lopta ima koordinate i pomak odnosno brzinu
let paddle = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: canvas.height - 40 };

//inicijalizacija varijabli
let score = 0;
let bestScore = parseInt(localStorage.getItem("bestScore") || "0");
let gameStarted = false;
let gameOver = false;
let win = false;




function initBricks() {
    bricks = [];
    for (let i = 0; i < BRICK_ROWS; i++) { //iteracija kroz redove
        for (let j = 0; j < BRICK_COLS; j++) { //iteracija kroz stupce
            const x = BRICK_OFFSET_LEFT + j * (BRICK_WIDTH + BRICK_GAP_X); //pozicija prve plus pozicija j-te u retku
            const y = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_GAP_Y); //pozicija prve plus pozicija i-te u stupcu
            bricks.push({ x, y, w: BRICK_WIDTH, h: BRICK_HEIGHT, hit: false, color: BRICK_COLORS[i] }); //u listu dodajem sve atribute cigle
        }
    }
}

function resetBall() {
    ball.x = paddle.x + PADDLE_WIDTH / 2 - BALL_SIZE / 2;
    ball.y = paddle.y - BALL_SIZE; //loptica se vraca na pocetnu poziciju
    const dir = Math.random() < 0.5 ? -1 : 1; //slucajni smjer loptice lijevo ili desno
    ball.dx = BALL_SPEED * dir;
    ball.dy = -BALL_SPEED; //loptica uvijek pocinje prema gore
} //dx i dy su jednaki pa se lotpica krece pod 45 stupnjeva

initBricks();
resetBall();


//provjera je li tipka pritisnuta, space zapocinje igru
let keys = {};
document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (!gameStarted && e.key === " ") gameStarted = true;
});
document.addEventListener("keyup", e => keys[e.key] = false);



function drawBrick(b) {
    if (b.hit) return; //ako je cigla pogodena ne iscrtava se
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawPaddle() {
    ctx.fillStyle = "lightgray";
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBall() {
    ctx.fillStyle = "white";
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
}

function drawScores() {
    ctx.fillStyle = "white";
    ctx.font = "20px Helvetica";
    ctx.textBaseline = "top";

    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 20);

    ctx.textAlign = "right";
    ctx.fillText("Best: " + bestScore, canvas.width - 100, 20);
}

function drawStartScreen() {
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BREAKOUT", canvas.width / 2, canvas.height / 2);

    ctx.font = "italic bold 18px Helvetica";
    ctx.fillText("Press SPACE to begin", canvas.width / 2, canvas.height / 2 + 18 + 9 + 10);
}

function drawEndScreen(text) {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 40px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

//logika igre
function update() {
    if (!gameStarted) return;
    if (gameOver || win) return;

    if (keys["ArrowLeft"]) paddle.x -= 5; //pomicanje paddle-a ovisno o pritisnutoj tipki
    if (keys["ArrowRight"]) paddle.x += 5;

    paddle.x = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, paddle.x)); //paddle ne moze izaci iz ekrana

    ball.x += ball.dx; //kretanje loptice
    ball.y += ball.dy;

    //pazi da loptica ne prode kroz zid nego da se odbije
    if (ball.x < 0 || ball.x + BALL_SIZE > canvas.width) ball.dx *= -1;
    if (ball.y < 0) ball.dy *= -1;

    //ako loptica padne kroz dno ekrana igra je gotova
    if (ball.y > canvas.height) {
        gameOver = true;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);
        }
    }

    //ako je loptica unutar pozicija paddle-a, odbija se 
    if (ball.x < paddle.x + PADDLE_WIDTH && ball.x + BALL_SIZE > paddle.x && ball.y + BALL_SIZE > paddle.y) {
        ball.dy *= -1; //mijenja smjer po y osi
        ball.y = paddle.y - BALL_SIZE; //pocetni odmak loptice od paddle-a
    }

    
    for (let b of bricks) {
        if (b.hit) continue; //preskace crtanje ako je cigla vec pogodena

        if (ball.x < b.x + b.w && ball.x + BALL_SIZE > b.x && ball.y < b.y + b.h && ball.y + BALL_SIZE > b.y) {
            b.hit = true; //ako je loptica unutar pozicija cigle, cigla je pogodena
            score++; 
            ball.dy *= -1; //mijenja smjer po y osi
            if (score === BRICK_TOTAL) win = true; //ako su sve cigle pogođene, igrac je pobijedio
        }
    }
}


function loop() { //beskonačna petlja igre
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (!gameStarted) {
        drawStartScreen(); //ako jos nismo poceli, vidimo pocetni ekran
        requestAnimationFrame(loop);
        return;
    }

    if (gameOver) {
        drawEndScreen("GAME OVER"); //ako je igra gotova, vidimo ekran za kraj igre
        drawScores();
        requestAnimationFrame(loop);
        return;
    }

    if (win) {
        drawEndScreen("YOU WIN!"); //ako je igrac pobijedio, vidimo ekran s porukom o pobjedi
        drawScores();
        requestAnimationFrame(loop);
        return;
    }

    drawScores();

    ctx.shadowColor = "rgba(57, 52, 52, 1)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5; //3d efekt
    bricks.forEach(drawBrick);
    drawPaddle();
    drawBall();
    ctx.shadowColor = "transparent";

    update();
    requestAnimationFrame(loop);
}

loop();

