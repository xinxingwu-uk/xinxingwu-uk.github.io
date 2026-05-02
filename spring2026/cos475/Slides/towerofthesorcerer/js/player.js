class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 1000;
        this.maxHp = 1000;
        this.attack = 10;
        this.defense = 10;
        this.gold = 0;
        this.exp = 0;
        this.keys = {
            yellow: 0,
            blue: 0,
            red: 0
        };
        this.level = 1;
        this.levelsCompleted = [];
    }

    move(dx, dy, currentLevel) {
        const newX = this.x + dx;
        const newY = this.y + dy;

        // Check if the new position is within the grid
        if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
            return false;
        }

        const targetEntity = currentLevel.grid[newY][newX];

        // Check if the target position is a wall
        if (targetEntity.type === ENTITY_TYPES.WALL) {
            return false;
        }

        // Handling doors
        if (targetEntity.type === ENTITY_TYPES.YELLOW_DOOR) {
            if (this.keys.yellow > 0) {
                this.keys.yellow--;
                updateKeyDisplay();
                currentLevel.removeEntity(newX, newY);
                return this.updatePosition(newX, newY);
            }
            return false;
        }

        if (targetEntity.type === ENTITY_TYPES.BLUE_DOOR) {
            if (this.keys.blue > 0) {
                this.keys.blue--;
                updateKeyDisplay();
                currentLevel.removeEntity(newX, newY);
                return this.updatePosition(newX, newY);
            }
            return false;
        }

        if (targetEntity.type === ENTITY_TYPES.RED_DOOR) {
            if (this.keys.red > 0) {
                this.keys.red--;
                updateKeyDisplay();
                currentLevel.removeEntity(newX, newY);
                return this.updatePosition(newX, newY);
            }
            return false;
        }

        // Handling keys
        if (targetEntity.type === ENTITY_TYPES.YELLOW_KEY) {
            this.keys.yellow++;
            updateKeyDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        if (targetEntity.type === ENTITY_TYPES.BLUE_KEY) {
            this.keys.blue++;
            updateKeyDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        if (targetEntity.type === ENTITY_TYPES.RED_KEY) {
            this.keys.red++;
            updateKeyDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        // Handling stairs
        if (targetEntity.type === ENTITY_TYPES.STAIRS_UP) {
            if (window.game) {
                window.game.goToLevel(window.game.currentFloor + 1);
                return true;
            }
            return false;
        }

        if (targetEntity.type === ENTITY_TYPES.STAIRS_DOWN) {
            if (window.game) {
                window.game.goToLevel(window.game.currentFloor - 1);
                return true;
            }
            return false;
        }

        // Handling monsters
        if (targetEntity.type === ENTITY_TYPES.MONSTER) {
            return this.combat(targetEntity, currentLevel, newX, newY);
        }
        
        // Handling shop
        if (targetEntity.type === ENTITY_TYPES.SHOP) {
            this.openShop(targetEntity);
            return false; // Don't move into the shop tile
        }

        // Handling items
        if (targetEntity.type === ENTITY_TYPES.SWORD) {
            this.attack += targetEntity.attackBoost;
            updateStatsDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        if (targetEntity.type === ENTITY_TYPES.SHIELD) {
            this.defense += targetEntity.defenseBoost;
            updateStatsDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        if (targetEntity.type === ENTITY_TYPES.POTION) {
            this.hp = Math.min(this.maxHp, this.hp + targetEntity.hpRestore);
            updateStatsDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        if (targetEntity.type === ENTITY_TYPES.GOLD) {
            this.gold += targetEntity.value;
            updateStatsDisplay();
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        if (targetEntity.type === ENTITY_TYPES.SPECIAL_ITEM) {
            // Handle special items (can be expanded later)
            currentLevel.removeEntity(newX, newY);
            return this.updatePosition(newX, newY);
        }

        // NPC interaction would go here
        if (targetEntity.type === ENTITY_TYPES.NPC) {
            // For now, just display a message
            console.log("NPC says: " + targetEntity.message);
            return false;
        }

        // If we reach here, the tile is empty or passable
        return this.updatePosition(newX, newY);
    }

    combat(monster, currentLevel, monsterX, monsterY) {
        // Calculate damage to monster - if attack <= defense, no damage is done
        const damageToMonster = this.attack <= monster.defense ? 0 : Math.max(1, this.attack - monster.defense);
        
        // Show combat information
        this.showCombatInfo(monster, damageToMonster);
        
        // Check if player can damage the monster
        if (damageToMonster === 0) {
            // Show message that player can't damage the monster
            alert(`Your attack is too weak to damage the ${monster.name}! Find a stronger weapon.`);
            return false;
        }
        
        monster.hp -= damageToMonster;

        // Check if monster is defeated
        if (monster.hp <= 0) {
            // Gain experience and gold
            this.exp += monster.exp;
            this.gold += monster.gold;
            updateStatsDisplay();
            
            // Show victory message
            this.showCombatResult(monster, true);
            
            // Check if this was the final boss
            if (monster.isFinalBoss) {
                // Display game win message
                setTimeout(() => {
                    alert("Congratulations! You have defeated the Tower Sorcerer and completed the game!");
                    if (window.game) {
                        window.game.showGameWinScreen();
                    }
                }, 500);
            }
            
            // Remove monster from the grid
            currentLevel.removeEntity(monsterX, monsterY);
            return this.updatePosition(monsterX, monsterY);
        } else {
            // Calculate damage to player - if defense >= attack, no damage is taken
            const damageToPlayer = this.defense >= monster.attack ? 0 : Math.max(1, monster.attack - this.defense);
            this.hp -= damageToPlayer;
            updateStatsDisplay();

            // Check if player is defeated
            if (this.hp <= 0) {
                // Show defeat message
                this.showCombatResult(monster, false);
                
                alert("Game Over! You were defeated by a " + monster.name);
                if (window.game) {
                    window.game.restartGame();
                }
                return false;
            }
            return false;
        }
    }

    showCombatInfo(monster, damageToMonster) {
        // Calculate damage to player - if defense >= attack, no damage is taken
        const damageToPlayer = this.defense >= monster.attack ? 0 : Math.max(1, monster.attack - this.defense);
        
        // Create combat info element
        const combatInfo = document.createElement('div');
        combatInfo.className = 'combat-info';
        combatInfo.style.position = 'absolute';
        combatInfo.style.left = '50%';
        combatInfo.style.top = '30%';
        combatInfo.style.transform = 'translate(-50%, -50%)';
        combatInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        combatInfo.style.color = '#fff';
        combatInfo.style.padding = '15px';
        combatInfo.style.borderRadius = '8px';
        combatInfo.style.zIndex = '1001';
        combatInfo.style.minWidth = '250px';
        combatInfo.style.textAlign = 'center';
        combatInfo.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        
        // Format damage messages
        const damageToMonsterText = damageToMonster === 0 ? 
            "No damage (ATK too low)" : 
            `${damageToMonster}`;
            
        const damageToPlayerText = damageToPlayer === 0 ? 
            "No damage (DEF blocks)" : 
            `${damageToPlayer}`;
        
        combatInfo.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;"><strong>COMBAT!</strong></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>You</div>
                <div>vs</div>
                <div>${monster.name}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>HP: ${this.hp}</div>
                <div></div>
                <div>HP: ${monster.hp}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>ATK: ${this.attack}</div>
                <div></div>
                <div>ATK: ${monster.attack}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>DEF: ${this.defense}</div>
                <div></div>
                <div>DEF: ${monster.defense}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <div style="color: ${damageToMonster === 0 ? '#FFD700' : '#FF5252'};">Damage to enemy: ${damageToMonsterText}</div>
                <div style="color: ${damageToPlayer === 0 ? '#4CAF50' : '#FF5252'};">Damage to you: ${damageToPlayerText}</div>
            </div>
        `;
        
        document.body.appendChild(combatInfo);
        
        // Remove after 1.5 seconds
        setTimeout(() => {
            if (combatInfo.parentNode) {
                combatInfo.parentNode.removeChild(combatInfo);
            }
        }, 1500);
    }

    showCombatResult(monster, victory) {
        // Create result info element
        const resultInfo = document.createElement('div');
        resultInfo.className = 'combat-result';
        resultInfo.style.position = 'absolute';
        resultInfo.style.left = '50%';
        resultInfo.style.top = '30%';
        resultInfo.style.transform = 'translate(-50%, -50%)';
        resultInfo.style.padding = '15px';
        resultInfo.style.borderRadius = '8px';
        resultInfo.style.zIndex = '1002';
        resultInfo.style.minWidth = '200px';
        resultInfo.style.textAlign = 'center';
        resultInfo.style.fontWeight = 'bold';
        resultInfo.style.fontSize = '18px';
        
        if (victory) {
            resultInfo.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
            resultInfo.style.color = '#fff';
            resultInfo.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.7)';
            resultInfo.innerHTML = `
                Victory!<br>
                <span style="font-size: 14px;">
                    +${monster.exp} EXP<br>
                    +${monster.gold} Gold
                </span>
            `;
        } else {
            resultInfo.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
            resultInfo.style.color = '#fff';
            resultInfo.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.7)';
            resultInfo.innerHTML = `Defeated!`;
        }
        
        document.body.appendChild(resultInfo);
        
        // Remove after 1.5 seconds
        setTimeout(() => {
            if (resultInfo.parentNode) {
                resultInfo.parentNode.removeChild(resultInfo);
            }
        }, 1500);
    }

    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
        return true;
    }

    openShop(shop) {
        // Pause the game
        if (window.game) {
            window.game.isGameActive = false;
        }
        
        // Create shop dialog
        const shopDialog = document.createElement('div');
        shopDialog.className = 'shop-dialog';
        shopDialog.style.position = 'absolute';
        shopDialog.style.left = '50%';
        shopDialog.style.top = '50%';
        shopDialog.style.transform = 'translate(-50%, -50%)';
        shopDialog.style.width = '80%';
        shopDialog.style.maxWidth = '600px';
        shopDialog.style.maxHeight = '80vh';
        shopDialog.style.backgroundColor = '#333';
        shopDialog.style.color = '#fff';
        shopDialog.style.padding = '20px';
        shopDialog.style.borderRadius = '8px';
        shopDialog.style.zIndex = '2000';
        shopDialog.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
        shopDialog.style.overflowY = 'auto';
        
        // Add shop title
        const shopTitle = document.createElement('h2');
        shopTitle.textContent = 'Shop';
        shopTitle.style.textAlign = 'center';
        shopTitle.style.marginBottom = '20px';
        shopTitle.style.color = '#E91E63';
        shopDialog.appendChild(shopTitle);
        
        // Add player stats
        const playerStats = document.createElement('div');
        playerStats.style.display = 'flex';
        playerStats.style.justifyContent = 'space-between';
        playerStats.style.marginBottom = '20px';
        playerStats.style.padding = '10px';
        playerStats.style.backgroundColor = '#444';
        playerStats.style.borderRadius = '4px';
        
        playerStats.innerHTML = `
            <div>HP: ${this.hp}/${this.maxHp}</div>
            <div>ATK: ${this.attack}</div>
            <div>DEF: ${this.defense}</div>
            <div>Gold: ${this.gold}</div>
            <div>EXP: ${this.exp}</div>
        `;
        shopDialog.appendChild(playerStats);
        
        // Create inventory container
        const inventoryContainer = document.createElement('div');
        inventoryContainer.style.display = 'grid';
        inventoryContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
        inventoryContainer.style.gap = '10px';
        
        // Add shop items
        shop.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.style.backgroundColor = '#555';
            itemElement.style.padding = '10px';
            itemElement.style.borderRadius = '4px';
            itemElement.style.display = 'flex';
            itemElement.style.flexDirection = 'column';
            
            // Item name and details
            const itemInfo = document.createElement('div');
            itemInfo.style.marginBottom = '10px';
            
            let itemDetails = `<strong>${item.name}</strong><br>`;
            if (item.type === 'potion') {
                itemDetails += `Restores: ${item.hpRestore} HP<br>`;
            } else if (item.type === 'sword') {
                itemDetails += `ATK: +${item.attackBoost}<br>`;
            } else if (item.type === 'shield') {
                itemDetails += `DEF: +${item.defenseBoost}<br>`;
            } else if (item.type === 'key') {
                itemDetails += `Key Type: ${item.keyColor}<br>`;
            }
            
            itemDetails += `Cost: ${item.goldCost} Gold, ${item.expCost} EXP`;
            itemInfo.innerHTML = itemDetails;
            itemElement.appendChild(itemInfo);
            
            // Buy button
            const buyButton = document.createElement('button');
            buyButton.textContent = 'Buy';
            buyButton.style.backgroundColor = '#4CAF50';
            buyButton.style.color = 'white';
            buyButton.style.border = 'none';
            buyButton.style.padding = '8px';
            buyButton.style.borderRadius = '4px';
            buyButton.style.cursor = 'pointer';
            
            // Disable button if player can't afford
            if (this.gold < item.goldCost || this.exp < item.expCost) {
                buyButton.disabled = true;
                buyButton.style.backgroundColor = '#666';
                buyButton.style.cursor = 'not-allowed';
            }
            
            // Buy item when clicked
            buyButton.addEventListener('click', () => {
                if (this.gold >= item.goldCost && this.exp >= item.expCost) {
                    this.gold -= item.goldCost;
                    this.exp -= item.expCost;
                    
                    // Apply the item's effect
                    if (item.type === 'potion') {
                        this.hp = Math.min(this.maxHp, this.hp + item.hpRestore);
                    } else if (item.type === 'sword') {
                        this.attack += item.attackBoost;
                    } else if (item.type === 'shield') {
                        this.defense += item.defenseBoost;
                    } else if (item.type === 'key') {
                        if (item.keyColor === 'yellow') this.keys.yellow++;
                        else if (item.keyColor === 'blue') this.keys.blue++;
                        else if (item.keyColor === 'red') this.keys.red++;
                    }
                    
                    // Update displays
                    updateStatsDisplay();
                    updateKeyDisplay();
                    
                    // Update player stats in shop
                    playerStats.innerHTML = `
                        <div>HP: ${this.hp}/${this.maxHp}</div>
                        <div>ATK: ${this.attack}</div>
                        <div>DEF: ${this.defense}</div>
                        <div>Gold: ${this.gold}</div>
                        <div>EXP: ${this.exp}</div>
                    `;
                    
                    // Disable button if player can't afford more
                    if (this.gold < item.goldCost || this.exp < item.expCost) {
                        buyButton.disabled = true;
                        buyButton.style.backgroundColor = '#666';
                        buyButton.style.cursor = 'not-allowed';
                    }
                    
                    // Show purchase message
                    alert(`Purchased ${item.name}`);
                }
            });
            
            itemElement.appendChild(buyButton);
            inventoryContainer.appendChild(itemElement);
        });
        
        shopDialog.appendChild(inventoryContainer);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Exit Shop';
        closeButton.style.display = 'block';
        closeButton.style.margin = '20px auto 0';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#F44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(shopDialog);
            if (window.game) {
                window.game.isGameActive = true;
            }
        });
        
        shopDialog.appendChild(closeButton);
        
        // Add to the document
        document.body.appendChild(shopDialog);
    }
}

function updateStatsDisplay() {
    // Check if game object is initialized
    if (!window.game || !window.game.player) {
        console.log("Game not initialized yet, skipping stats update");
        return;
    }
    
    document.getElementById("hp-display").textContent = window.game.player.hp;
    document.getElementById("attack-display").textContent = window.game.player.attack;
    document.getElementById("defense-display").textContent = window.game.player.defense;
    document.getElementById("gold-display").textContent = window.game.player.gold;
    document.getElementById("exp-display").textContent = window.game.player.exp;
}

function updateKeyDisplay() {
    // Check if game object is initialized
    if (!window.game || !window.game.player) {
        console.log("Game not initialized yet, skipping key display update");
        return;
    }
    
    document.getElementById("yellow-key-display").textContent = window.game.player.keys.yellow;
    document.getElementById("blue-key-display").textContent = window.game.player.keys.blue;
    document.getElementById("red-key-display").textContent = window.game.player.keys.red;
} 