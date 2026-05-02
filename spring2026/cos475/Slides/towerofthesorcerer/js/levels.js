class Level {
    constructor(levelData, floorNumber) {
        this.floorNumber = floorNumber;
        this.grid = this.createGrid(levelData);
        this.playerStartX = levelData.playerStartX;
        this.playerStartY = levelData.playerStartY;
    }

    createGrid(levelData) {
        const grid = [];
        
        // Initialize with empty cells
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                row.push(new Empty(x, y));
            }
            grid.push(row);
        }
        
        // Place walls
        if (levelData.walls) {
            for (const wall of levelData.walls) {
                grid[wall.y][wall.x] = new Wall(wall.x, wall.y);
            }
        }
        
        // Place doors
        if (levelData.yellowDoors) {
            for (const door of levelData.yellowDoors) {
                grid[door.y][door.x] = new Door(ENTITY_TYPES.YELLOW_DOOR, door.x, door.y);
            }
        }
        if (levelData.blueDoors) {
            for (const door of levelData.blueDoors) {
                grid[door.y][door.x] = new Door(ENTITY_TYPES.BLUE_DOOR, door.x, door.y);
            }
        }
        if (levelData.redDoors) {
            for (const door of levelData.redDoors) {
                grid[door.y][door.x] = new Door(ENTITY_TYPES.RED_DOOR, door.x, door.y);
            }
        }
        
        // Place keys
        if (levelData.yellowKeys) {
            for (const key of levelData.yellowKeys) {
                grid[key.y][key.x] = new Key(ENTITY_TYPES.YELLOW_KEY, key.x, key.y);
            }
        }
        if (levelData.blueKeys) {
            for (const key of levelData.blueKeys) {
                grid[key.y][key.x] = new Key(ENTITY_TYPES.BLUE_KEY, key.x, key.y);
            }
        }
        if (levelData.redKeys) {
            for (const key of levelData.redKeys) {
                grid[key.y][key.x] = new Key(ENTITY_TYPES.RED_KEY, key.x, key.y);
            }
        }
        
        // Place stairs
        if (levelData.stairsUp) {
            for (const stairs of levelData.stairsUp) {
                grid[stairs.y][stairs.x] = new Stairs(ENTITY_TYPES.STAIRS_UP, stairs.x, stairs.y, this.floorNumber + 1);
            }
        }
        if (levelData.stairsDown) {
            for (const stairs of levelData.stairsDown) {
                grid[stairs.y][stairs.x] = new Stairs(ENTITY_TYPES.STAIRS_DOWN, stairs.x, stairs.y, this.floorNumber - 1);
            }
        }
        
        // Place monsters
        if (levelData.monsters) {
            for (const monster of levelData.monsters) {
                let monsterType;
                switch(monster.type) {
                    case 'slime': monsterType = MONSTERS.SLIME; break;
                    case 'bat': monsterType = MONSTERS.BAT; break;
                    case 'skeleton': monsterType = MONSTERS.SKELETON; break;
                    case 'wizard': monsterType = MONSTERS.WIZARD; break;
                    case 'knight': monsterType = MONSTERS.KNIGHT; break;
                    case 'golem': monsterType = MONSTERS.GOLEM; break;
                    case 'demon': monsterType = MONSTERS.DEMON; break;
                    case 'dragon': monsterType = MONSTERS.DRAGON; break;
                    case 'darkLord': monsterType = MONSTERS.DARK_LORD; break;
                    case 'finalBoss': monsterType = MONSTERS.FINAL_BOSS; break;
                    default: monsterType = MONSTERS.SLIME;
                }
                grid[monster.y][monster.x] = new Monster(monsterType, monster.x, monster.y);
            }
        }
        
        // Place items
        if (levelData.swords) {
            for (const sword of levelData.swords) {
                let swordType;
                switch(sword.type) {
                    case 'iron': swordType = ITEMS.IRON_SWORD; break;
                    case 'steel': swordType = ITEMS.STEEL_SWORD; break;
                    case 'magic': swordType = ITEMS.MAGIC_SWORD; break;
                    default: swordType = ITEMS.IRON_SWORD;
                }
                grid[sword.y][sword.x] = new Sword(swordType, sword.x, sword.y);
            }
        }
        if (levelData.shields) {
            for (const shield of levelData.shields) {
                let shieldType;
                switch(shield.type) {
                    case 'iron': shieldType = ITEMS.IRON_SHIELD; break;
                    case 'steel': shieldType = ITEMS.STEEL_SHIELD; break;
                    case 'magic': shieldType = ITEMS.MAGIC_SHIELD; break;
                    default: shieldType = ITEMS.IRON_SHIELD;
                }
                grid[shield.y][shield.x] = new Shield(shieldType, shield.x, shield.y);
            }
        }
        if (levelData.potions) {
            for (const potion of levelData.potions) {
                let potionType;
                switch(potion.type) {
                    case 'small': potionType = ITEMS.SMALL_POTION; break;
                    case 'large': potionType = ITEMS.LARGE_POTION; break;
                    default: potionType = ITEMS.SMALL_POTION;
                }
                grid[potion.y][potion.x] = new Potion(potionType, potion.x, potion.y);
            }
        }
        if (levelData.gold) {
            for (const gold of levelData.gold) {
                grid[gold.y][gold.x] = new Gold(gold.x, gold.y, gold.value || 10);
            }
        }
        
        // Place NPCs
        if (levelData.npcs) {
            for (const npc of levelData.npcs) {
                grid[npc.y][npc.x] = new NPC(npc.x, npc.y, npc.message);
            }
        }
        
        // Place Shops
        if (levelData.shops) {
            for (const shop of levelData.shops) {
                grid[shop.y][shop.x] = new Shop(shop.x, shop.y);
            }
        }
        
        return grid;
    }

    removeEntity(x, y) {
        this.grid[y][x] = new Empty(x, y);
    }
}

