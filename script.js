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
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app); // 使用 app 實例來獲取 database

// 從 Firebase 載入排行榜資料並顯示
function loadLeaderboard() {
    const leaderboardQuery = firebase.database().ref(database, 'scores').orderByChild('score').limitToLast(10);

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

        firebase.database().ref(database, 'scores').push({
            name: playerName,
            score: score,
            playTime: playTime,
            saveTime: saveTime
        });
    }
}

// ... (其餘的 JavaScript 程式碼)

// 初始化遊戲並載入排行榜
initGame();
loadLeaderboard();

// 開始遊戲按鈕事件監聽
startButton.addEventListener("click", startGame);
