# Tower of the Sorcerer

A HTML5 recreation of the classic "Tower of the Sorcerer" (魔塔 / Magic Tower) game, implemented with JavaScript and Canvas.

## Game Overview

Tower of the Sorcerer is a classic RPG adventure game where you control a character who must ascend through a tower with multiple floors. Each floor contains monsters, doors, keys, and items. The goal is to reach the top of the tower by defeating monsters, collecting keys to open doors, and finding items to increase your stats.

## How to Play

### Controls
- **Arrow Keys**: Move your character up, down, left, and right
- On mobile devices, you can swipe in the direction you want to move

### Game Elements
- **Monsters**: Contact a monster to enter combat. Battles are automatic based on your stats vs. the monster's stats.
- **Keys**: Collect yellow, blue, and red keys to open corresponding colored doors.
- **Doors**: Require keys of the same color to pass through.
- **Stairs**: Use stairs to move between floors (up or down).
- **Shops**: Purchase items using gold and experience points.
- **Items**:
  - **Swords**: Increase your attack power
  - **Shields**: Increase your defense
  - **Potions**: Restore your HP
  - **Gold**: Collect to increase your wealth

### Combat System
Combat occurs automatically when you move into a monster's position. The outcome is determined by comparing your stats with the monster's stats:
1. You attack the monster first - your attack must exceed the monster's defense to deal damage
2. If the monster survives, it attacks you - your defense can block damage if it exceeds the monster's attack
3. This continues until either you or the monster is defeated
4. If you win, you gain experience and gold

### Shop System
Throughout the tower, you'll find shops where you can spend your gold and experience points to purchase:
- Health potions to restore HP
- Better weapons to increase attack
- Stronger shields to boost defense
- Additional keys to open doors

Visit shops strategically to prepare for tougher monsters on higher floors.

## Game Features
- 20 unique tower levels with increasing difficulty
- Detailed monster designs with unique visuals for each monster type
- Rich combat system with attack/defense mechanics
- Shop system for purchasing items with gold and experience
- Various monster types with increasing difficulty
- Items to boost your character's attributes
- Simple but strategic gameplay focused on resource management

## Monster Types
The tower is home to a variety of monsters, each with unique abilities and appearances:
- Slimes: Basic enemies with low stats
- Bats: Fast but weak flying enemies
- Skeletons: Undead warriors with balanced stats
- Wizards: Magic users with high attack but low defense
- Knights: Armored foes with high defense
- Golems: Stone creatures with very high HP and defense
- Demons: Powerful enemies with high attack
- Dragons: Elite monsters with high stats in all areas
- Dark Lords: Extremely powerful minibosses
- Final Boss: The ultimate challenge awaiting at the top of the tower

## Running the Game
Simply open the `index.html` file in a modern web browser. No additional installation required.

## Test Mode
For developers and testers, the game includes a special test mode that can be accessed by adding the query parameter `?mode=test` to the URL:
```
index.html?mode=test
```

Test mode adds a panel to the right side of the screen with the following features:
- **Level Teleporter**: Instantly teleport to any of the 20 levels
- **Monster Inspector**: View detailed stats for all monster types
- **Item Inspector**: Examine all weapons, shields, and potions
- **Player Stats Editor**: Modify your HP, attack, defense, gold, and experience
- **Key Modifier**: Add or remove keys of any color

The test panel can be toggled open/closed using the arrow button on its left edge.

## Technical Implementation
- Written in vanilla JavaScript
- Renders using HTML5 Canvas
- Responsive design that works on desktop and mobile devices
- Custom pathfinding for level validation
- Dynamic level generation

## Credits
This game is inspired by the classic "Tower of the Sorcerer" (魔塔) game originally developed in the 1990s.

---

Enjoy your adventure in the Tower of the Sorcerer! 