// Define the levels data structure
const LEVELS_DATA = [
    // Level 1
    {
        playerStartX: 6,
        playerStartY: 11,
        walls: [
            // Border walls
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: 0 })),
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: GRID_HEIGHT - 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: 0, y: i + 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: GRID_WIDTH - 1, y: i + 1 })),
            
            // Interior walls
            { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
            { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
            { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
            { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 },
            { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, 
            { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 10, y: 6 },
            { x: 2, y: 8 }, { x: 4, y: 8 }, { x: 8, y: 8 }, { x: 10, y: 8 },
            { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }
        ],
        yellowDoors: [
            { x: 6, y: 8 }
        ],
        yellowKeys: [
            { x: 6, y: 3 }
        ],
        stairsUp: [
            { x: 6, y: 7 }
        ],
        monsters: [
            { x: 3, y: 3, type: 'slime' },
            { x: 9, y: 3, type: 'slime' },
            { x: 3, y: 7, type: 'bat' },
            { x: 9, y: 7, type: 'bat' }
        ],
        potions: [
            { x: 2, y: 10, type: 'small' }
        ],
        swords: [
            { x: 10, y: 10, type: 'iron' }
        ],
        shops: [
            { x: 6, y: 10 }
        ],
        gold: [
            { x: 2, y: 3, value: 20 },
            { x: 10, y: 3, value: 20 }
        ]
    },
    // Level 2
    {
        playerStartX: 6,
        playerStartY: 1,
        walls: [
            // Border walls
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: 0 })),
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: GRID_HEIGHT - 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: 0, y: i + 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: GRID_WIDTH - 1, y: i + 1 })),
            
            // Interior walls
            { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 10, y: 2 },
            { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 8, y: 3 }, { x: 10, y: 3 },
            { x: 2, y: 4 }, { x: 6, y: 4 }, { x: 10, y: 4 },
            { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 6, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 },
            { x: 6, y: 6 },
            { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 6, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },
            { x: 2, y: 8 }, { x: 6, y: 8 }, { x: 10, y: 8 },
            { x: 2, y: 9 }, { x: 4, y: 9 }, { x: 8, y: 9 }, { x: 10, y: 9 },
            { x: 2, y: 10 }, { x: 4, y: 10 }, { x: 5, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 10, y: 10 }
        ],
        yellowDoors: [
            { x: 6, y: 3 }
        ],
        blueDoors: [
            { x: 6, y: 9 }
        ],
        yellowKeys: [
            { x: 5, y: 3 },
            { x: 7, y: 3 }
        ],
        blueKeys: [
            { x: 5, y: 8 }
        ],
        stairsUp: [
            { x: 6, y: 10 }
        ],
        stairsDown: [
            { x: 6, y: 2 }
        ],
        monsters: [
            { x: 3, y: 3, type: 'slime' },
            { x: 9, y: 3, type: 'slime' },
            { x: 3, y: 6, type: 'bat' },
            { x: 9, y: 6, type: 'bat' },
            { x: 3, y: 9, type: 'skeleton' },
            { x: 9, y: 9, type: 'skeleton' }
        ],
        potions: [
            { x: 5, y: 6, type: 'small' },
            { x: 7, y: 6, type: 'small' }
        ],
        shields: [
            { x: 7, y: 8, type: 'iron' }
        ],
        gold: [
            { x: 3, y: 4, value: 20 },
            { x: 9, y: 4, value: 20 }
        ]
    }
];

