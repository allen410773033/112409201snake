const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const leaderboardElement = document.getElementById("leaderboard");

// 設置遊戲畫布大小
const scale = 20;
const rows = 400 / scale;
const columns = 400 / scale;

// 遊戲狀態
let snake;
let direction;
let food;
let gameInterval;
let isGameOver;
let obstacles;
let score;
let gameSpeed;
let startTime; // 如果需要計時器
let timerInterval; // 如果需要計時器

// *** 將 initGame() 函數的完整定義貼到這裡 ***
function initGame() {
    canvas.width = 400;
    canvas.height = 400;
    snake = [ { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 } ];
    direction = "RIGHT";
    food = generateFood();
    obstacles = generateObstacles(5);
    score = 0;
    gameSpeed = 100;
    isGameOver = false;
    scoreDisplay.textContent = `分數: ${score}`;
    timerDisplay.textContent = `時間: 0 秒`;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    startButton.disabled = false;
}

// Firebase 設定
const firebaseConfig = { ... };
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

// 從 Firebase 載入排行榜資料並顯示
function loadLeaderboard() {
    // ... loadLeaderboard() 函數的內容
}

// 啟動遊戲
function startGame() {
    initGame();
    // ... startGame() 函數的內容
}

// 更新計時器 (如果需要)
function updateTimer() {
    if (!isGameOver && startTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsedTime = currentTime - startTime;
        timerDisplay.textContent = `時間: ${elapsedTime} 秒`;
    }
}

// 遊戲邏輯
function gameLoop() {
    if (isGameOver) return; // 如果遊戲結束，停止循環

    moveSnake();
    if (checkCollision() || checkObstacleCollision() || checkBottomBorderCollision()) {
        gameOver();
    }
    if (checkFoodCollision()) {
        snake.push({});
        food = generateFood();
        score += 10; // 每吃到一次食物增加分數
        scoreDisplay.textContent = `分數: ${score}`; // 更新顯示
        gameSpeed = Math.max(50, gameSpeed - 5); // 提升遊戲速度
        clearInterval(gameInterval); // 清除舊的遊戲循環
        gameInterval = setInterval(gameLoop, gameSpeed); // 更新遊戲速度
    }

    draw();
    drawScore(); // 顯示得分
    drawObstacles(); // 繪製障礙物
}

// ... (其餘的遊戲邏輯函數：moveSnake, draw, generateFood, generateObstacles, drawObstacles, drawScore, checkCollision, checkObstacleCollision, checkBottomBorderCollision, checkFoodCollision, gameOver, formatPlayTime)
// 移動蛇
function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case "LEFT":
            head.x -= 1;
            break;
        case "RIGHT":
            head.x += 1;
            break;
        case "UP":
            head.y -= 1;
            break;
        case "DOWN":
            head.y += 1;
            break;
    }

    snake.unshift(head);
    snake.pop();
}

// 繪製遊戲畫面
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "green" : "white";
        ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    });

    // 繪製食物
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * scale, food.y * scale, scale, scale);

    // 繪製藍色下邊界
    ctx.fillStyle = "blue"; // 設置顏色為藍色
    ctx.fillRect(0, canvas.height - scale, canvas.width, scale); // 繪製下邊界
}

// 生成隨機食物
function generateFood() {
    let foodX, foodY;
    let foodCollision = true;

    // 重複生成食物，直到它不和蛇身重疊
    while (foodCollision) {
        foodX = Math.floor(Math.random() * columns);
        foodY = Math.floor(Math.random() * rows);

        foodCollision = false;

        // 檢查食物是否和蛇身的任何部分重疊
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                foodCollision = true;
                break;
            }
        }
    }

    return { x: foodX, y: foodY };
}

// 生成指定數量的障礙物
function generateObstacles(num) {
    const obstacles = [];
    for (let i = 0; i < num; i++) {
        const x = Math.floor(Math.random() * columns);
        const y = Math.floor(Math.random() * rows);
        obstacles.push({ x, y });
    }
    return obstacles;
}

// 繪製障礙物
function drawObstacles() {
    ctx.fillStyle = "yellow"; // 改為黃色障礙物
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * scale, obstacle.y * scale, scale, scale);
    });
}

// 繪製得分
function drawScore() {
    ctx.fillStyle = "white"; // 設定分數顏色為白色
    ctx.font = "20px Arial";
    ctx.fillText(`分數: ${score}`, 10, 30); // 顯示分數
}

// 檢查蛇是否撞牆或自己
function checkCollision() {
    const head = snake[0];

    // 撞牆
    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
        return true;
    }

    // 撞自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 檢查蛇是否撞到障礙物
function checkObstacleCollision() {
    const head = snake[0];
    return obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y);
}

// 檢查蛇是否碰到藍色下邊界
function checkBottomBorderCollision() {
    const head = snake[0];
    return head.y === rows; // 撞到下邊界
}

// 檢查蛇是否吃到食物
function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// 改變蛇的移動方向
document.addEventListener("keydown", (event) => {
    if (isGameOver) return; // 遊戲結束後，禁止變更方向

    switch (event.key) {
        case "ArrowLeft":
            if (direction !== "RIGHT") direction = "LEFT";
            break;
        case "ArrowRight":
            if (direction !== "LEFT") direction = "RIGHT";
            break;
        case "ArrowUp":
            if (direction !== "DOWN") direction = "UP";
            break;
        case "ArrowDown":
            if (direction !== "UP") direction = "DOWN";
            break;
    }
});

// 遊戲結束處理
function gameOver() {
    isGameOver = true;
    alert("遊戲結束!");
    startButton.disabled = false;

    //  ===  新增：取得玩家名稱並儲存分數到 Firebase  ===
    const playerName = prompt("請輸入你的名字：");
    if (playerName) {
        const scoresRef = firebase.database().ref('scores'); //  資料庫中的 'scores' 路徑
        scoresRef.push({
            name: playerName,
            score: score
        });
    }
}

// 從 Firebase 載入排行榜資料並顯示
function loadLeaderboard() {
    const leaderboardQuery = firebase.database().ref('scores').orderByChild('score').limitToLast(10);

    leaderboardQuery.on('value', (snapshot) => {
        const scoresData = snapshot.val();
        const leaderboardEntries = [];

        if (scoresData) {
            for (const key in scoresData) {
                leaderboardEntries.push(scoresData[key]);
            }

            // 依照分數降序排序
            leaderboardEntries.sort((a, b) => b.score - a.score);

            // 清空現有的排行榜
            leaderboardElement.innerHTML = '';

            // 顯示排行榜
            leaderboardEntries.forEach(entry => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="leaderboard-info">${entry.name} - 分數: ${entry.score}</span>
                    <span class="leaderboard-time">時間: ${formatPlayTime(entry.playTime)} (${entry.saveTime})</span>
                `;
                leaderboardElement.appendChild(listItem);
            });
        } else {
            leaderboardElement.innerHTML = '<li>目前沒有排行榜記錄</li>';
        }
    });
}

function formatPlayTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// 初始化遊戲並載入排行榜
initGame();
loadLeaderboard();

// 開始遊戲按鈕事件監聽
startButton.addEventListener("click", startGame);
