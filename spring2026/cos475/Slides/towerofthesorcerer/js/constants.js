// Game constants
const TILE_SIZE = 32;
const GRID_WIDTH = 13;
const GRID_HEIGHT = 13;
const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE;

// Entity types
const ENTITY_TYPES = {
    EMPTY: 0,
    PLAYER: 1,
    WALL: 2,
    YELLOW_DOOR: 3,
    BLUE_DOOR: 4,
    RED_DOOR: 5,
    YELLOW_KEY: 6,
    BLUE_KEY: 7,
    RED_KEY: 8,
    STAIRS_UP: 9,
    STAIRS_DOWN: 10,
    MONSTER: 11,
    SWORD: 12,
    SHIELD: 13,
    POTION: 14,
    GOLD: 15,
    SPECIAL_ITEM: 16,
    NPC: 17,
    SHOP: 18
};

// Monster types
const MONSTERS = {
    SLIME: {
        id: 1,
        name: "Slime",
        hp: 50,
        attack: 15,
        defense: 2,
        exp: 1,
        gold: 1,
        color: "#4CAF50" // Green
    },
    BAT: {
        id: 2,
        name: "Bat",
        hp: 100,
        attack: 20,
        defense: 5,
        exp: 2,
        gold: 2,
        color: "#607D8B" // Blue-gray
    },
    SKELETON: {
        id: 3,
        name: "Skeleton",
        hp: 150,
        attack: 30,
        defense: 10,
        exp: 3,
        gold: 5,
        color: "#E0E0E0" // Light Gray for better visibility
    },
    WIZARD: {
        id: 4,
        name: "Wizard",
        hp: 200,
        attack: 35,
        defense: 10,
        exp: 5,
        gold: 8,
        color: "#9C27B0" // Purple
    },
    KNIGHT: {
        id: 5,
        name: "Knight",
        hp: 300,
        attack: 40,
        defense: 20,
        exp: 8,
        gold: 12,
        color: "#3F51B5" // Indigo
    },
    GOLEM: {
        id: 6,
        name: "Golem",
        hp: 500,
        attack: 50,
        defense: 30,
        exp: 10,
        gold: 15,
        color: "#A1887F" // Lighter Brown for better visibility
    },
    DEMON: {
        id: 7,
        name: "Demon",
        hp: 800,
        attack: 60,
        defense: 25,
        exp: 15,
        gold: 20,
        color: "#FF5252" // Brighter Red
    },
    DRAGON: {
        id: 8,
        name: "Dragon",
        hp: 1500,
        attack: 80,
        defense: 45,
        exp: 25,
        gold: 50,
        color: "#FF9800" // Orange
    },
    DARK_LORD: {
        id: 9,
        name: "Dark Lord",
        hp: 2000,
        attack: 100,
        defense: 50,
        exp: 50,
        gold: 100,
        color: "#651FFF" // Deep Purple with more visibility
    },
    FINAL_BOSS: {
        id: 10,
        name: "Tower Sorcerer",
        hp: 5000,
        attack: 120,
        defense: 60,
        exp: 100,
        gold: 500,
        color: "#F50057", // Magenta
        isFinalBoss: true
    }
};

// Item types
const ITEMS = {
    SMALL_POTION: {
        id: 1,
        name: "Small Potion",
        hpRestore: 200,
        color: "#FF80AB" // Brighter Pink
    },
    LARGE_POTION: {
        id: 2,
        name: "Large Potion",
        hpRestore: 500,
        color: "#F50057" // Brighter Dark Pink
    },
    IRON_SWORD: {
        id: 1,
        name: "Iron Sword",
        attackBoost: 10,
        color: "#E0E0E0" // Light Gray
    },
    STEEL_SWORD: {
        id: 2,
        name: "Steel Sword",
        attackBoost: 20,
        color: "#B0BEC5" // Blue-Gray
    },
    MAGIC_SWORD: {
        id: 3,
        name: "Magic Sword",
        attackBoost: 40,
        color: "#64B5F6" // Lighter Blue
    },
    IRON_SHIELD: {
        id: 1,
        name: "Iron Shield",
        defenseBoost: 10,
        color: "#E0E0E0" // Light Gray
    },
    STEEL_SHIELD: {
        id: 2,
        name: "Steel Shield",
        defenseBoost: 20,
        color: "#B0BEC5" // Blue-Gray
    },
    MAGIC_SHIELD: {
        id: 3,
        name: "Magic Shield",
        defenseBoost: 40,
        color: "#64B5F6" // Lighter Blue
    }
};

// Color constants
const COLORS = {
    PLAYER: "#FFC107", // Amber
    WALL: "#78909C", // Lighter Gray for better visibility
    FLOOR: "#263238", // Very Dark Blue-Gray
    YELLOW_DOOR: "#FFEB3B", // Yellow
    BLUE_DOOR: "#2196F3", // Blue
    RED_DOOR: "#F44336", // Red
    YELLOW_KEY: "#FFEB3B", // Yellow
    BLUE_KEY: "#2196F3", // Blue
    RED_KEY: "#F44336", // Red
    STAIRS_UP: "#8BC34A", // Light Green
    STAIRS_DOWN: "#CDDC39", // Lime
    SWORD: "#E0E0E0", // Light Gray
    SHIELD: "#90CAF9", // Light Blue
    POTION: "#F48FB1", // Pink
    GOLD: "#FFD54F", // Light Amber
    SPECIAL_ITEM: "#BA68C8", // Light Purple
    NPC: "#4DD0E1", // Light Cyan
    SHOP: "#E91E63" // Pink for shop
}; 