// Generate levels up to 20 floors
for (let i = 2; i < 20; i++) {
    LEVELS_DATA.push(i === 19 ? generateFinalBossLevel() : generateLevel(i));
}

// Function to generate additional levels dynamically
function generateLevel(floorNumber) {
    let level;
    let isValid = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    
    // Keep generating until we get a valid level or reach max attempts
    while (!isValid && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // Basic level structure
        level = {
            playerStartX: 6,
            playerStartY: 6,
            walls: [
                // Border walls
                ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: 0 })),
                ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: GRID_HEIGHT - 1 })),
                ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: 0, y: i + 1 })),
                ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: GRID_WIDTH - 1, y: i + 1 }))
            ],
            yellowDoors: [],
            blueDoors: [],
            redDoors: [],
            yellowKeys: [],
            blueKeys: [],
            redKeys: [],
            stairsUp: [],
            stairsDown: [],
            monsters: [],
            potions: [],
            swords: [],
            shields: [],
            gold: [],
            shops: []
        };
        
        // Add interior walls randomly with reduced density
        const wallCount = 20 + Math.floor(Math.random() * 15); // 20-35 walls
        const wallPositions = new Set(); // Track wall positions to avoid duplicates
        
        for (let i = 0; i < wallCount; i++) {
            const x = 1 + Math.floor(Math.random() * (GRID_WIDTH - 2));
            const y = 1 + Math.floor(Math.random() * (GRID_HEIGHT - 2));
            
            // Don't place walls at player start, stairs locations, or if already walled
            const positionKey = `${x},${y}`;
            if ((x === level.playerStartX && y === level.playerStartY) ||
                (x === 6 && y === 2) || (x === 6 && y === 10) ||
                wallPositions.has(positionKey)) {
                continue;
            }
            
            level.walls.push({ x, y });
            wallPositions.add(positionKey);
        }
        
        // Add stairs - placed first to ensure they're accessible
        if (floorNumber < 19) {
            level.stairsUp.push({ x: 6, y: 10 });
            wallPositions.add("6,10");
        }
        
        if (floorNumber > 0) {
            level.stairsDown.push({ x: 6, y: 2 });
            wallPositions.add("6,2");
        }
        
        // Add doors and keys in a balanced way
        const yellowDoorCount = Math.min(2, Math.floor(floorNumber / 3));
        const blueDoorCount = Math.min(1, Math.floor((floorNumber - 3) / 3));
        const redDoorCount = Math.min(1, Math.floor((floorNumber - 6) / 3));
        
        // Add keys first - ensure they're accessible
        const availableSpots = [];
        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
            for (let x = 1; x < GRID_WIDTH - 1; x++) {
                const posKey = `${x},${y}`;
                if (!wallPositions.has(posKey) && 
                    !(x === level.playerStartX && y === level.playerStartY)) {
                    availableSpots.push({ x, y });
                }
            }
        }
        shuffleArray(availableSpots);
        
        // Place yellow keys
        let keyIndex = 0;
        for (let i = 0; i < yellowDoorCount + 1 && keyIndex < availableSpots.length; i++) {
            level.yellowKeys.push({ x: availableSpots[keyIndex].x, y: availableSpots[keyIndex].y });
            wallPositions.add(`${availableSpots[keyIndex].x},${availableSpots[keyIndex].y}`);
            keyIndex++;
        }
        
        // Place blue keys
        for (let i = 0; i < blueDoorCount + 1 && keyIndex < availableSpots.length; i++) {
            level.blueKeys.push({ x: availableSpots[keyIndex].x, y: availableSpots[keyIndex].y });
            wallPositions.add(`${availableSpots[keyIndex].x},${availableSpots[keyIndex].y}`);
            keyIndex++;
        }
        
        // Place red keys
        for (let i = 0; i < redDoorCount + 1 && keyIndex < availableSpots.length; i++) {
            level.redKeys.push({ x: availableSpots[keyIndex].x, y: availableSpots[keyIndex].y });
            wallPositions.add(`${availableSpots[keyIndex].x},${availableSpots[keyIndex].y}`);
            keyIndex++;
        }
        
        // Place doors strategically
        const doorPositions = [
            { x: 4, y: 6 }, // Left
            { x: 8, y: 6 }, // Right
            { x: 6, y: 4 }, // Up
            { x: 6, y: 8 }  // Down
        ];
        shuffleArray(doorPositions);
        
        let doorIndex = 0;
        // Yellow doors
        for (let i = 0; i < yellowDoorCount && doorIndex < doorPositions.length; i++) {
            const door = doorPositions[doorIndex];
            if (!wallPositions.has(`${door.x},${door.y}`)) {
                level.yellowDoors.push({ x: door.x, y: door.y });
                wallPositions.add(`${door.x},${door.y}`);
                doorIndex++;
            }
        }
        
        // Blue doors
        for (let i = 0; i < blueDoorCount && doorIndex < doorPositions.length; i++) {
            const door = doorPositions[doorIndex];
            if (!wallPositions.has(`${door.x},${door.y}`)) {
                level.blueDoors.push({ x: door.x, y: door.y });
                wallPositions.add(`${door.x},${door.y}`);
                doorIndex++;
            }
        }
        
        // Red doors
        for (let i = 0; i < redDoorCount && doorIndex < doorPositions.length; i++) {
            const door = doorPositions[doorIndex];
            if (!wallPositions.has(`${door.x},${door.y}`)) {
                level.redDoors.push({ x: door.x, y: door.y });
                wallPositions.add(`${door.x},${door.y}`);
                doorIndex++;
            }
        }
        
        // Add shop (every 3 levels, starting from level 2)
        if (floorNumber % 3 === 2 && floorNumber < 18) {
            // Find a good spot for the shop
            for (let i = 0; i < availableSpots.length; i++) {
                const spot = availableSpots[i];
                if (!wallPositions.has(`${spot.x},${spot.y}`)) {
                    level.shops.push({ x: spot.x, y: spot.y });
                    wallPositions.add(`${spot.x},${spot.y}`);
                    break;
                }
            }
        }
        
        // Add monsters, potions, and items with remaining spaces
        const remainingSpots = [];
        for (let i = keyIndex; i < availableSpots.length; i++) {
            const spot = availableSpots[i];
            if (!wallPositions.has(`${spot.x},${spot.y}`)) {
                remainingSpots.push(spot);
            }
        }
        shuffleArray(remainingSpots);
        
        // Add monsters (balanced by floor level)
        const monsterCount = 3 + Math.floor(floorNumber / 2);
        const monsterTypes = ['slime', 'bat', 'skeleton', 'wizard', 'knight', 'golem', 'demon', 'dragon'];
        
        for (let i = 0; i < monsterCount && i < remainingSpots.length; i++) {
            // Select monster type based on floor
            let typeIndex = Math.min(Math.floor(floorNumber / 3), monsterTypes.length - 1);
            // Add some randomness to monster selection
            typeIndex = Math.max(0, typeIndex - Math.floor(Math.random() * 2));
            
            level.monsters.push({
                x: remainingSpots[i].x,
                y: remainingSpots[i].y,
                type: monsterTypes[typeIndex]
            });
            wallPositions.add(`${remainingSpots[i].x},${remainingSpots[i].y}`);
        }
        
        // Add items with remaining spots
        let itemIndex = monsterCount;
        
        // Potions
        const potionCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < potionCount && itemIndex < remainingSpots.length; i++) {
            const type = Math.random() > 0.7 ? 'large' : 'small';
            level.potions.push({
                x: remainingSpots[itemIndex].x,
                y: remainingSpots[itemIndex].y,
                type: type
            });
            itemIndex++;
        }
        
        // Swords - one every 3 floors
        if (floorNumber % 3 === 0 && itemIndex < remainingSpots.length) {
            let type = 'iron';
            if (floorNumber >= 6) type = 'steel';
            if (floorNumber >= 12) type = 'magic';
            
            level.swords.push({
                x: remainingSpots[itemIndex].x,
                y: remainingSpots[itemIndex].y,
                type: type
            });
            itemIndex++;
        }
        
        // Shields - one every 3 floors, offset by 1
        if (floorNumber % 3 === 1 && itemIndex < remainingSpots.length) {
            let type = 'iron';
            if (floorNumber >= 7) type = 'steel';
            if (floorNumber >= 13) type = 'magic';
            
            level.shields.push({
                x: remainingSpots[itemIndex].x,
                y: remainingSpots[itemIndex].y,
                type: type
            });
            itemIndex++;
        }
        
        // Gold - several pieces per floor
        const goldCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < goldCount && itemIndex < remainingSpots.length; i++) {
            const value = 10 * (1 + Math.floor(floorNumber / 3));
            level.gold.push({
                x: remainingSpots[itemIndex].x,
                y: remainingSpots[itemIndex].y,
                value: value
            });
            itemIndex++;
        }
        
        // Validate the level
        isValid = validateLevel(level);
    }
    
    console.log(`Generated level ${floorNumber} after ${attempts} attempts, valid: ${isValid}`);
    
    // If we couldn't create a valid level after max attempts, use a fallback
    if (!isValid) {
        console.warn(`Could not generate valid level for floor ${floorNumber}, using fallback`);
        return generateFallbackLevel(floorNumber);
    }
    
    return level;
}

