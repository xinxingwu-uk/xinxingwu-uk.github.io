// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the global game variable
    window.game = new Game();
    
    // Display welcome message
    console.log('Welcome to Tower of the Sorcerer!');
    console.log('Use arrow keys to move. Defeat monsters and find keys to progress through the tower.');
    
    // Add touch controls for mobile
    addTouchControls();
    
    // Check if test mode is enabled
    if (window.location.search.includes('mode=test')) {
        createTestPanel();
    }
});

// Create test panel for developers and testers
function createTestPanel() {
    // Create test panel container
    const testPanel = document.createElement('div');
    testPanel.id = 'test-panel';
    testPanel.style.position = 'fixed';
    testPanel.style.top = '0';
    testPanel.style.right = '0';
    testPanel.style.width = '250px';
    testPanel.style.height = '100vh';
    testPanel.style.backgroundColor = '#333';
    testPanel.style.color = '#fff';
    testPanel.style.padding = '10px';
    testPanel.style.overflow = 'auto';
    testPanel.style.zIndex = '1000';
    testPanel.style.boxShadow = '-2px 0 5px rgba(0, 0, 0, 0.5)';
    
    // Add panel title
    const title = document.createElement('h2');
    title.textContent = 'Test Mode';
    title.style.textAlign = 'center';
    title.style.borderBottom = '1px solid #666';
    title.style.paddingBottom = '10px';
    title.style.margin = '0 0 15px 0';
    testPanel.appendChild(title);
    
    // Level teleport section
    const levelSection = document.createElement('div');
    levelSection.style.marginBottom = '20px';
    
    const levelTitle = document.createElement('h3');
    levelTitle.textContent = 'Level Teleport';
    levelTitle.style.marginBottom = '10px';
    levelSection.appendChild(levelTitle);
    
    const levelSelect = document.createElement('select');
    levelSelect.style.width = '100%';
    levelSelect.style.padding = '5px';
    levelSelect.style.backgroundColor = '#444';
    levelSelect.style.color = '#fff';
    levelSelect.style.border = '1px solid #666';
    levelSelect.style.borderRadius = '3px';
    levelSelect.style.marginBottom = '10px';
    
    // Add options for all 20 levels
    for (let i = 0; i < 20; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Level ${i + 1}${i === 19 ? ' (Final Boss)' : ''}`;
        levelSelect.appendChild(option);
    }
    levelSection.appendChild(levelSelect);
    
    const teleportButton = document.createElement('button');
    teleportButton.textContent = 'Teleport';
    teleportButton.style.width = '100%';
    teleportButton.style.padding = '8px';
    teleportButton.style.backgroundColor = '#4CAF50';
    teleportButton.style.color = 'white';
    teleportButton.style.border = 'none';
    teleportButton.style.borderRadius = '4px';
    teleportButton.style.cursor = 'pointer';
    teleportButton.style.marginBottom = '20px';
    
    teleportButton.addEventListener('click', () => {
        const level = parseInt(levelSelect.value);
        window.game.goToLevel(level);
    });
    levelSection.appendChild(teleportButton);
    testPanel.appendChild(levelSection);
    
    // Monster inspection section
    const monsterSection = document.createElement('div');
    monsterSection.style.marginBottom = '20px';
    
    const monsterTitle = document.createElement('h3');
    monsterTitle.textContent = 'Monster Inspector';
    monsterTitle.style.marginBottom = '10px';
    monsterSection.appendChild(monsterTitle);
    
    const monsterSelect = document.createElement('select');
    monsterSelect.style.width = '100%';
    monsterSelect.style.padding = '5px';
    monsterSelect.style.backgroundColor = '#444';
    monsterSelect.style.color = '#fff';
    monsterSelect.style.border = '1px solid #666';
    monsterSelect.style.borderRadius = '3px';
    monsterSelect.style.marginBottom = '10px';
    
    // Add options for all monster types
    for (const [key, monster] of Object.entries(MONSTERS)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = monster.name;
        monsterSelect.appendChild(option);
    }
    monsterSection.appendChild(monsterSelect);
    
    const monsterInfo = document.createElement('div');
    monsterInfo.style.backgroundColor = '#444';
    monsterInfo.style.padding = '10px';
    monsterInfo.style.borderRadius = '4px';
    monsterInfo.style.fontSize = '14px';
    monsterSection.appendChild(monsterInfo);
    
    // Update monster info when selection changes
    monsterSelect.addEventListener('change', () => {
        const selectedMonster = MONSTERS[monsterSelect.value];
        if (selectedMonster) {
            monsterInfo.innerHTML = `
                <div><strong>HP:</strong> ${selectedMonster.hp}</div>
                <div><strong>Attack:</strong> ${selectedMonster.attack}</div>
                <div><strong>Defense:</strong> ${selectedMonster.defense}</div>
                <div><strong>EXP:</strong> ${selectedMonster.exp}</div>
                <div><strong>Gold:</strong> ${selectedMonster.gold}</div>
            `;
        }
    });
    // Trigger initial info display
    monsterSelect.dispatchEvent(new Event('change'));
    
    testPanel.appendChild(monsterSection);
    
    // Item inspection section
    const itemSection = document.createElement('div');
    
    const itemTitle = document.createElement('h3');
    itemTitle.textContent = 'Item Inspector';
    itemTitle.style.marginBottom = '10px';
    itemSection.appendChild(itemTitle);
    
    // Create tabs for different item types
    const itemTabs = document.createElement('div');
    itemTabs.style.display = 'flex';
    itemTabs.style.marginBottom = '10px';
    
    const itemTypes = [
        { name: 'Swords', data: 'SWORD' },
        { name: 'Shields', data: 'SHIELD' },
        { name: 'Potions', data: 'POTION' }
    ];
    
    itemTypes.forEach((type, index) => {
        const tab = document.createElement('div');
        tab.textContent = type.name;
        tab.dataset.type = type.data;
        tab.style.padding = '5px 10px';
        tab.style.backgroundColor = index === 0 ? '#666' : '#444';
        tab.style.cursor = 'pointer';
        tab.style.flex = '1';
        tab.style.textAlign = 'center';
        tab.style.borderRadius = index === 0 ? '4px 4px 0 0' : '0';
        
        tab.addEventListener('click', () => {
            // Reset all tabs
            itemTabs.querySelectorAll('div').forEach(t => {
                t.style.backgroundColor = '#444';
                t.style.borderRadius = '0';
            });
            
            // Highlight selected tab
            tab.style.backgroundColor = '#666';
            tab.style.borderRadius = '4px 4px 0 0';
            
            updateItemList(type.data);
        });
        
        itemTabs.appendChild(tab);
    });
    
    itemSection.appendChild(itemTabs);
    
    const itemList = document.createElement('div');
    itemList.style.backgroundColor = '#444';
    itemList.style.padding = '10px';
    itemList.style.borderRadius = '0 0 4px 4px';
    itemList.style.fontSize = '14px';
    itemSection.appendChild(itemList);
    
    function updateItemList(type) {
        itemList.innerHTML = '';
        
        let items;
        switch(type) {
            case 'SWORD':
                items = [ITEMS.IRON_SWORD, ITEMS.STEEL_SWORD, ITEMS.MAGIC_SWORD];
                items.forEach(item => {
                    itemList.innerHTML += `
                        <div style="margin-bottom: 10px;">
                            <strong>${item.name}</strong><br>
                            Attack: +${item.attackBoost}
                        </div>
                    `;
                });
                break;
                
            case 'SHIELD':
                items = [ITEMS.IRON_SHIELD, ITEMS.STEEL_SHIELD, ITEMS.MAGIC_SHIELD];
                items.forEach(item => {
                    itemList.innerHTML += `
                        <div style="margin-bottom: 10px;">
                            <strong>${item.name}</strong><br>
                            Defense: +${item.defenseBoost}
                        </div>
                    `;
                });
                break;
                
            case 'POTION':
                items = [ITEMS.SMALL_POTION, ITEMS.LARGE_POTION];
                items.forEach(item => {
                    itemList.innerHTML += `
                        <div style="margin-bottom: 10px;">
                            <strong>${item.name}</strong><br>
                            Restores: ${item.hpRestore} HP
                        </div>
                    `;
                });
                break;
        }
    }
    
    // Initialize with swords
    updateItemList('SWORD');
    
    testPanel.appendChild(itemSection);
    
    // Player stats modification section
    const statsSection = document.createElement('div');
    statsSection.style.marginTop = '20px';
    
    const statsTitle = document.createElement('h3');
    statsTitle.textContent = 'Modify Player Stats';
    statsTitle.style.marginBottom = '10px';
    statsSection.appendChild(statsTitle);
    
    // Create stat fields
    const stats = [
        { name: 'HP', prop: 'hp' },
        { name: 'Attack', prop: 'attack' },
        { name: 'Defense', prop: 'defense' },
        { name: 'Gold', prop: 'gold' },
        { name: 'EXP', prop: 'exp' }
    ];
    
    stats.forEach(stat => {
        const statContainer = document.createElement('div');
        statContainer.style.display = 'flex';
        statContainer.style.marginBottom = '5px';
        statContainer.style.alignItems = 'center';
        
        const label = document.createElement('label');
        label.textContent = stat.name + ':';
        label.style.width = '80px';
        statContainer.appendChild(label);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '10';
        input.value = window.game.player[stat.prop];
        input.style.flex = '1';
        input.style.padding = '3px 5px';
        input.style.backgroundColor = '#444';
        input.style.color = '#fff';
        input.style.border = '1px solid #666';
        input.style.borderRadius = '3px';
        
        input.dataset.stat = stat.prop;
        statContainer.appendChild(input);
        
        statsSection.appendChild(statContainer);
    });
    
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Stats';
    applyButton.style.width = '100%';
    applyButton.style.padding = '8px';
    applyButton.style.backgroundColor = '#2196F3';
    applyButton.style.color = 'white';
    applyButton.style.border = 'none';
    applyButton.style.borderRadius = '4px';
    applyButton.style.cursor = 'pointer';
    applyButton.style.marginTop = '10px';
    
    applyButton.addEventListener('click', () => {
        const inputs = statsSection.querySelectorAll('input');
        inputs.forEach(input => {
            const stat = input.dataset.stat;
            const value = parseInt(input.value);
            if (!isNaN(value) && value >= 0) {
                window.game.player[stat] = value;
                if (stat === 'hp') {
                    window.game.player.maxHp = Math.max(value, window.game.player.maxHp);
                }
            }
        });
        updateStatsDisplay();
        alert('Player stats updated!');
    });
    
    statsSection.appendChild(applyButton);
    testPanel.appendChild(statsSection);
    
    // Add key modifier
    const keySection = document.createElement('div');
    keySection.style.marginTop = '20px';
    
    const keyTitle = document.createElement('h3');
    keyTitle.textContent = 'Modify Keys';
    keyTitle.style.marginBottom = '10px';
    keySection.appendChild(keyTitle);
    
    const keys = [
        { name: 'Yellow Keys', prop: 'yellow' },
        { name: 'Blue Keys', prop: 'blue' },
        { name: 'Red Keys', prop: 'red' }
    ];
    
    keys.forEach(key => {
        const keyContainer = document.createElement('div');
        keyContainer.style.display = 'flex';
        keyContainer.style.marginBottom = '5px';
        keyContainer.style.alignItems = 'center';
        
        const label = document.createElement('label');
        label.textContent = key.name + ':';
        label.style.width = '100px';
        keyContainer.appendChild(label);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '99';
        input.step = '1';
        input.value = window.game.player.keys[key.prop];
        input.style.flex = '1';
        input.style.padding = '3px 5px';
        input.style.backgroundColor = '#444';
        input.style.color = '#fff';
        input.style.border = '1px solid #666';
        input.style.borderRadius = '3px';
        
        input.dataset.key = key.prop;
        keyContainer.appendChild(input);
        
        keySection.appendChild(keyContainer);
    });
    
    const applyKeysButton = document.createElement('button');
    applyKeysButton.textContent = 'Apply Keys';
    applyKeysButton.style.width = '100%';
    applyKeysButton.style.padding = '8px';
    applyKeysButton.style.backgroundColor = '#FFC107';
    applyKeysButton.style.color = 'black';
    applyKeysButton.style.border = 'none';
    applyKeysButton.style.borderRadius = '4px';
    applyKeysButton.style.cursor = 'pointer';
    applyKeysButton.style.marginTop = '10px';
    
    applyKeysButton.addEventListener('click', () => {
        const inputs = keySection.querySelectorAll('input');
        inputs.forEach(input => {
            const key = input.dataset.key;
            const value = parseInt(input.value);
            if (!isNaN(value) && value >= 0) {
                window.game.player.keys[key] = value;
            }
        });
        updateKeyDisplay();
        alert('Keys updated!');
    });
    
    keySection.appendChild(applyKeysButton);
    testPanel.appendChild(keySection);
    
    // Add the panel to the document
    document.body.appendChild(testPanel);
    
    // Add a toggle button for the panel
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '<<';
    toggleButton.style.position = 'fixed';
    toggleButton.style.right = '250px';
    toggleButton.style.top = '10px';
    toggleButton.style.zIndex = '1001';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.backgroundColor = '#666';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '4px 0 0 4px';
    toggleButton.style.cursor = 'pointer';
    
    let isPanelVisible = true;
    
    toggleButton.addEventListener('click', () => {
        if (isPanelVisible) {
            testPanel.style.transform = 'translateX(250px)';
            toggleButton.style.right = '0';
            toggleButton.textContent = '>>';
        } else {
            testPanel.style.transform = 'translateX(0)';
            toggleButton.style.right = '250px';
            toggleButton.textContent = '<<';
        }
        isPanelVisible = !isPanelVisible;
    });
    
    // Add transition for smooth animation
    testPanel.style.transition = 'transform 0.3s ease';
    toggleButton.style.transition = 'right 0.3s ease';
    
    document.body.appendChild(toggleButton);
}

// Add touch controls for mobile devices
function addTouchControls() {
    const canvas = document.getElementById('game-canvas');
    
    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
    
    let xDown = null;
    let yDown = null;
    
    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    }
    
    function handleTouchEnd(evt) {
        if (!xDown || !yDown) {
            return;
        }
        
        const xUp = evt.changedTouches[0].clientX;
        const yUp = evt.changedTouches[0].clientY;
        
        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;
        
        // Determine the direction of the swipe
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                // Swipe left
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowLeft'
                });
                document.dispatchEvent(keyEvent);
            } else {
                // Swipe right
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowRight'
                });
                document.dispatchEvent(keyEvent);
            }
        } else {
            if (yDiff > 0) {
                // Swipe up
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowUp'
                });
                document.dispatchEvent(keyEvent);
            } else {
                // Swipe down
                const keyEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowDown'
                });
                document.dispatchEvent(keyEvent);
            }
        }
        
        // Reset values
        xDown = null;
        yDown = null;
        
        // Prevent default behavior
        evt.preventDefault();
    }
}

// Function to show battle information
function showBattleInfo(player, monster) {
    console.log(`Battle: Player vs ${monster.name}`);
    console.log(`Player HP: ${player.hp}, ATK: ${player.attack}, DEF: ${player.defense}`);
    console.log(`${monster.name} HP: ${monster.hp}, ATK: ${monster.attack}, DEF: ${monster.defense}`);
}

// Function to show level completion message
function showLevelComplete(floorNumber) {
    console.log(`Congratulations! You completed floor ${floorNumber}!`);
    
    if (floorNumber === 19) {
        // Game completed
        alert('Congratulations! You have reached the top of the Tower of the Sorcerer and beaten the game!');
    }
} 