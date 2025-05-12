import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, orderByChild, limitToLast } from "firebase/database";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const leaderboardElement = document.getElementById("leaderboard");

// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyClCiMATI27RbmaCcgWxrpEQXJjT5FSbic",
    authDomain: "snake-game-909b0.firebaseapp.com",
    databaseURL: "https://snake-game-909b0-default-rtdb.firebaseio.com",
    projectId: "snake-game-909b0",
    storageBucket: "snake-game-909b0.firebasestorage.app",
    messagingSenderId: "382031762505",
    appId: "1:382031762505:web:7cd5f06de4f283d0071b98"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const scoresRef = ref(database, 'scores');

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
let startTime;
let timerInterval;

// 初始化遊戲
function initGame() {
    canvas.width = 400;
    canvas.height = 400;
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
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

// 啟動遊戲
function startGame() {
    initGame();
    startButton.disabled = true;
    startTime = Math.floor(Date.now() / 1000); // 記錄開始時間（秒）
    gameInterval = setInterval(gameLoop, gameSpeed);
    timerInterval = setInterval(updateTimer, 1000); // 每秒更新計時器
}

// 更新計時器
function updateTimer() {
    if (!isGameOver && startTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsedTime = currentTime - startTime;
        timerDisplay.textContent = `時間: ${elapsedTime} 秒`;
    }
}

// 遊戲邏輯
function gameLoop() {
    if (isGameOver) return;

    moveSnake();
    if (checkCollision() || checkObstacleCollision() || checkBottomBorderCollision()) {
        gameOver();
    }
    if (checkFoodCollision()) {
        snake.push({});
        food = generateFood();
        score += 10;
        scoreDisplay.textContent = `分數: ${score}`;
        gameSpeed = Math.max(50, gameSpeed - 5);
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }

    draw();
    drawObstacles();
}

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
    ctx.fillStyle = "blue";
    ctx.fillRect(0, canvas.height - scale, canvas.width, scale);
}

// 生成隨機食物
function generateFood() {
    let foodX, foodY;
    let foodCollision = true;

    while (foodCollision) {
        foodX = Math.floor(Math.random() * columns);
        foodY = Math.floor(Math.random() * rows);

        foodCollision = false;

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
        let obstacleCollision = true;
        let x, y;
        while (obstacleCollision) {
            x = Math.floor(Math.random() * columns);
            y = Math.floor(Math.random() * rows);
            obstacleCollision = snake.some(segment => segment.x === x && segment.y === y) || (food.x === x && food.y === y);
            if (!obstacleCollision) {
                obstacles.push({ x, y });
            }
        }
    }
    return obstacles;
}

// 繪製障礙物
function drawObstacles() {
    ctx.fillStyle = "yellow";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * scale, obstacle.y * scale, scale, scale);
    });
}

// 檢查蛇是否撞牆或自己
function checkCollision() {
    const head = snake[0];
    return head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows ||
           snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

// 檢查蛇是否撞到障礙物
function checkObstacleCollision() {
    const head = snake[0];
    return obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y);
}

// 檢查蛇是否碰到藍色下邊界
function checkBottomBorderCollision() {
    const head = snake[0];
    return head.y === rows;
}

// 檢查蛇是否吃到食物
function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// 改變蛇的移動方向
document.addEventListener("keydown", (event) => {
    if (isGameOver) return;

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
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    startButton.disabled = false;

    const playerName = prompt("請輸入你的名字：");
    if (playerName) {
        const endTime = Math.floor(Date.now() / 1000);
        const playTime = endTime - startTime;
        const saveTime = new Date().toLocaleString(); // 儲存時的時間

        push(scoresRef, {
            name: playerName,
            score: score,
            playTime: playTime,
            saveTime: saveTime
        });
    }
}

// 從 Firebase 載入排行榜資料並顯示
function loadLeaderboard() {
    const leaderboardQuery = query(scoresRef, orderByChild('score'), limitToLast(10)); // 取得分數最高的 10 筆資料

    onValue(leaderboardQuery, (snapshot) => {
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

// 格式化遊玩時間（秒轉為分:秒）
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