// Function to generate the final boss level
function generateFinalBossLevel() {
    const level = {
        playerStartX: 6,
        playerStartY: 10,  // Position the player in the clear corridor
        walls: [
            // Border walls
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: 0 })),
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: GRID_HEIGHT - 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: 0, y: i + 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: GRID_WIDTH - 1, y: i + 1 })),
            
            // Interior walls to make a throne room
            { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, 
            { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 }, { x: 11, y: 2 },
            { x: 1, y: 3 }, { x: 11, y: 3 },
            { x: 1, y: 4 }, { x: 11, y: 4 },
            { x: 1, y: 5 }, { x: 11, y: 5 },
            { x: 1, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 11, y: 6 },
            { x: 3, y: 7 }, { x: 9, y: 7 },
            { x: 3, y: 8 }, { x: 9, y: 8 },
            { x: 3, y: 9 }, { x: 9, y: 9 },
            // Only walls at sides of the corridor, leaving a clear path to the stairs
            { x: 3, y: 10 }, { x: 4, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }
            // Position (6,10) is deliberately kept clear as the player's starting position
        ],
        yellowDoors: [],
        blueDoors: [],
        redDoors: [
            { x: 6, y: 9 } // The red door blocks access to the boss room
        ],
        yellowKeys: [],
        blueKeys: [],
        redKeys: [
            { x: 2, y: 7 },
            { x: 10, y: 7 }
        ],
        stairsDown: [
            { x: 6, y: 11 } // Stairs are in the clear area
        ],
        monsters: [
            // Final Boss in the middle of the throne room
            { x: 6, y: 3, type: 'finalBoss' },
            
            // Guards
            { x: 5, y: 5, type: 'dragon' },
            { x: 7, y: 5, type: 'dragon' },
            { x: 2, y: 8, type: 'demon' },
            { x: 10, y: 8, type: 'demon' }
        ],
        potions: [
            { x: 2, y: 4, type: 'large' },
            { x: 10, y: 4, type: 'large' }
        ],
        swords: [
            { x: 5, y: 8, type: 'magic' }
        ],
        shields: [
            { x: 7, y: 8, type: 'magic' }
        ],
        gold: [
            { x: 4, y: 3, value: 200 },
            { x: 8, y: 3, value: 200 }
        ]
    };
    
    return level;
}

