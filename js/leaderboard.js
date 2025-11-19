// 排行榜功能
const LEADERBOARD_KEY = 'tetris_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

// 获取排行榜
function getLeaderboard() {
    const leaderboard = localStorage.getItem(LEADERBOARD_KEY);
    return leaderboard ? JSON.parse(leaderboard) : [];
}

// 添加到排行榜
function addToLeaderboard(name, score) {
    const leaderboard = getLeaderboard();
    const newEntry = {
        name: name,
        score: score,
        date: new Date().toLocaleDateString()
    };
    
    leaderboard.push(newEntry);
    
    // 按分数排序并保留前N名
    leaderboard.sort((a, b) => b.score - a.score);
    const topScores = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
    return topScores;
}

// 更新排行榜显示
function updateLeaderboardDisplay() {
    const leaderboard = getLeaderboard();
    const leaderboardList = document.getElementById('leaderboard-list');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-item">暂无记录</div>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((entry, index) => `
        <div class="leaderboard-item">
            <strong>${index + 1}. ${entry.name}</strong>
            <div>分数: ${entry.score}</div>
            <small>${entry.date}</small>
        </div>
    `).join('');
}

// 清空排行榜（调试用）
function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
    updateLeaderboardDisplay();
}

// 页面加载时初始化排行榜
document.addEventListener('DOMContentLoaded', updateLeaderboardDisplay);