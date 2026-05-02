class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        this.levels = [];
        this.currentFloor = 0;
        this.currentLevel = null;
        this.player = null;
        
        this.isGameActive = false;
        this.lastRenderTime = 0;
        
        // Initialize tooltip element for information display
        this.createTooltip();
        
        // Track mouse position for tooltips
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Ensure the canvas is visible with a background color
        this.canvas.style.backgroundColor = "#111";
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Generate levels
        for (let i = 0; i < 20; i++) {
            const levelData = i < LEVELS_DATA.length ? LEVELS_DATA[i] : generateLevel(i);
            this.levels[i] = new Level(levelData, i);
        }
        
        // Create player
        const startLevel = this.levels[0];
        this.player = new Player(startLevel.playerStartX, startLevel.playerStartY);
        
        // Set current level
        this.currentLevel = startLevel;
        this.currentFloor = 0;
        
        // Set game as active
        this.isGameActive = true;
        
        // Update display - moved after player is created and game is set active
        document.getElementById('floor-display').textContent = this.currentFloor + 1;
        updateStatsDisplay();
        updateKeyDisplay();
        
        // Initial render
        this.render();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Debug output to verify initialization
        console.log("Game initialized, canvas dimensions:", this.canvas.width, "x", this.canvas.height);
    }
    
    createTooltip() {
        // Create tooltip element if it doesn't exist
        let tooltip = document.getElementById('game-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'game-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.padding = '8px';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = '#fff';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '14px';
            tooltip.style.zIndex = '1000';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.display = 'none';
            tooltip.style.maxWidth = '250px';
            tooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            document.body.appendChild(tooltip);
        }
        this.tooltip = tooltip;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', this.restartGame.bind(this));
        
        // Mouse move for tooltips
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Mouse leave to hide tooltip
        this.canvas.addEventListener('mouseleave', () => {
            this.tooltip.style.display = 'none';
        });
    }
    
    handleKeyDown(event) {
        if (!this.isGameActive) return;
        
        let moved = false;
        
        switch (event.key) {
            case 'ArrowUp':
                moved = this.player.move(0, -1, this.currentLevel);
                break;
            case 'ArrowDown':
                moved = this.player.move(0, 1, this.currentLevel);
                break;
            case 'ArrowLeft':
                moved = this.player.move(-1, 0, this.currentLevel);
                break;
            case 'ArrowRight':
                moved = this.player.move(1, 0, this.currentLevel);
                break;
        }
        
        if (moved) {
            this.render();
        }
    }
    
    handleMouseMove(event) {
        // Get mouse position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        
        // Convert to grid coordinates
        const gridX = Math.floor(this.mouseX / TILE_SIZE);
        const gridY = Math.floor(this.mouseY / TILE_SIZE);
        
        // Get entity at grid position
        if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT && this.currentLevel) {
            const entity = this.currentLevel.grid[gridY][gridX];
            
            if (entity.type !== ENTITY_TYPES.EMPTY && entity.type !== ENTITY_TYPES.WALL) {
                // Show tooltip for entity
                this.showEntityTooltip(entity, event.clientX, event.clientY);
            } else {
                this.tooltip.style.display = 'none';
            }
        } else {
            this.tooltip.style.display = 'none';
        }
    }
    
    showEntityTooltip(entity, clientX, clientY) {
        let tooltipContent = '';
        
        switch (entity.type) {
            case ENTITY_TYPES.MONSTER:
                tooltipContent = `
                    <strong>${entity.name}</strong><br>
                    HP: ${entity.hp}<br>
                    Attack: ${entity.attack}<br>
                    Defense: ${entity.defense}<br>
                    EXP: ${entity.exp}<br>
                    Gold: ${entity.gold}
                `;
                break;
                
            case ENTITY_TYPES.SWORD:
                tooltipContent = `
                    <strong>${entity.name}</strong><br>
                    Attack: +${entity.attackBoost}
                `;
                break;
                
            case ENTITY_TYPES.SHIELD:
                tooltipContent = `
                    <strong>${entity.name}</strong><br>
                    Defense: +${entity.defenseBoost}
                `;
                break;
                
            case ENTITY_TYPES.POTION:
                tooltipContent = `
                    <strong>${entity.name}</strong><br>
                    Restores ${entity.hpRestore} HP
                `;
                break;
                
            case ENTITY_TYPES.GOLD:
                tooltipContent = `Gold: ${entity.value}`;
                break;
                
            case ENTITY_TYPES.YELLOW_KEY:
                tooltipContent = `Yellow Key`;
                break;
                
            case ENTITY_TYPES.BLUE_KEY:
                tooltipContent = `Blue Key`;
                break;
                
            case ENTITY_TYPES.RED_KEY:
                tooltipContent = `Red Key`;
                break;
                
            case ENTITY_TYPES.YELLOW_DOOR:
                tooltipContent = `Yellow Door (requires Yellow Key)`;
                break;
                
            case ENTITY_TYPES.BLUE_DOOR:
                tooltipContent = `Blue Door (requires Blue Key)`;
                break;
                
            case ENTITY_TYPES.RED_DOOR:
                tooltipContent = `Red Door (requires Red Key)`;
                break;
                
            case ENTITY_TYPES.STAIRS_UP:
                tooltipContent = `Stairs Up to Floor ${this.currentFloor + 2}`;
                break;
                
            case ENTITY_TYPES.STAIRS_DOWN:
                tooltipContent = `Stairs Down to Floor ${this.currentFloor}`;
                break;
                
            case ENTITY_TYPES.NPC:
                tooltipContent = `NPC: "${entity.message}"`;
                break;
                
            case ENTITY_TYPES.SPECIAL_ITEM:
                tooltipContent = `Special Item`;
                break;
                
            case ENTITY_TYPES.SHOP:
                tooltipContent = `<strong>Shop</strong><br>Buy items with gold and experience`;
                break;
                
            default:
                return;
        }
        
        this.tooltip.innerHTML = tooltipContent;
        this.tooltip.style.display = 'block';
        
        // Position tooltip
        this.tooltip.style.left = (clientX + 10) + 'px';
        this.tooltip.style.top = (clientY + 10) + 'px';
        
        // Reposition if tooltip goes off screen
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (tooltipRect.right > windowWidth) {
            this.tooltip.style.left = (clientX - tooltipRect.width - 10) + 'px';
        }
        
        if (tooltipRect.bottom > windowHeight) {
            this.tooltip.style.top = (clientY - tooltipRect.height - 10) + 'px';
        }
    }
    
    goToLevel(floorNumber) {
        if (floorNumber < 0 || floorNumber >= this.levels.length) {
            return;
        }
        
        this.currentFloor = floorNumber;
        this.currentLevel = this.levels[floorNumber];
        
        // Special case for the final level
        if (floorNumber === 19) {
            // Position the player just above the stairs to avoid getting stuck
            this.player.x = 6;
            this.player.y = 10;
        } else if (floorNumber > 0) {
            // Coming from below
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    if (this.currentLevel.grid[y][x].type === ENTITY_TYPES.STAIRS_DOWN) {
                        this.player.x = x;
                        this.player.y = y + 1; // Place player just below the stairs
                        if (this.player.y >= GRID_HEIGHT) this.player.y = GRID_HEIGHT - 2;
                        break;
                    }
                }
            }
        } else {
            // First floor or coming from above
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    if (this.currentLevel.grid[y][x].type === ENTITY_TYPES.STAIRS_UP) {
                        this.player.x = x;
                        this.player.y = y - 1; // Place player just above the stairs
                        if (this.player.y < 0) this.player.y = 1;
                        break;
                    }
                }
            }
            
            // If it's the first floor, use the predefined start position
            if (floorNumber === 0) {
                this.player.x = this.currentLevel.playerStartX;
                this.player.y = this.currentLevel.playerStartY;
            }
        }
        
        // Update display
        document.getElementById('floor-display').textContent = this.currentFloor + 1;
        this.render();
    }
    
    gameLoop(timestamp) {
        if (!this.isGameActive) return;
        
        // Calculate elapsed time
        const elapsed = timestamp - this.lastRenderTime;
        
        // Update game state if needed
        // (Currently no continuous updates needed, it's turn-based)
        
        // Render the game
        this.render();
        
        // Store the time
        this.lastRenderTime = timestamp;
        
        // Request the next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    render() {
        // Ensure context is available
        if (!this.ctx) {
            console.error("Canvas context not available");
            return;
        }
        
        // Clear the canvas with floor color
        this.ctx.fillStyle = COLORS.FLOOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines for visibility (helps with debugging)
        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_WIDTH; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * TILE_SIZE, 0);
            this.ctx.lineTo(i * TILE_SIZE, CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        for (let i = 0; i <= GRID_HEIGHT; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * TILE_SIZE);
            this.ctx.lineTo(CANVAS_WIDTH, i * TILE_SIZE);
            this.ctx.stroke();
        }
        
        // Render grid
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const entity = this.currentLevel.grid[y][x];
                
                if (entity.type !== ENTITY_TYPES.EMPTY) {
                    this.renderEntity(entity, x, y);
                }
            }
        }
        
        // Render player
        this.renderPlayer();
        
        // Debug output for first render
        if (!this.hasRendered) {
            console.log("First render complete");
            this.hasRendered = true;
        }
    }
    
    renderEntity(entity, x, y) {
        const xPos = x * TILE_SIZE;
        const yPos = y * TILE_SIZE;
        
        switch (entity.type) {
            case ENTITY_TYPES.WALL:
                this.ctx.fillStyle = COLORS.WALL;
                this.drawWall(xPos, yPos);
                break;
                
            case ENTITY_TYPES.YELLOW_DOOR:
                this.ctx.fillStyle = COLORS.YELLOW_DOOR;
                this.drawDoor(xPos, yPos);
                break;
                
            case ENTITY_TYPES.BLUE_DOOR:
                this.ctx.fillStyle = COLORS.BLUE_DOOR;
                this.drawDoor(xPos, yPos);
                break;
                
            case ENTITY_TYPES.RED_DOOR:
                this.ctx.fillStyle = COLORS.RED_DOOR;
                this.drawDoor(xPos, yPos);
                break;
                
            case ENTITY_TYPES.YELLOW_KEY:
                this.ctx.fillStyle = COLORS.YELLOW_KEY;
                this.drawKey(xPos, yPos);
                break;
                
            case ENTITY_TYPES.BLUE_KEY:
                this.ctx.fillStyle = COLORS.BLUE_KEY;
                this.drawKey(xPos, yPos);
                break;
                
            case ENTITY_TYPES.RED_KEY:
                this.ctx.fillStyle = COLORS.RED_KEY;
                this.drawKey(xPos, yPos);
                break;
                
            case ENTITY_TYPES.STAIRS_UP:
                this.ctx.fillStyle = COLORS.STAIRS_UP;
                this.drawStairs(xPos, yPos, true);
                break;
                
            case ENTITY_TYPES.STAIRS_DOWN:
                this.ctx.fillStyle = COLORS.STAIRS_DOWN;
                this.drawStairs(xPos, yPos, false);
                break;
                
            case ENTITY_TYPES.MONSTER:
                this.ctx.fillStyle = entity.color;
                this.drawMonster(xPos, yPos, entity);
                break;
                
            case ENTITY_TYPES.SWORD:
                this.ctx.fillStyle = entity.color || COLORS.SWORD;
                this.drawSword(xPos, yPos);
                break;
                
            case ENTITY_TYPES.SHIELD:
                this.ctx.fillStyle = entity.color || COLORS.SHIELD;
                this.drawShield(xPos, yPos);
                break;
                
            case ENTITY_TYPES.POTION:
                this.ctx.fillStyle = entity.color || COLORS.POTION;
                this.drawPotion(xPos, yPos);
                break;
                
            case ENTITY_TYPES.GOLD:
                this.ctx.fillStyle = COLORS.GOLD;
                this.drawGold(xPos, yPos);
                break;
                
            case ENTITY_TYPES.SPECIAL_ITEM:
                this.ctx.fillStyle = COLORS.SPECIAL_ITEM;
                this.drawSpecialItem(xPos, yPos);
                break;
                
            case ENTITY_TYPES.NPC:
                this.ctx.fillStyle = COLORS.NPC;
                this.drawNPC(xPos, yPos);
                break;
                
            case ENTITY_TYPES.SHOP:
                this.drawShop(xPos, yPos);
                break;
        }
    }
    
    renderPlayer() {
        const xPos = this.player.x * TILE_SIZE;
        const yPos = this.player.y * TILE_SIZE;
        
        // Draw brave soldier with more realistic style
        
        // Create a main body gradient for armor
        const armorGradient = this.ctx.createRadialGradient(
            xPos + TILE_SIZE / 2, yPos + TILE_SIZE / 2, 0,
            xPos + TILE_SIZE / 2, yPos + TILE_SIZE / 2, TILE_SIZE / 2
        );
        armorGradient.addColorStop(0, "#585C64"); // Steel gray
        armorGradient.addColorStop(0.7, "#2E3238"); // Darker steel
        armorGradient.addColorStop(1, "#1A1C1F"); // Almost black edge
        
        // Main body/torso (armor)
        this.ctx.fillStyle = armorGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(
            xPos + TILE_SIZE / 2, 
            yPos + TILE_SIZE * 5/8, 
            TILE_SIZE * 3/8, 
            TILE_SIZE * 3/8, 
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
        
        // Armor plates - chest
        this.ctx.strokeStyle = "#9E9E9E"; // Light steel
        this.ctx.lineWidth = 1.5;
        
        // Horizontal chest plate lines
        for (let i = 0; i < 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(xPos + TILE_SIZE * 1/4, yPos + TILE_SIZE * (1/2 + i/10));
            this.ctx.lineTo(xPos + TILE_SIZE * 3/4, yPos + TILE_SIZE * (1/2 + i/10));
            this.ctx.stroke();
        }
        
        // Head - helmet
        this.ctx.fillStyle = "#4B4F55"; // Steel helmet
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE / 2, yPos + TILE_SIZE / 3, TILE_SIZE / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Helmet details
        this.ctx.strokeStyle = "#777";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE / 2, yPos + TILE_SIZE / 3, TILE_SIZE / 4, Math.PI * 5/8, Math.PI * 11/8);
        this.ctx.stroke();
        
        // Helmet crest/plume
        this.ctx.fillStyle = "#CE4444"; // Red plume
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE / 2, yPos + TILE_SIZE / 12);
        this.ctx.lineTo(xPos + TILE_SIZE * 3/8, yPos + TILE_SIZE * 1/4);
        this.ctx.lineTo(xPos + TILE_SIZE * 5/8, yPos + TILE_SIZE * 1/4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Face area (visible part)
        this.ctx.fillStyle = "#E0C8A0"; // Skin tone
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE / 2, yPos + TILE_SIZE / 3, TILE_SIZE / 7, 0, Math.PI, false);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE * 2/5, yPos + TILE_SIZE * 1/3, TILE_SIZE / 16, 0, Math.PI * 2);
        this.ctx.arc(xPos + TILE_SIZE * 3/5, yPos + TILE_SIZE * 1/3, TILE_SIZE / 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = "#1A237E"; // Deep blue for brave eyes
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE * 2/5, yPos + TILE_SIZE * 1/3, TILE_SIZE / 32, 0, Math.PI * 2);
        this.ctx.arc(xPos + TILE_SIZE * 3/5, yPos + TILE_SIZE * 1/3, TILE_SIZE / 32, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Determined mouth
        this.ctx.strokeStyle = "#C67B63"; // Reddish lips
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE * 2/5, yPos + TILE_SIZE * 3/8);
        this.ctx.lineTo(xPos + TILE_SIZE * 3/5, yPos + TILE_SIZE * 3/8);
        this.ctx.stroke();
        
        // Arms - gauntlets
        // Left arm
        this.ctx.fillStyle = "#4B4F55";
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE * 1/4, yPos + TILE_SIZE * 1/2, TILE_SIZE / 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right arm
        this.ctx.beginPath();
        this.ctx.arc(xPos + TILE_SIZE * 3/4, yPos + TILE_SIZE * 1/2, TILE_SIZE / 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw shield on left arm
        this.ctx.fillStyle = "#1565C0"; // Shield blue
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE * 1/8, yPos + TILE_SIZE * 2/5);
        this.ctx.lineTo(xPos + TILE_SIZE * 1/8, yPos + TILE_SIZE * 4/5);
        this.ctx.lineTo(xPos + TILE_SIZE * 3/8, yPos + TILE_SIZE * 4/5);
        this.ctx.lineTo(xPos + TILE_SIZE * 3/8, yPos + TILE_SIZE * 2/5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Shield emblem/design
        this.ctx.strokeStyle = "#FDD835"; // Gold
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE * 1/4, yPos + TILE_SIZE * 1/2);
        this.ctx.lineTo(xPos + TILE_SIZE * 1/4, yPos + TILE_SIZE * 7/10);
        this.ctx.moveTo(xPos + TILE_SIZE * 1/6, yPos + TILE_SIZE * 3/5);
        this.ctx.lineTo(xPos + TILE_SIZE * 1/3, yPos + TILE_SIZE * 3/5);
        this.ctx.stroke();
        
        // Draw sword on right side
        this.ctx.strokeStyle = "#7B7B7B"; // Silver
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE * 4/5, yPos + TILE_SIZE * 3/8);
        this.ctx.lineTo(xPos + TILE_SIZE * 4/5, yPos + TILE_SIZE * 3/4);
        this.ctx.stroke();
        
        // Sword hilt
        this.ctx.strokeStyle = "#6D4C41"; // Brown
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE * 3/4, yPos + TILE_SIZE * 3/8);
        this.ctx.lineTo(xPos + TILE_SIZE * 7/8, yPos + TILE_SIZE * 3/8);
        this.ctx.stroke();
        
        // Sword glint
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + TILE_SIZE * 4/5, yPos + TILE_SIZE * 1/2);
        this.ctx.lineTo(xPos + TILE_SIZE * 4/5 + 3, yPos + TILE_SIZE * 1/2 + 3);
        this.ctx.stroke();
        
        // Cape/cloak
        this.ctx.fillStyle = "#C62828"; // Deep red
        this.ctx.beginPath();
        this.ctx.ellipse(
            xPos + TILE_SIZE / 2,
            yPos + TILE_SIZE * 5/8,
            TILE_SIZE * 3/8,
            TILE_SIZE / 4,
            0, Math.PI, Math.PI * 2
        );
        this.ctx.fill();
        
        // Cape detail lines
        this.ctx.strokeStyle = "#B71C1C"; // Darker red
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            this.ctx.moveTo(xPos + TILE_SIZE * (5/16 + i/8), yPos + TILE_SIZE * 5/8);
            this.ctx.lineTo(xPos + TILE_SIZE * (5/16 + i/8), yPos + TILE_SIZE * 7/8);
        }
        this.ctx.stroke();
        
        // Legs
        this.ctx.fillStyle = "#37474F"; // Dark gray/blue
        this.ctx.beginPath();
        this.ctx.rect(xPos + TILE_SIZE * 3/8, yPos + TILE_SIZE * 5/8, TILE_SIZE / 8, TILE_SIZE * 3/8);
        this.ctx.rect(xPos + TILE_SIZE * 1/2, yPos + TILE_SIZE * 5/8, TILE_SIZE / 8, TILE_SIZE * 3/8);
        this.ctx.fill();
        
        // Boots
        this.ctx.fillStyle = "#3E2723"; // Dark brown
        this.ctx.beginPath();
        this.ctx.rect(xPos + TILE_SIZE * 3/8, yPos + TILE_SIZE * 7/8, TILE_SIZE / 8, TILE_SIZE / 12);
        this.ctx.rect(xPos + TILE_SIZE * 1/2, yPos + TILE_SIZE * 7/8, TILE_SIZE / 8, TILE_SIZE / 12);
        this.ctx.fill();
    }
    
    drawKey(x, y) {
        // Key head (circle)
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 3, TILE_SIZE / 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Key shaft
        this.ctx.fillRect(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 3, 4, TILE_SIZE / 2);
        
        // Key teeth
        this.ctx.fillRect(x + TILE_SIZE / 2, y + TILE_SIZE * 2/3, TILE_SIZE / 4, TILE_SIZE / 8);
        this.ctx.fillRect(x + TILE_SIZE / 2, y + TILE_SIZE * 2/3 + TILE_SIZE / 8, TILE_SIZE / 4, TILE_SIZE / 8);
        
        // Add a border
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawStairs(x, y, isUp) {
        const numSteps = 5;
        const stepHeight = TILE_SIZE / numSteps;
        
        // Draw a background rectangle first
        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        // Draw steps with contrasting color
        this.ctx.fillStyle = isUp ? "#B2FF59" : "#EEFF41";
        
        for (let i = 0; i < numSteps; i++) {
            const yOffset = isUp ? TILE_SIZE - (i + 1) * stepHeight : i * stepHeight;
            this.ctx.fillRect(x + i * stepHeight, y + yOffset, TILE_SIZE - i * stepHeight, stepHeight);
        }
        
        // Draw direction arrow
        this.ctx.fillStyle = "#000";
        this.ctx.beginPath();
        if (isUp) {
            // Up arrow
            this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 4);
            this.ctx.lineTo(x + TILE_SIZE / 4, y + TILE_SIZE / 2);
            this.ctx.lineTo(x + TILE_SIZE * 3/4, y + TILE_SIZE / 2);
        } else {
            // Down arrow
            this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE * 3/4);
            this.ctx.lineTo(x + TILE_SIZE / 4, y + TILE_SIZE / 2);
            this.ctx.lineTo(x + TILE_SIZE * 3/4, y + TILE_SIZE / 2);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawMonster(x, y, monster) {
        // Get monster color
        const monsterColor = monster.color || "#FF0000"; // Default to red
        this.ctx.fillStyle = monsterColor;
        
        // Check if it's the final boss
        if (monster.isFinalBoss) {
            // Draw a larger, more detailed boss
            
            // Glowing effect
            const gradient = this.ctx.createRadialGradient(
                x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/6,
                x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE
            );
            gradient.addColorStop(0, monsterColor);
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.2; // Pulsing effect
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - TILE_SIZE/3, y - TILE_SIZE/3, TILE_SIZE*1.6, TILE_SIZE*1.6);
            this.ctx.restore();
            
            // Main body
            this.ctx.fillStyle = monsterColor;
            this.ctx.beginPath();
            this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Crown/horns
            this.ctx.fillStyle = "#FFD700"; // Gold color
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE/5);
            this.ctx.lineTo(x + TILE_SIZE/2, y);
            this.ctx.lineTo(x + TILE_SIZE*3/4, y + TILE_SIZE/5);
            this.ctx.fill();
            
            // Eyes
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.beginPath();
            this.ctx.arc(x + TILE_SIZE/3, y + TILE_SIZE/2, TILE_SIZE/12, 0, Math.PI * 2);
            this.ctx.arc(x + TILE_SIZE*2/3, y + TILE_SIZE/2, TILE_SIZE/12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupils - glowing
            const eyeGradient = this.ctx.createRadialGradient(
                x + TILE_SIZE/3, y + TILE_SIZE/2, 0,
                x + TILE_SIZE/3, y + TILE_SIZE/2, TILE_SIZE/12
            );
            eyeGradient.addColorStop(0, "#FF0000");
            eyeGradient.addColorStop(1, "#660000");
            
            this.ctx.fillStyle = eyeGradient;
            this.ctx.beginPath();
            this.ctx.arc(x + TILE_SIZE/3, y + TILE_SIZE/2, TILE_SIZE/20, 0, Math.PI * 2);
            this.ctx.arc(x + TILE_SIZE*2/3, y + TILE_SIZE/2, TILE_SIZE/20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Staff/wand
            this.ctx.strokeStyle = "#8B4513"; // Brown
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE*3/4);
            this.ctx.lineTo(x - TILE_SIZE/4, y + TILE_SIZE/4);
            this.ctx.stroke();
            
            // Gem on staff
            this.ctx.fillStyle = "#00FFFF"; // Cyan
            this.ctx.beginPath();
            this.ctx.arc(x - TILE_SIZE/4, y + TILE_SIZE/4, TILE_SIZE/10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Reset for other drawings
            this.ctx.fillStyle = monsterColor;
            return;
        }
        
        // Draw specific monsters based on their type
        switch(monster.monsterType?.id) {
            case 1: // Slime
                this.drawSlime(x, y, monsterColor);
                break;
                
            case 2: // Bat
                this.drawBat(x, y, monsterColor);
                break;
                
            case 3: // Skeleton
                this.drawSkeleton(x, y, monsterColor);
                break;
                
            case 4: // Wizard
                this.drawWizard(x, y, monsterColor);
                break;
                
            case 5: // Knight
                this.drawKnight(x, y, monsterColor);
                break;
                
            case 6: // Golem
                this.drawGolem(x, y, monsterColor);
                break;
                
            case 7: // Demon
                this.drawDemon(x, y, monsterColor);
                break;
                
            case 8: // Dragon
                this.drawDragon(x, y, monsterColor);
                break;
                
            case 9: // Dark Lord
                this.drawDarkLord(x, y, monsterColor);
                break;
                
            default: // Generic monster if type not recognized
                this.drawGenericMonster(x, y, monsterColor);
                break;
        }
    }
    
    drawSlime(x, y, color) {
        // Semi-transparent jelly body
        const gradient = this.ctx.createRadialGradient(
            x + TILE_SIZE/2, y + TILE_SIZE*2/3, 0,
            x + TILE_SIZE/2, y + TILE_SIZE*2/3, TILE_SIZE/2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.shadeColor(color, -40));
        
        // Bouncy shape with wobble
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        
        // Calculate wave factor based on time for bouncy effect
        const bounceFactor = Math.sin(Date.now() / 300) * 2;
        
        // Draw upper curve of slime
        this.ctx.moveTo(x + TILE_SIZE/6, y + TILE_SIZE*2/3);
        this.ctx.bezierCurveTo(
            x + TILE_SIZE/6, y + TILE_SIZE/3 - bounceFactor,
            x + TILE_SIZE*5/6, y + TILE_SIZE/3 - bounceFactor,
            x + TILE_SIZE*5/6, y + TILE_SIZE*2/3
        );
        
        // Draw bottom part of slime
        this.ctx.bezierCurveTo(
            x + TILE_SIZE*5/6, y + TILE_SIZE*5/6 + bounceFactor,
            x + TILE_SIZE/6, y + TILE_SIZE*5/6 + bounceFactor,
            x + TILE_SIZE/6, y + TILE_SIZE*2/3
        );
        
        this.ctx.fill();
        
        // Shine
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE*2/5, 
            y + TILE_SIZE*2/5, 
            TILE_SIZE/10, 
            TILE_SIZE/16, 
            Math.PI/4, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE*3/5, TILE_SIZE/16, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE*3/5, TILE_SIZE/16, 0, Math.PI*2);
        this.ctx.fill();
    }
    
    drawBat(x, y, color) {
        // Wing animation based on time
        const wingOffset = Math.sin(Date.now() / 150) * TILE_SIZE/4;
        
        // Body
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/2, 
            y + TILE_SIZE/2, 
            TILE_SIZE/6, 
            TILE_SIZE/4, 
            0, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Left wing
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/3);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE/6, y + TILE_SIZE/4 - wingOffset,
            x + TILE_SIZE/10, y + TILE_SIZE/2
        );
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE/4, y + TILE_SIZE*3/4,
            x + TILE_SIZE/2, y + TILE_SIZE*2/3
        );
        this.ctx.fill();
        
        // Right wing
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/3);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE*5/6, y + TILE_SIZE/4 - wingOffset,
            x + TILE_SIZE*9/10, y + TILE_SIZE/2
        );
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE*3/4, y + TILE_SIZE*3/4,
            x + TILE_SIZE/2, y + TILE_SIZE*2/3
        );
        this.ctx.fill();
        
        // Face
        this.ctx.fillStyle = "#2C2C2C";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/8, 0, Math.PI*2);
        this.ctx.fill();
        
        // Ears
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*2/5, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE*2/5, y + TILE_SIZE/5);
        this.ctx.lineTo(x + TILE_SIZE*3/7, y + TILE_SIZE/3);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*3/5, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE*3/5, y + TILE_SIZE/5);
        this.ctx.lineTo(x + TILE_SIZE*4/7, y + TILE_SIZE/3);
        this.ctx.fill();
        
        // Eyes 
        this.ctx.fillStyle = "#FF3333";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE/2, TILE_SIZE/20, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE/2, TILE_SIZE/20, 0, Math.PI*2);
        this.ctx.fill();
        
        // Fangs
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*9/20, y + TILE_SIZE*3/5);
        this.ctx.lineTo(x + TILE_SIZE*9/20, y + TILE_SIZE*7/10);
        this.ctx.lineTo(x + TILE_SIZE*10/20, y + TILE_SIZE*3/5);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*11/20, y + TILE_SIZE*3/5);
        this.ctx.lineTo(x + TILE_SIZE*11/20, y + TILE_SIZE*7/10);
        this.ctx.lineTo(x + TILE_SIZE*10/20, y + TILE_SIZE*3/5);
        this.ctx.fill();
    }
    
    drawSkeleton(x, y, color) {
        // Skull
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/3, TILE_SIZE/5, 0, Math.PI*2);
        this.ctx.fill();
        
        // Jaw
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/2,
            y + TILE_SIZE*5/12,
            TILE_SIZE/6,
            TILE_SIZE/12,
            0, 0, Math.PI
        );
        this.ctx.fill();
        
        // Eye sockets
        this.ctx.fillStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE/3, TILE_SIZE/14, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE/3, TILE_SIZE/14, 0, Math.PI*2);
        this.ctx.fill();
        
        // Nasal cavity
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE*2/5, TILE_SIZE/20, 0, Math.PI, true);
        this.ctx.fill();
        
        // Ribcage
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        // Spine
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE*5/12);
        this.ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE*3/4);
        this.ctx.stroke();
        
        // Ribs
        for (let i = 0; i < 3; i++) {
            const yOffset = y + TILE_SIZE/2 + i * TILE_SIZE/12;
            
            // Left rib
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/2, yOffset);
            this.ctx.quadraticCurveTo(
                x + TILE_SIZE/3, yOffset + TILE_SIZE/20,
                x + TILE_SIZE/4, yOffset
            );
            this.ctx.stroke();
            
            // Right rib
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/2, yOffset);
            this.ctx.quadraticCurveTo(
                x + TILE_SIZE*2/3, yOffset + TILE_SIZE/20,
                x + TILE_SIZE*3/4, yOffset
            );
            this.ctx.stroke();
        }
        
        // Arms
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/3, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE/5, y + TILE_SIZE*3/4);
        this.ctx.moveTo(x + TILE_SIZE*2/3, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE*4/5, y + TILE_SIZE*3/4);
        this.ctx.stroke();
        
        // Weapon (bone club)
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*4/5, y + TILE_SIZE*3/4);
        this.ctx.lineTo(x + TILE_SIZE*9/10, y + TILE_SIZE/2);
        this.ctx.stroke();
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE*9/10,
            y + TILE_SIZE*2/5,
            TILE_SIZE/10,
            TILE_SIZE/6,
            Math.PI/4, 0, Math.PI*2
        );
        this.ctx.fill();
    }
    
    drawGenericMonster(x, y, color) {
        // Default monster for any type not specifically implemented
        // Body
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI*2);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE*2/5, TILE_SIZE/12, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE*2/5, TILE_SIZE/12, 0, Math.PI*2);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE*2/5, TILE_SIZE/24, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE*2/5, TILE_SIZE/24, 0, Math.PI*2);
        this.ctx.fill();
        
        // Mouth
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE*3/5, TILE_SIZE/8, 0, Math.PI);
        this.ctx.stroke();
    }
    
    drawSword(x, y) {
        // Handle
        this.ctx.fillRect(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2, 4, TILE_SIZE / 3);
        
        // Guard
        this.ctx.fillRect(x + TILE_SIZE / 3, y + TILE_SIZE / 2, TILE_SIZE / 3, 4);
        
        // Blade
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 8);
        this.ctx.lineTo(x + TILE_SIZE / 2 - 6, y + TILE_SIZE / 2);
        this.ctx.lineTo(x + TILE_SIZE / 2 + 6, y + TILE_SIZE / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add shine to the blade
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 4);
        this.ctx.lineTo(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawShield(x, y) {
        // Shield base
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 6);
        this.ctx.lineTo(x + TILE_SIZE * 5/6, y + TILE_SIZE / 3);
        this.ctx.lineTo(x + TILE_SIZE * 5/6, y + TILE_SIZE * 2/3);
        this.ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 5/6);
        this.ctx.lineTo(x + TILE_SIZE / 6, y + TILE_SIZE * 2/3);
        this.ctx.lineTo(x + TILE_SIZE / 6, y + TILE_SIZE / 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Shield border
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Shield emblem
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 3);
        this.ctx.lineTo(x + TILE_SIZE * 2/3, y + TILE_SIZE / 2);
        this.ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 2/3);
        this.ctx.lineTo(x + TILE_SIZE / 3, y + TILE_SIZE / 2);
        this.ctx.closePath();
        this.ctx.strokeStyle = "#FFF";
        this.ctx.stroke();
    }
    
    drawPotion(x, y) {
        // Bottle
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 3, y + TILE_SIZE / 3);
        this.ctx.lineTo(x + TILE_SIZE / 3, y + TILE_SIZE * 3/4);
        this.ctx.quadraticCurveTo(x + TILE_SIZE / 2, y + TILE_SIZE, x + TILE_SIZE * 2/3, y + TILE_SIZE * 3/4);
        this.ctx.lineTo(x + TILE_SIZE * 2/3, y + TILE_SIZE / 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Bottle outline
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Bottle top
        this.ctx.fillRect(x + TILE_SIZE * 2/5, y + TILE_SIZE / 5, TILE_SIZE / 5, TILE_SIZE / 8);
        
        // Cork
        this.ctx.fillStyle = "#A1887F";
        this.ctx.fillRect(x + TILE_SIZE * 2/5, y + TILE_SIZE / 4, TILE_SIZE / 5, TILE_SIZE / 12);
        
        // Liquid fill
        const origColor = this.ctx.fillStyle;
        this.ctx.fillStyle = "#FFFFFF77"; // Semitransparent
        this.ctx.beginPath();
        this.ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 8, TILE_SIZE / 16, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = origColor;
    }
    
    drawGold(x, y) {
        // Gold coin
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Coin border
        this.ctx.strokeStyle = "#FFA000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Coin shine
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE * 2/5, y + TILE_SIZE * 2/5, TILE_SIZE / 8, 0, Math.PI / 2);
        this.ctx.stroke();
        
        // Dollar sign
        this.ctx.fillStyle = "#000";
        this.ctx.font = "bold " + Math.floor(TILE_SIZE / 2) + "px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("$", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    }
    
    drawSpecialItem(x, y) {
        // Draw star shape
        this.ctx.beginPath();
        const centerX = x + TILE_SIZE / 2;
        const centerY = y + TILE_SIZE / 2;
        const spikes = 5;
        const outerRadius = TILE_SIZE / 3;
        const innerRadius = TILE_SIZE / 6;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI * i / spikes - Math.PI / 2;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(pointX, pointY);
            } else {
                this.ctx.lineTo(pointX, pointY);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Star border
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Star shine
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.arc(centerX - TILE_SIZE / 8, centerY - TILE_SIZE / 8, TILE_SIZE / 16, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawNPC(x, y) {
        // Head
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 3, TILE_SIZE / 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Body
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 3 + TILE_SIZE / 5);
        this.ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 3/4);
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Arms
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 4, y + TILE_SIZE / 2);
        this.ctx.lineTo(x + TILE_SIZE * 3/4, y + TILE_SIZE / 2);
        this.ctx.stroke();
        
        // Legs
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE * 3/4);
        this.ctx.lineTo(x + TILE_SIZE / 3, y + TILE_SIZE * 9/10);
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE * 3/4);
        this.ctx.lineTo(x + TILE_SIZE * 2/3, y + TILE_SIZE * 9/10);
        this.ctx.stroke();
        
        // Face
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE * 2/5, y + TILE_SIZE / 3, TILE_SIZE / 16, 0, Math.PI * 2);
        this.ctx.arc(x + TILE_SIZE * 3/5, y + TILE_SIZE / 3, TILE_SIZE / 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE * 2/5, TILE_SIZE / 12, 0, Math.PI);
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawWall(x, y) {
        // Basic wall rectangle
        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        // Add brick pattern
        this.ctx.strokeStyle = "#455A64"; // Darker color for brick lines
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + i * TILE_SIZE / 3);
            this.ctx.lineTo(x + TILE_SIZE, y + i * TILE_SIZE / 3);
            this.ctx.stroke();
        }
        
        // Vertical lines - first row
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 4, y);
        this.ctx.lineTo(x + TILE_SIZE / 4, y + TILE_SIZE / 3);
        this.ctx.moveTo(x + TILE_SIZE * 3 / 4, y);
        this.ctx.lineTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE / 3);
        this.ctx.stroke();
        
        // Vertical lines - second row
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 3);
        this.ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 2 / 3);
        this.ctx.stroke();
        
        // Vertical lines - third row
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE / 4, y + TILE_SIZE * 2 / 3);
        this.ctx.lineTo(x + TILE_SIZE / 4, y + TILE_SIZE);
        this.ctx.moveTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE * 2 / 3);
        this.ctx.lineTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE);
        this.ctx.stroke();
    }
    
    drawDoor(x, y) {
        // Door frame
        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        // Door inset (darker to create depth)
        const doorColor = this.ctx.fillStyle;
        const darkerColor = this.shadeColor(doorColor, -20); // Make it 20% darker
        this.ctx.fillStyle = darkerColor;
        this.ctx.fillRect(x + TILE_SIZE / 8, y + TILE_SIZE / 8, 
                          TILE_SIZE * 3 / 4, TILE_SIZE * 3 / 4);
        
        // Door handle
        this.ctx.fillStyle = "#E0E0E0"; // Light gray for handle
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE * 3 / 4, y + TILE_SIZE / 2, 
                     TILE_SIZE / 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Keyhole
        this.ctx.fillStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE * 3 / 4, y + TILE_SIZE / 2, 
                     TILE_SIZE / 24, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset fill style to the original color
        this.ctx.fillStyle = doorColor;
    }
    
    // Helper function to darken/lighten a color
    shadeColor(color, percent) {
        // Parse the hex color
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        // Adjust the color
        R = Math.max(0, Math.min(255, R + percent));
        G = Math.max(0, Math.min(255, G + percent));
        B = Math.max(0, Math.min(255, B + percent));

        // Convert back to hex
        const RR = R.toString(16).padStart(2, '0');
        const GG = G.toString(16).padStart(2, '0');
        const BB = B.toString(16).padStart(2, '0');

        return `#${RR}${GG}${BB}`;
    }
    
    restartGame() {
        // Reset the game state
        this.currentFloor = 0;
        
        // Generate levels again
        this.levels = [];
        for (let i = 0; i < 20; i++) {
            const levelData = i < LEVELS_DATA.length ? LEVELS_DATA[i] : generateLevel(i);
            this.levels[i] = new Level(levelData, i);
        }
        
        // Reset player
        const startLevel = this.levels[0];
        this.player = new Player(startLevel.playerStartX, startLevel.playerStartY);
        
        // Set current level
        this.currentLevel = startLevel;
        
        // Update display
        document.getElementById('floor-display').textContent = this.currentFloor + 1;
        updateStatsDisplay();
        updateKeyDisplay();
        
        // Ensure game is active
        this.isGameActive = true;
        
        // Render
        this.render();
    }
    
    showGameWinScreen() {
        // Stop the game
        this.isGameActive = false;
        
        // Clear the canvas
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw victory text
        this.ctx.fillStyle = "#F50057"; // Match the final boss color
        this.ctx.font = "bold 32px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("VICTORY!", this.canvas.width / 2, this.canvas.height / 3);
        
        this.ctx.fillStyle = "#FFC107"; // Gold color
        this.ctx.font = "bold 24px Arial";
        this.ctx.fillText("You have conquered", this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText("the Tower of the Sorcerer!", this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "18px Arial";
        this.ctx.fillText(`Final Stats: HP ${this.player.hp}, ATK ${this.player.attack}, DEF ${this.player.defense}`, 
            this.canvas.width / 2, this.canvas.height / 2 + 70);
        this.ctx.fillText(`Gold: ${this.player.gold}, Experience: ${this.player.exp}`, 
            this.canvas.width / 2, this.canvas.height / 2 + 100);
        
        // Add a restart button below the stats
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.style.backgroundColor = "#F50057";
            restartBtn.style.fontSize = "18px";
            restartBtn.style.padding = "12px 24px";
            restartBtn.style.marginTop = "20px";
        }
    }
    
    drawShop(x, y) {
        // Shop base
        this.ctx.fillStyle = COLORS.SHOP;
        this.ctx.fillRect(x + TILE_SIZE / 8, y + TILE_SIZE / 3, TILE_SIZE * 3/4, TILE_SIZE * 2/3);
        
        // Shop roof
        this.ctx.fillStyle = "#880E4F"; // Darker pink
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + TILE_SIZE / 3);
        this.ctx.lineTo(x + TILE_SIZE / 2, y);
        this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Shop window
        this.ctx.fillStyle = "#FFEB3B"; // Yellow light from window
        this.ctx.fillRect(x + TILE_SIZE / 3, y + TILE_SIZE / 2, TILE_SIZE / 3, TILE_SIZE / 4);
        
        // Window frame
        this.ctx.strokeStyle = "#880E4F";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + TILE_SIZE / 3, y + TILE_SIZE / 2, TILE_SIZE / 3, TILE_SIZE / 4);
        
        // Door
        this.ctx.fillStyle = "#6D4C41"; // Brown
        this.ctx.fillRect(x + TILE_SIZE * 3/8, y + TILE_SIZE * 3/4, TILE_SIZE / 4, TILE_SIZE / 4);
        
        // Sign
        this.ctx.fillStyle = "#FFC107"; // Gold
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE * 3/4, y + TILE_SIZE * 2/5, TILE_SIZE / 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Gold sparkle around sign
        this.ctx.strokeStyle = "#FFECB3";
        this.ctx.lineWidth = 1;
        
        // Draw a little star/sparkle
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * i) / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(
                x + TILE_SIZE * 3/4 + Math.cos(angle) * TILE_SIZE / 8,
                y + TILE_SIZE * 2/5 + Math.sin(angle) * TILE_SIZE / 8
            );
            this.ctx.lineTo(
                x + TILE_SIZE * 3/4 + Math.cos(angle) * (TILE_SIZE/8 + TILE_SIZE/10),
                y + TILE_SIZE * 2/5 + Math.sin(angle) * (TILE_SIZE/8 + TILE_SIZE/10)
            );
            this.ctx.stroke();
        }
    }
    
    drawWizard(x, y, color) {
        // Robe
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE*5/6);
        this.ctx.lineTo(x + TILE_SIZE/4, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE/6);
        this.ctx.lineTo(x + TILE_SIZE*3/4, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE*3/4, y + TILE_SIZE*5/6);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Face
        this.ctx.fillStyle = "#F5DEB3"; // Wheat color
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/3, TILE_SIZE/6, 0, Math.PI*2);
        this.ctx.fill();
        
        // Beard
        this.ctx.fillStyle = "#DDDDDD"; // Light gray
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*2/5, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE*3/5, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE*3/5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eyes - glowing
        this.ctx.fillStyle = "#00FFFF"; // Cyan glow
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE/3, TILE_SIZE/18, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE/3, TILE_SIZE/18, 0, Math.PI*2);
        this.ctx.fill();
        
        // Staff
        this.ctx.strokeStyle = "#8B4513"; // Brown
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*3/4, y + TILE_SIZE*2/3);
        this.ctx.lineTo(x + TILE_SIZE*5/6, y + TILE_SIZE/4);
        this.ctx.stroke();
        
        // Staff orb
        const orbGradient = this.ctx.createRadialGradient(
            x + TILE_SIZE*5/6, y + TILE_SIZE/4, 0,
            x + TILE_SIZE*5/6, y + TILE_SIZE/4, TILE_SIZE/8
        );
        
        if (color === "#651FFF") { // Dark Lord's color
            orbGradient.addColorStop(0, "#FF00FF"); // Magenta
            orbGradient.addColorStop(1, "#9900CC"); // Purple
        } else {
            orbGradient.addColorStop(0, "#9C27B0"); // Purple
            orbGradient.addColorStop(1, "#4A148C"); // Deep purple
        }
        
        this.ctx.fillStyle = orbGradient;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*5/6, y + TILE_SIZE/4, TILE_SIZE/8, 0, Math.PI*2);
        this.ctx.fill();
        
        // Magic sparkles
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * i) / 2 + Math.sin(Date.now() / 200) * 0.5;
            const length = TILE_SIZE / 10 + Math.cos(Date.now() / 300) * 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(
                x + TILE_SIZE*5/6 + Math.cos(angle) * TILE_SIZE/8,
                y + TILE_SIZE/4 + Math.sin(angle) * TILE_SIZE/8
            );
            this.ctx.lineTo(
                x + TILE_SIZE*5/6 + Math.cos(angle) * (TILE_SIZE/8 + length),
                y + TILE_SIZE/4 + Math.sin(angle) * (TILE_SIZE/8 + length)
            );
            this.ctx.stroke();
        }
    }
    
    drawKnight(x, y, color) {
        // Draw helmet
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/3, TILE_SIZE/5, 0, Math.PI*2);
        this.ctx.fill();
        
        // Helmet details/visor
        this.ctx.fillStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/3, TILE_SIZE/8, 0, Math.PI, true);
        this.ctx.fill();
        
        // Armor/body
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/3, y + TILE_SIZE*5/12);
        this.ctx.lineTo(x + TILE_SIZE*2/3, y + TILE_SIZE*5/12);
        this.ctx.lineTo(x + TILE_SIZE*2/3, y + TILE_SIZE*3/4);
        this.ctx.lineTo(x + TILE_SIZE/3, y + TILE_SIZE*3/4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Armor plates
        this.ctx.strokeStyle = this.shadeColor(color, -40);
        this.ctx.lineWidth = 1;
        
        // Horizontal plates
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/3, y + TILE_SIZE*5/12 + i * TILE_SIZE/8);
            this.ctx.lineTo(x + TILE_SIZE*2/3, y + TILE_SIZE*5/12 + i * TILE_SIZE/8);
            this.ctx.stroke();
        }
        
        // Shield
        this.ctx.fillStyle = this.shadeColor(color, 40);
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE/4, y + TILE_SIZE*3/4);
        this.ctx.lineTo(x + TILE_SIZE*2/5, y + TILE_SIZE*4/5);
        this.ctx.lineTo(x + TILE_SIZE*2/5, y + TILE_SIZE*2/5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Shield emblem
        this.ctx.strokeStyle = "#FFD700"; // Gold
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*3/10, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE*3/10, y + TILE_SIZE*7/10);
        this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE*3/5);
        this.ctx.lineTo(x + TILE_SIZE*2/5, y + TILE_SIZE*3/5);
        this.ctx.stroke();
        
        // Sword
        this.ctx.strokeStyle = "#C0C0C0"; // Silver
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*2/3, y + TILE_SIZE*2/3);
        this.ctx.lineTo(x + TILE_SIZE*4/5, y + TILE_SIZE/3);
        this.ctx.stroke();
        
        // Sword hilt
        this.ctx.strokeStyle = "#8B4513"; // Brown
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*2/3 - 2, y + TILE_SIZE*2/3 + 2);
        this.ctx.lineTo(x + TILE_SIZE*2/3 + 5, y + TILE_SIZE*2/3 + 5);
        this.ctx.stroke();
    }
    
    drawGolem(x, y, color) {
        // Rocky body texture
        const bodyGradient = this.ctx.createRadialGradient(
            x + TILE_SIZE/2, y + TILE_SIZE/2, 0,
            x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2
        );
        bodyGradient.addColorStop(0, color);
        bodyGradient.addColorStop(1, this.shadeColor(color, -50));
        
        // Main body - asymmetric and rocky
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE*4/5);
        this.ctx.lineTo(x + TILE_SIZE/6, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE/4, y + TILE_SIZE/4);
        this.ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE/6);
        this.ctx.lineTo(x + TILE_SIZE*3/4, y + TILE_SIZE/4);
        this.ctx.lineTo(x + TILE_SIZE*5/6, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE*3/4, y + TILE_SIZE*4/5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Rock texture/cracks
        this.ctx.strokeStyle = this.shadeColor(color, -70);
        this.ctx.lineWidth = 1;
        
        // Random cracks
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/3, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE*2/3, y + TILE_SIZE/3);
        this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
        this.ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE*3/4);
        this.ctx.stroke();
        
        // Glowing eyes
        const eyeGradient = this.ctx.createRadialGradient(
            x + TILE_SIZE/3, y + TILE_SIZE*2/5, 0,
            x + TILE_SIZE/3, y + TILE_SIZE*2/5, TILE_SIZE/10
        );
        eyeGradient.addColorStop(0, "#FF6600"); // Orange glow
        eyeGradient.addColorStop(1, "#FF0000"); // Red edge
        
        this.ctx.fillStyle = eyeGradient;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/3, y + TILE_SIZE*2/5, TILE_SIZE/10, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*2/3, y + TILE_SIZE*2/5, TILE_SIZE/10, 0, Math.PI*2);
        this.ctx.fill();
        
        // Fists/hands
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/6, y + TILE_SIZE*2/3, TILE_SIZE/9, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*5/6, y + TILE_SIZE*2/3, TILE_SIZE/9, 0, Math.PI*2);
        this.ctx.fill();
    }
    
    drawDemon(x, y, color) {
        // Flame animation effect
        const flameOffsetY = Math.sin(Date.now() / 200) * 2;
        
        // Body - with horns
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        
        // Main body
        this.ctx.ellipse(
            x + TILE_SIZE/2, 
            y + TILE_SIZE/2, 
            TILE_SIZE/3, 
            TILE_SIZE/2.5, 
            0, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Horns
        this.ctx.beginPath();
        
        // Left horn
        this.ctx.moveTo(x + TILE_SIZE/3, y + TILE_SIZE/4);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE/5, y, 
            x + TILE_SIZE/8, y + TILE_SIZE/6
        );
        
        // Right horn
        this.ctx.moveTo(x + TILE_SIZE*2/3, y + TILE_SIZE/4);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE*4/5, y, 
            x + TILE_SIZE*7/8, y + TILE_SIZE/6
        );
        
        this.ctx.strokeStyle = this.shadeColor(color, -30);
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Eyes - glowing
        const eyeGradient = this.ctx.createRadialGradient(
            x + TILE_SIZE/3, y + TILE_SIZE*2/5, 0,
            x + TILE_SIZE/3, y + TILE_SIZE*2/5, TILE_SIZE/12
        );
        eyeGradient.addColorStop(0, "#FFFF00"); // Yellow core
        eyeGradient.addColorStop(1, "#FF0000"); // Red edge
        
        this.ctx.fillStyle = eyeGradient;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/3, y + TILE_SIZE*2/5, TILE_SIZE/12, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*2/3, y + TILE_SIZE*2/5, TILE_SIZE/12, 0, Math.PI*2);
        this.ctx.fill();
        
        // Mouth with fangs
        this.ctx.fillStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/2,
            y + TILE_SIZE*3/5,
            TILE_SIZE/6,
            TILE_SIZE/12,
            0, 0, Math.PI
        );
        this.ctx.fill();
        
        // Fangs
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        
        // Left fang
        this.ctx.moveTo(x + TILE_SIZE*2/5, y + TILE_SIZE*3/5);
        this.ctx.lineTo(x + TILE_SIZE*2/5 - 3, y + TILE_SIZE*3/5 + 5);
        this.ctx.lineTo(x + TILE_SIZE*2/5 + 3, y + TILE_SIZE*3/5 + 5);
        this.ctx.fill();
        
        // Right fang
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*3/5, y + TILE_SIZE*3/5);
        this.ctx.lineTo(x + TILE_SIZE*3/5 - 3, y + TILE_SIZE*3/5 + 5);
        this.ctx.lineTo(x + TILE_SIZE*3/5 + 3, y + TILE_SIZE*3/5 + 5);
        this.ctx.fill();
        
        // Fire effects around the demon
        this.ctx.fillStyle = "rgba(255, 165, 0, 0.5)"; // Semi-transparent orange
        
        // Random flame shapes
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * i) / 4;
            const distance = TILE_SIZE/3 + Math.sin(Date.now() / 200 + i) * 3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
            this.ctx.quadraticCurveTo(
                x + TILE_SIZE/2 + Math.cos(angle) * distance/2,
                y + TILE_SIZE/2 + Math.sin(angle) * distance/2 - flameOffsetY,
                x + TILE_SIZE/2 + Math.cos(angle) * distance,
                y + TILE_SIZE/2 + Math.sin(angle) * distance
            );
            this.ctx.quadraticCurveTo(
                x + TILE_SIZE/2 + Math.cos(angle + 0.2) * distance/2,
                y + TILE_SIZE/2 + Math.sin(angle + 0.2) * distance/2 - flameOffsetY,
                x + TILE_SIZE/2,
                y + TILE_SIZE/2
            );
            this.ctx.fill();
        }
    }
    
    drawDragon(x, y, color) {
        // Animation for breathing effect
        const breathEffect = Math.sin(Date.now() / 300) * 2;
        
        // Body
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/2,
            y + TILE_SIZE/2,
            TILE_SIZE/3,
            TILE_SIZE/4,
            0, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Neck and head
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/3,
            y + TILE_SIZE/3,
            TILE_SIZE/6,
            TILE_SIZE/8,
            -Math.PI/4, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Head
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/5,
            y + TILE_SIZE/4,
            TILE_SIZE/8,
            TILE_SIZE/10,
            -Math.PI/3, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Snout
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/5, y + TILE_SIZE/4);
        this.ctx.lineTo(x + TILE_SIZE/10, y + TILE_SIZE/5);
        this.ctx.lineTo(x + TILE_SIZE/8, y + TILE_SIZE/3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wings
        this.ctx.beginPath();
        
        // Left wing
        this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE/4, y + TILE_SIZE/8,
            x + TILE_SIZE/8, y + TILE_SIZE/2
        );
        
        // Right wing
        this.ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE*3/4, y + TILE_SIZE/6,
            x + TILE_SIZE*9/10, y + TILE_SIZE/3
        );
        
        this.ctx.strokeStyle = this.shadeColor(color, 30);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Tail
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*2/3, y + TILE_SIZE/2);
        this.ctx.quadraticCurveTo(
            x + TILE_SIZE*5/6, y + TILE_SIZE*2/3,
            x + TILE_SIZE*9/10, y + TILE_SIZE*3/4
        );
        this.ctx.stroke();
        
        // Eyes
        this.ctx.fillStyle = "#FFCC00"; // Golden yellow
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + TILE_SIZE/6,
            y + TILE_SIZE/5,
            TILE_SIZE/28,
            TILE_SIZE/20,
            -Math.PI/4, 0, Math.PI*2
        );
        this.ctx.fill();
        
        // Fire breath
        if (breathEffect > 0) {
            const fireGradient = this.ctx.createRadialGradient(
                x, y + TILE_SIZE/4, 0,
                x, y + TILE_SIZE/4, TILE_SIZE/3
            );
            fireGradient.addColorStop(0, "rgba(255, 255, 0, 0.8)");
            fireGradient.addColorStop(0.5, "rgba(255, 165, 0, 0.6)");
            fireGradient.addColorStop(1, "rgba(255, 0, 0, 0)");
            
            this.ctx.fillStyle = fireGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(x + TILE_SIZE/10, y + TILE_SIZE/4);
            
            // Fire cone shape
            for (let i = 0; i < 5; i++) {
                const fireX = x - TILE_SIZE/3 - i * TILE_SIZE/10;
                const fireY = y + TILE_SIZE/4 + (Math.random() - 0.5) * TILE_SIZE/5;
                this.ctx.lineTo(fireX, fireY);
            }
            
            this.ctx.lineTo(x - TILE_SIZE/3, y + TILE_SIZE/2);
            this.ctx.lineTo(x + TILE_SIZE/10, y + TILE_SIZE/4);
            this.ctx.fill();
        }
        
        // Spikes on back
        this.ctx.fillStyle = this.shadeColor(color, 40);
        for (let i = 0; i < 4; i++) {
            const spikeX = x + TILE_SIZE*1/3 + i * TILE_SIZE/9;
            
            this.ctx.beginPath();
            this.ctx.moveTo(spikeX, y + TILE_SIZE*2/5);
            this.ctx.lineTo(spikeX, y + TILE_SIZE/4);
            this.ctx.lineTo(spikeX + TILE_SIZE/20, y + TILE_SIZE*2/5);
            this.ctx.fill();
        }
    }
    
    drawDarkLord(x, y, color) {
        // Shadow effect
        const shadowGradient = this.ctx.createRadialGradient(
            x + TILE_SIZE/2, y + TILE_SIZE*2/3, 0,
            x + TILE_SIZE/2, y + TILE_SIZE*2/3, TILE_SIZE
        );
        shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
        shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        // Draw shadow beneath
        this.ctx.fillStyle = shadowGradient;
        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        
        // Cloak with hood
        this.ctx.fillStyle = color;
        
        // Hood/head
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/3, TILE_SIZE/4, 0, Math.PI*2);
        this.ctx.fill();
        
        // Body/cloak
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE/4, y + TILE_SIZE/3);
        this.ctx.lineTo(x + TILE_SIZE/6, y + TILE_SIZE*3/4);
        this.ctx.lineTo(x + TILE_SIZE*5/6, y + TILE_SIZE*3/4);
        this.ctx.lineTo(x + TILE_SIZE*3/4, y + TILE_SIZE/3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Dark void for face, only glowing eyes visible
        this.ctx.fillStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/3, TILE_SIZE/6, 0, Math.PI*2);
        this.ctx.fill();
        
        // Glowing eyes - pulsing
        const pulseIntensity = 0.7 + Math.sin(Date.now() / 300) * 0.3;
        
        // Customize the color based on the original color
        let eyeColor;
        if (color === "#651FFF") { // Dark Lord's color
            eyeColor = `rgba(255, 0, 255, ${pulseIntensity})`;
        } else {
            eyeColor = `rgba(255, 0, 0, ${pulseIntensity})`;
        }
        
        this.ctx.fillStyle = eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*2/5, y + TILE_SIZE/3, TILE_SIZE/16, 0, Math.PI*2);
        this.ctx.arc(x + TILE_SIZE*3/5, y + TILE_SIZE/3, TILE_SIZE/16, 0, Math.PI*2);
        this.ctx.fill();
        
        // Dark magic aura
        this.ctx.strokeStyle = this.shadeColor(color, 50);
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * i) / 4 + Date.now() / 1000;
            const innerRadius = TILE_SIZE/3;
            const outerRadius = TILE_SIZE/2 + Math.sin(Date.now() / 400 + i) * 3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(
                x + TILE_SIZE/2 + Math.cos(angle) * innerRadius,
                y + TILE_SIZE/2 + Math.sin(angle) * innerRadius
            );
            this.ctx.lineTo(
                x + TILE_SIZE/2 + Math.cos(angle) * outerRadius,
                y + TILE_SIZE/2 + Math.sin(angle) * outerRadius
            );
            this.ctx.stroke();
        }
        
        // Staff with crystal
        this.ctx.strokeStyle = "#8B4513"; // Brown
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + TILE_SIZE*5/6, y + TILE_SIZE*3/4);
        this.ctx.lineTo(x + TILE_SIZE*5/6, y + TILE_SIZE/5);
        this.ctx.stroke();
        
        // Crystal
        const crystalGradient = this.ctx.createRadialGradient(
            x + TILE_SIZE*5/6, y + TILE_SIZE/6, 0,
            x + TILE_SIZE*5/6, y + TILE_SIZE/6, TILE_SIZE/8
        );
        
        if (color === "#651FFF") { // Dark Lord's color
            crystalGradient.addColorStop(0, "#FF00FF"); // Magenta
            crystalGradient.addColorStop(1, "#9900CC"); // Purple
        } else {
            crystalGradient.addColorStop(0, "#9C27B0"); // Purple
            crystalGradient.addColorStop(1, "#4A148C"); // Deep purple
        }
        
        this.ctx.fillStyle = crystalGradient;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE*5/6, y + TILE_SIZE/6, TILE_SIZE/8, 0, Math.PI*2);
        this.ctx.fill();
    }
}

let game; 