// Function to validate if a level is playable
function validateLevel(level) {
    // Create a grid representation for pathfinding
    const grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
    
    // Mark walls and doors as obstacles
    for (const wall of level.walls) {
        grid[wall.y][wall.x] = 1; // Wall
    }
    
    for (const door of level.yellowDoors) {
        grid[door.y][door.x] = 2; // Yellow door
    }
    
    for (const door of level.blueDoors) {
        grid[door.y][door.x] = 3; // Blue door
    }
    
    for (const door of level.redDoors) {
        grid[door.y][door.x] = 4; // Red door
    }
    
    // Check if player start position is valid
    if (grid[level.playerStartY][level.playerStartX] !== 0) {
        return false;
    }
    
    // Verify that the player can reach all key items and stairs
    const start = { x: level.playerStartX, y: level.playerStartY };
    
    // Check if stairs up is reachable (considering keys available)
    if (level.stairsUp.length > 0) {
        if (!canReach(grid, start, level.stairsUp[0], level)) {
            return false;
        }
    }
    
    // Check if stairs down is reachable
    if (level.stairsDown.length > 0) {
        if (!canReach(grid, start, level.stairsDown[0], level)) {
            return false;
        }
    }
    
    return true;
}

// Pathfinding algorithm to check if target is reachable
function canReach(grid, start, target, level) {
    const queue = [];
    const visited = new Set();
    
    // Initialize with player's position
    queue.push({
        x: start.x,
        y: start.y,
        yellowKeys: level.yellowKeys.length,
        blueKeys: level.blueKeys.length,
        redKeys: level.redKeys.length
    });
    
    visited.add(`${start.x},${start.y},0,0,0`);
    
    // BFS to find path
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Check if we reached the target
        if (current.x === target.x && current.y === target.y) {
            return true;
        }
        
        // Try all four directions
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            
            // Skip if out of bounds
            if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) {
                continue;
            }
            
            const cell = grid[ny][nx];
            let canMove = false;
            let newYellowKeys = current.yellowKeys;
            let newBlueKeys = current.blueKeys;
            let newRedKeys = current.redKeys;
            
            // Check if we can move to this cell
            if (cell === 0) {
                // Empty cell
                canMove = true;
            } else if (cell === 2 && current.yellowKeys > 0) {
                // Yellow door with a key
                canMove = true;
                newYellowKeys--;
            } else if (cell === 3 && current.blueKeys > 0) {
                // Blue door with a key
                canMove = true;
                newBlueKeys--;
            } else if (cell === 4 && current.redKeys > 0) {
                // Red door with a key
                canMove = true;
                newRedKeys--;
            }
            
            // Add position to queue if we can move there and haven't visited
            if (canMove) {
                const posKey = `${nx},${ny},${newYellowKeys},${newBlueKeys},${newRedKeys}`;
                if (!visited.has(posKey)) {
                    visited.add(posKey);
                    queue.push({
                        x: nx,
                        y: ny,
                        yellowKeys: newYellowKeys,
                        blueKeys: newBlueKeys,
                        redKeys: newRedKeys
                    });
                }
            }
        }
    }
    
    // If we get here, there's no path
    return false;
}

