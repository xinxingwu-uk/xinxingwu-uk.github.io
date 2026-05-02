class Entity {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
    }
}

class Monster extends Entity {
    constructor(monsterType, x, y) {
        super(ENTITY_TYPES.MONSTER, x, y);
        this.monsterType = monsterType;
        this.name = monsterType.name;
        this.hp = monsterType.hp;
        this.attack = monsterType.attack;
        this.defense = monsterType.defense;
        this.exp = monsterType.exp;
        this.gold = monsterType.gold;
        this.color = monsterType.color;
    }
}

class Item extends Entity {
    constructor(itemType, type, x, y) {
        super(type, x, y);
        this.name = itemType.name;
        
        // Copy all properties from itemType to this object
        Object.assign(this, itemType);
    }
}

class Sword extends Item {
    constructor(swordType, x, y) {
        super(swordType, ENTITY_TYPES.SWORD, x, y);
    }
}

class Shield extends Item {
    constructor(shieldType, x, y) {
        super(shieldType, ENTITY_TYPES.SHIELD, x, y);
    }
}

class Potion extends Item {
    constructor(potionType, x, y) {
        super(potionType, ENTITY_TYPES.POTION, x, y);
    }
}

class Gold extends Entity {
    constructor(x, y, value = 10) {
        super(ENTITY_TYPES.GOLD, x, y);
        this.value = value;
    }
}

class Key extends Entity {
    constructor(keyType, x, y) {
        super(keyType, x, y);
    }
}

class Door extends Entity {
    constructor(doorType, x, y) {
        super(doorType, x, y);
    }
}

class Wall extends Entity {
    constructor(x, y) {
        super(ENTITY_TYPES.WALL, x, y);
    }
}

class Stairs extends Entity {
    constructor(stairsType, x, y, targetFloor) {
        super(stairsType, x, y);
        this.targetFloor = targetFloor;
    }
}

class NPC extends Entity {
    constructor(x, y, message = "Hello, traveler!") {
        super(ENTITY_TYPES.NPC, x, y);
        this.message = message;
    }
}

class Shop extends Entity {
    constructor(x, y) {
        super(ENTITY_TYPES.SHOP, x, y);
        this.name = "Shop";
        this.inventory = [
            {
                type: "potion",
                name: "Small Potion",
                hpRestore: 200,
                goldCost: 25,
                expCost: 0
            },
            {
                type: "potion",
                name: "Large Potion",
                hpRestore: 500,
                goldCost: 50,
                expCost: 5
            },
            {
                type: "sword",
                name: "Iron Sword",
                attackBoost: 10,
                goldCost: 100,
                expCost: 10
            },
            {
                type: "sword",
                name: "Steel Sword",
                attackBoost: 25,
                goldCost: 250,
                expCost: 30
            },
            {
                type: "sword",
                name: "Magic Sword",
                attackBoost: 50,
                goldCost: 500,
                expCost: 60
            },
            {
                type: "shield",
                name: "Iron Shield",
                defenseBoost: 10,
                goldCost: 100,
                expCost: 10
            },
            {
                type: "shield",
                name: "Steel Shield",
                defenseBoost: 25,
                goldCost: 250,
                expCost: 30
            },
            {
                type: "shield",
                name: "Magic Shield",
                defenseBoost: 50,
                goldCost: 500,
                expCost: 60
            },
            {
                type: "key",
                name: "Yellow Key",
                keyColor: "yellow",
                goldCost: 10,
                expCost: 0
            },
            {
                type: "key",
                name: "Blue Key",
                keyColor: "blue",
                goldCost: 30,
                expCost: 2
            },
            {
                type: "key",
                name: "Red Key",
                keyColor: "red",
                goldCost: 50,
                expCost: 5
            }
        ];
    }
}

// Empty entity for empty spaces
class Empty extends Entity {
    constructor(x, y) {
        super(ENTITY_TYPES.EMPTY, x, y);
    }
} 