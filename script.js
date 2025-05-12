const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const leaderboardElement = document.getElementById("leaderboard");

// *** 將 initGame() 函數定義移動到這裡 ***
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
    scoreDisplay.textContent = `分數: ${score}`; // 如果 HTML 中有 scoreDisplay
    timerDisplay.textContent = `時間: 0 秒`; // 如果 HTML 中有 timerDisplay
    clearInterval(gameInterval);
    clearInterval(timerInterval); // 如果需要計時器
    startButton.disabled = false;
}


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
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app); // 使用 app 實例來獲取 database

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

// 啟動遊戲
function startGame() {
    initGame(); // 確保在開始遊戲時調用 initGame
    startButton.disabled = true;
    startTime = Math.floor(Date.now() / 1000); // 如果需要計時器
    gameInterval = setInterval(gameLoop, gameSpeed);
    timerInterval = setInterval(updateTimer, 1000); // 如果需要計時器
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

// 初始化遊戲並載入排行榜
initGame();
loadLeaderboard();

// 開始遊戲按鈕事件監聽
startButton.addEventListener("click", startGame);