// Generate a simple fallback level if validation fails
function generateFallbackLevel(floorNumber) {
    const level = {
        playerStartX: 6,
        playerStartY: 10,
        walls: [
            // Border walls
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: 0 })),
            ...Array.from({ length: GRID_WIDTH }, (_, i) => ({ x: i, y: GRID_HEIGHT - 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: 0, y: i + 1 })),
            ...Array.from({ length: GRID_HEIGHT - 2 }, (_, i) => ({ x: GRID_WIDTH - 1, y: i + 1 }))
        ],
        yellowDoors: [],
        blueDoors: [],
        redDoors: [],
        yellowKeys: [],
        blueKeys: [],
        redKeys: [],
        stairsUp: [],
        stairsDown: [],
        monsters: [],
        potions: [],
        swords: [],
        shields: [],
        gold: []
    };
    
    // Simple linear level - guaranteed to be solvable
    if (floorNumber < 19) {
        level.stairsUp.push({ x: 6, y: 2 });
    }
    
    if (floorNumber > 0) {
        level.stairsDown.push({ x: 6, y: 10 });
    }
    
    // Add a few simple walls to make it look like a level
    for (let i = 1; i < GRID_WIDTH - 1; i++) {
        if (i !== 6) { // Leave center open for path
            level.walls.push({ x: i, y: 4 });
            level.walls.push({ x: i, y: 8 });
        }
    }
    
    // Add a few monsters based on floor level
    const monsterTypes = ['slime', 'bat', 'skeleton', 'wizard', 'knight', 'golem', 'demon', 'dragon'];
    const typeIndex = Math.min(Math.floor(floorNumber / 3), monsterTypes.length - 1);
    
    level.monsters.push({ x: 4, y: 6, type: monsterTypes[typeIndex] });
    level.monsters.push({ x: 8, y: 6, type: monsterTypes[typeIndex] });
    
    // Add potions
    level.potions.push({ x: 2, y: 6, type: 'small' });
    level.potions.push({ x: 10, y: 6, type: 'small' });
    
    // Add gold
    level.gold.push({ x: 2, y: 2, value: 20 });
    level.gold.push({ x: 10, y: 2, value: 20 });
    
    return level;
}

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}