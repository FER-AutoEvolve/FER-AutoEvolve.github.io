document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelSelect = document.getElementById('levelSelect');
    
    // Game settings
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let speed = 10;
    
    // Snake properties
    let snake = [
        {x: 10, y: 10}
    ];
    let dx = 0;
    let dy = 0;
    
    // Food properties
    let foodX = 15;
    let foodY = 15;
    
    // Wall properties
    let walls = [];
    
    // Game state
    let score = 0;
    let gameOver = false;
    let animationFrameId;
    let gameLoopTimeout;
    
    // Define game levels with wall positions and optional starting positions
    const levels = {
        'level1': {
            name: 'Basic',
            walls: [], // No walls
            snake: [{ x: 10, y: 10 }],
            food: { x: 15, y: 15 }
        },
        'level2': {
            name: 'Borders',
            walls: [
                // Top wall
                ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 0 })),
                // Bottom wall
                ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 19 })),
                // Left wall
                ...Array.from({ length: 18 }, (_, i) => ({ x: 0, y: i + 1 })),
                // Right wall
                ...Array.from({ length: 18 }, (_, i) => ({ x: 19, y: i + 1 }))
            ],
            snake: [{ x: 10, y: 10 }]
        },
        'level3': {
            name: 'Maze',
            walls: [
                // Center horizontal wall
                ...Array.from({ length: 10 }, (_, i) => ({ x: i + 5, y: 10 })),
                // Vertical walls
                ...Array.from({ length: 5 }, (_, i) => ({ x: 5, y: i + 5 })),
                ...Array.from({ length: 5 }, (_, i) => ({ x: 14, y: i + 10 })),
                // Additional walls
                { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 }, 
                { x: 16, y: 3 }, { x: 15, y: 3 }, { x: 16, y: 4 },
                { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 3, y: 15 },
                { x: 16, y: 16 }, { x: 15, y: 16 }, { x: 16, y: 15 }
            ],
            snake: [{ x: 2, y: 2 }]
        }
    };

    // Load a level
    function loadLevel(levelName) {
        // Reset game state
        resetGame(false); // Reset but don't start the game loop
        
        // Get level data
        const levelData = levels[levelName];
        if (!levelData) {
            console.error(`Level "${levelName}" not found`);
            return;
        }
        
        // Set walls
        walls = [...levelData.walls];
        
        // Set initial snake position if provided
        if (levelData.snake && levelData.snake.length > 0) {
            snake = [...levelData.snake];
        }
        
        // Set initial food position if provided
        if (levelData.food) {
            foodX = levelData.food.x;
            foodY = levelData.food.y;
        } else {
            generateFood(); // Generate food in a random position
        }
        
        // Start the game
        gameLoop();
    }
    
    // Game loop
    function gameLoop() {
        if (gameOver) {
            drawGameOver();
            return;
        }
        
        // Clear any existing timeout to prevent multiple loops
        if (gameLoopTimeout) {
            clearTimeout(gameLoopTimeout);
        }
        
        gameLoopTimeout = setTimeout(function() {
            animationFrameId = requestAnimationFrame(gameLoop);
            clearCanvas();
            drawWalls();
            moveSnake();
            checkCollision();
            drawFood();
            drawSnake();
        }, 1000 / speed);
    }
    
    // Clear canvas
    function clearCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw walls
    function drawWalls() {
        ctx.fillStyle = '#795548';
        walls.forEach(wall => {
            ctx.fillRect(wall.x * gridSize, wall.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = '#5D4037';
            ctx.strokeRect(wall.x * gridSize, wall.y * gridSize, gridSize, gridSize);
        });
    }
    
    // Move snake
    function moveSnake() {
        const head = {
            x: snake[0].x + dx,
            y: snake[0].y + dy
        };
        
        // If not moving, don't add new head
        if (dx === 0 && dy === 0) return;
        
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === foodX && head.y === foodY) {
            score++;
            scoreElement.textContent = score;
            generateFood();
            // Increase speed slightly for every 5 points
            if (score % 5 === 0) {
                speed += 1;
            }
        } else {
            snake.pop();
        }
    }
    
    // Draw snake
    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = '#388E3C';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }
    
    // Generate food
    function generateFood() {
        // Make sure food doesn't spawn on snake or walls
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * tileCount);
            foodY = Math.floor(Math.random() * tileCount);
            
            validPosition = true;
            
            // Check if food spawned on snake
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === foodX && snake[i].y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if food spawned on a wall
            if (validPosition) {
                for (let i = 0; i < walls.length; i++) {
                    if (walls[i].x === foodX && walls[i].y === foodY) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
    }
    
    // Draw food
    function drawFood() {
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
        ctx.strokeStyle = '#E64A19';
        ctx.strokeRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
    }
    
    // Check collision
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        //if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        //    gameOver = true;
        //    return;
        //}
        
        // Wrap around screen edges (teleport to opposite side) - instead of frame wall collision
        if (head.x < 0) {
            snake[0].x = tileCount - 1;
        } else if (head.x >= tileCount) {
            snake[0].x = 0;
        }

        if (head.y < 0) {
            snake[0].y = tileCount - 1;
         } else if (head.y >= tileCount) {
            snake[0].y = 0;
        }
        
        // Check collision with level walls
        for (let i = 0; i < walls.length; i++) {
            if (head.x === walls[i].x && head.y === walls[i].y) {
                gameOver = true;
                return;
            }
        }
        
        // Check self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }
    }
    
    // Draw game over screen
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        
        // Check current language
        const isHrvatskaActive = document.getElementById('content-hr').style.display !== 'none';
        
        if (isHrvatskaActive) {
            ctx.fillText('Kraj igre!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText(`Bodovi: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Pritisnite Space za restart', canvas.width / 2, canvas.height / 2 + 60);
        } else {
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Press Space to restart', canvas.width / 2, canvas.height / 2 + 60);
        }
    }
    
    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for arrow keys to avoid scrolling
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        
        if (gameOver) {
            if (e.code === 'Space') {
                resetGame(true);
            }
            return;
        }
        
        // Prevent snake from reversing into itself
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (dy !== 1) { // Not moving down
                    dx = 0;
                    dy = -1;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (dy !== -1) { // Not moving up
                    dx = 0;
                    dy = 1;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (dx !== 1) { // Not moving right
                    dx = -1;
                    dy = 0;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (dx !== -1) { // Not moving left
                    dx = 1;
                    dy = 0;
                }
                break;
        }
    });
    
    // Reset game
    function resetGame(startGameLoop = true) {
        // Cancel any ongoing animation frame or timeout
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (gameLoopTimeout) {
            clearTimeout(gameLoopTimeout);
        }
        
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        speed = 10;
        walls = [];
        scoreElement.textContent = score;
        generateFood();
        gameOver = false;
        
        if (startGameLoop) {
            gameLoop();
        }
    }
    
    // Event listener for level change
    levelSelect.addEventListener('change', () => {
        const selectedLevel = levelSelect.value;
        loadLevel(selectedLevel);
    });
    
    // Start with the default level (first option in select)
    loadLevel(levelSelect.value);
});
