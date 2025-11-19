// 游戏状态
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let isPaused = false;
let isGameOver = false;
let dropInterval = null;

// 初始化游戏板
function initBoard() {
    // 创建20行10列的空游戏板
    board = Array(20).fill().map(() => Array(10).fill(0));
    drawBoard(); // 立即绘制空白游戏板
}

// 开始游戏
function startGame() {
    if (isGameOver) {
        resetGame();
        return;
    }
    
    isPaused = false;
    isGameOver = false;
    
    if (dropInterval) {
        clearInterval(dropInterval);
    }
    
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    updateDisplay();
    
    // 生成第一个和下一个方块
    currentPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    drawNextPiece();
    
    startDropInterval();
    drawBoard();
}

// 绘制游戏板
function drawBoard() {
    const canvas = document.getElementById('board');
    if (!canvas) {
        console.error('找不到canvas元素 #board');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const blockSize = canvas.width / 10;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 10; x++) {
        ctx.beginPath();
        ctx.moveTo(x * blockSize, 0);
        ctx.lineTo(x * blockSize, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= 20; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * blockSize);
        ctx.lineTo(canvas.width, y * blockSize);
        ctx.stroke();
    }
    
    // 绘制已固定的方块
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            if (board[y][x]) {
                ctx.fillStyle = getColor(board[y][x]);
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
    
    // 绘制当前下落的方块
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        (currentPiece.x + x) * blockSize,
                        (currentPiece.y + y) * blockSize,
                        blockSize,
                        blockSize
                    );
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(
                        (currentPiece.x + x) * blockSize,
                        (currentPiece.y + y) * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            });
        });
    }
}

// 移动方块相关函数
function movePieceLeft() {
    if (!currentPiece || isPaused || isGameOver) return;
    
    currentPiece.x--;
    if (checkCollision(currentPiece, board)) {
        currentPiece.x++;
    }
    drawBoard();
}

function movePieceRight() {
    if (!currentPiece || isPaused || isGameOver) return;
    
    currentPiece.x++;
    if (checkCollision(currentPiece, board)) {
        currentPiece.x--;
    }
    drawBoard();
}

function movePieceDown() {
    if (!currentPiece || isPaused || isGameOver) return true;
    
    currentPiece.y++;
    if (checkCollision(currentPiece, board)) {
        currentPiece.y--;
        lockPiece();
        return false;
    }
    drawBoard();
    return true;
}

function hardDrop() {
    if (!currentPiece || isPaused || isGameOver) return;
    
    while (movePieceDown()) {
        // 持续下落直到不能移动
    }
}

function rotatePiece() {
    if (!currentPiece || isPaused || isGameOver) return;
    
    const originalShape = currentPiece.shape;
    const rotated = [];
    const size = originalShape.length;
    
    // 创建旋转后的矩阵
    for (let i = 0; i < size; i++) {
        rotated[i] = [];
        for (let j = 0; j < size; j++) {
            rotated[i][j] = originalShape[size - 1 - j][i];
        }
    }
    
    currentPiece.shape = rotated;
    if (checkCollision(currentPiece, board)) {
        // 如果旋转后碰撞，恢复原状
        currentPiece.shape = originalShape;
    }
    drawBoard();
}

// 锁定方块到游戏板
function lockPiece() {
    const shape = currentPiece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.type;
                }
            }
        }
    }
    
    clearLines();
    spawnNewPiece();
}

// 生成新方块
function spawnNewPiece() {
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    drawNextPiece();
    
    // 检查游戏是否结束
    if (checkCollision(currentPiece, board)) {
        gameOver();
    }
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = 19; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 移除该行
            board.splice(y, 1);
            // 在顶部添加新行
            board.unshift(Array(10).fill(0));
            linesCleared++;
            y++; // 重新检查当前行
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        // 计分规则：1行=100, 2行=300, 3行=500, 4行=800
        score += [0, 100, 300, 500, 800][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        updateDisplay();
        updateDropInterval();
    }
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(dropInterval);
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').style.display = 'flex';
}

// 提交分数
function submitScore() {
    const playerName = document.getElementById('player-name').value || '匿名玩家';
    addToLeaderboard(playerName, score);
    document.getElementById('game-over-modal').style.display = 'none';
    updateLeaderboardDisplay();
}

// 暂停游戏
function pauseGame() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(dropInterval);
    } else {
        startDropInterval();
    }
}

// 重置游戏
function resetGame() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    level = 1;
    lines = 0;
    currentPiece = null;
    nextPiece = null;
    
    if (dropInterval) {
        clearInterval(dropInterval);
    }
    
    initBoard();
    updateDisplay();
    startGame();
}

// 更新下落速度
function updateDropInterval() {
    if (dropInterval) {
        clearInterval(dropInterval);
    }
    const baseSpeed = 1000;
    const speedDecrease = Math.min(level - 1, 15) * 50;
    const interval = Math.max(baseSpeed - speedDecrease, 100);
    
    dropInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            movePieceDown();
        }
    }, interval);
}

function startDropInterval() {
    updateDropInterval();
}

// 更新显示
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (isPaused || isGameOver) return;
    
    switch(event.code) {
        case 'ArrowLeft':
            movePieceLeft();
            break;
        case 'ArrowRight':
            movePieceRight();
            break;
        case 'ArrowDown':
            movePieceDown();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'Space':
            event.preventDefault();
            hardDrop();
            break;
        case 'KeyP':
            pauseGame();
            break;
    }
});

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initBoard();
    updateLeaderboardDisplay();
});