// 俄罗斯方块的所有形状定义
const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f0f0' // 青色
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0' // 蓝色
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#f0a000' // 橙色
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000' // 黄色
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000' // 绿色
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0' // 紫色
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000' // 红色
    }
};

// 所有方块类型的数组
const TETROMINO_TYPES = Object.keys(TETROMINOES);

// 获取随机方块
function getRandomPiece() {
    const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    return {
        type: type,
        shape: TETROMINOES[type].shape,
        x: Math.floor(10 / 2) - Math.floor(TETROMINOES[type].shape[0].length / 2),
        y: 0,
        color: TETROMINOES[type].color
    };
}

// 旋转方块（顺时针）
function rotatePiece(piece) {
    const rotated = [];
    const shape = piece.shape;
    const size = shape.length;
    
    // 创建旋转后的矩阵
    for (let i = 0; i < size; i++) {
        rotated[i] = [];
        for (let j = 0; j < size; j++) {
            rotated[i][j] = shape[size - 1 - j][i];
        }
    }
    
    return {
        ...piece,
        shape: rotated
    };
}

// 检查旋转是否有效
function isValidRotation(piece, board) {
    const rotated = rotatePiece(piece);
    return !checkCollision(rotated, board);
}

// 根据方块类型获取颜色
function getColor(pieceType) {
    return TETROMINOES[pieceType]?.color || '#ffffff';
}

// 绘制下一个方块预览
function drawNextPiece() {
    const canvas = document.getElementById('next-piece');
    const ctx = canvas.getContext('2d');
    const blockSize = 25;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (nextPiece) {
        const piece = nextPiece;
        const offsetX = (canvas.width - piece.shape[0].length * blockSize) / 2;
        const offsetY = (canvas.height - piece.shape.length * blockSize) / 2;
        
        ctx.fillStyle = piece.color;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
}

// 碰撞检测
function checkCollision(piece, board) {
    const shape = piece.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = piece.x + x;
                const boardY = piece.y + y;
                
                // 检查边界
                if (boardX < 0 || boardX >= 10 || boardY >= 20) {
                    return true;
                }
                
                // 检查与已有方块的碰撞
                if (boardY >= 0 && board[boardY] && board[boardY][boardX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 移动方块
function movePieceLeft() {
    if (!currentPiece) return;
    
    currentPiece.x--;
    if (checkCollision(currentPiece, board)) {
        currentPiece.x++; // 撤销移动
    } else {
        drawBoard();
    }
}

function movePieceRight() {
    if (!currentPiece) return;
    
    currentPiece.x++;
    if (checkCollision(currentPiece, board)) {
        currentPiece.x--; // 撤销移动
    } else {
        drawBoard();
    }
}

function movePieceDown() {
    if (!currentPiece) return;
    
    currentPiece.y++;
    if (checkCollision(currentPiece, board)) {
        currentPiece.y--; // 撤销移动
        lockPiece();
        return false;
    }
    drawBoard();
    return true;
}

// 硬降（直接落到底部）
function hardDrop() {
    if (!currentPiece) return;
    
    while (movePieceDown()) {
        // 继续下落直到碰撞
    }
}

// 旋转方块
function rotatePiece() {
    if (!currentPiece) return;
    
    const rotated = rotatePiece(currentPiece);
    const originalShape = currentPiece.shape;
    
    currentPiece.shape = rotated.shape;
    if (checkCollision(currentPiece, board)) {
        // 如果旋转后碰撞，尝试墙踢（wall kick）
        currentPiece.x--;
        if (checkCollision(currentPiece, board)) {
            currentPiece.x += 2; // 尝试向右移动
            if (checkCollision(currentPiece, board)) {
                currentPiece.x--; // 恢复原位
                currentPiece.shape = originalShape; // 恢复原形状
            }
        }
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
                
                if (boardY >= 0) { // 确保在游戏板范围内
                    board[boardY][boardX] = currentPiece.type;
                }
            }
        }
    }
    
    // 检查并清除完整的行
    clearLines();
    
    // 生成新方块
    spawnPiece();
}

// 清除完整的行并计分
function clearLines() {
    let linesCleared = 0;
    
    for (let y = 20 - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 移除该行
            board.splice(y, 1);
            // 在顶部添加新行
            board.unshift(Array(10).fill(0));
            linesCleared++;
            y++; // 重新检查当前行（因为上面的行下移了）
        }
    }
    
    if (linesCleared > 0) {
        // 更新分数
        lines += linesCleared;
        score += [0, 40, 100, 300, 1200][linesCleared] * level;
        
        // 每清除10行升一级
        level = Math.floor(lines / 10) + 1;
        
        updateDisplay();
        updateDropInterval();
    }
}

// 更新下落间隔（随等级提高而加快）
function updateDropInterval() {
    if (dropInterval) {
        clearInterval(dropInterval);
    }
    const baseSpeed = 1000; // 1秒
    const speedDecrease = Math.min(level - 1, 15) * 50; // 每级加快50ms，最多加快750ms
    const interval = Math.max(baseSpeed - speedDecrease, 100); // 最快100ms
    
    dropInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            movePieceDown();
        }
    }, interval);
}

// 开始下落间隔
function startDropInterval() {
    updateDropInterval();
}

// 暂停游戏
function pauseGame() {
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