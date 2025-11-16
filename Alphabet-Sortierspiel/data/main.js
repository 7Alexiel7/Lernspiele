// Select the target element
const targetElement = document.getElementById('app');
const resetButtonElement = document.getElementById('reset');
const formElement = document.getElementById('selectCount');
const sortElements = [
    ['abc', 'abcdefghijklmnopqrstuvwxyz', 'abcdefghijklmnopqrstuvwxyz'],
    ['Abc', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'],
    ['ABC', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    ['123', '123456789', '123456789']];
let unsortedList = [];
let resolvedList = [];
let sortedList = [];
let html = '';

/**
 * Initialize the view and add event listeners
 */
function view() {
    formElement.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        // clear data from previous game
        resetGame(event);
        // get user input
        const count = parseInt(document.getElementById('answer').value, 10);
        const letters = parseInt(document.getElementById('letters').value, 10);
        const signs = document.getElementById('signs').value;
        // start game
        if(!count) return;
        for(let i=0; i<count; i++) {
            unsortedList.push(getLetters(letters, signs));
        }
        // create sorted list for later comparison
        sortedList.push(...unsortedList);
        sortedList.sort();
        // create initial game html
        createGameInitHtml();
    });
    resetButtonElement.addEventListener('click', (event) => {
        resetGame(event);
    })
}

/**
 * reset data and html to initial state
 * @param {*} event Event from the element
 */
function resetGame(event) {
    event.preventDefault(); // Prevent the form from refreshing the page
    unsortedList = [];
    resolvedList = [];
    sortedList = [];
    targetElement.innerHTML = '';
}

/**
 * Create HTML to start the game
 */
function createGameInitHtml() {
    html = `<div class="drop-zones">
        <div class="drop-zone" id="zone-0"></div>
    </div>
    <div class="draggable-list">`;
    unsortedList.forEach((element, index) => {
        html += `<div class="draggable-item" draggable="true" id="box-${index}-${element}">${element}</div>`;
    });
    html += '</div>';
    targetElement.innerHTML = html;
    addDragAndDropListeners();
}

/**
 * Update HTML after each drop event
 * @param {number} dropId the target sort position
 * @param {string} listElementId the dragged element
 * @returns void
 */
function createGameUpdateHtml(dropId, listElementId) {
    unsortedList.splice(unsortedList.indexOf(listElementId), 1);
    // If all elements are sorted, show check button
    if(unsortedList.length == 0) {
        createCorrectResolveList(dropId, listElementId);
        html = '<div class="drop-zones">';
        let i=0;
        for(i; i<resolvedList.length; i++) {
            
            html += `<div class="drop-zone" id="zone-${i}"></div><div>${resolvedList[i][0]}</div>`;
        }
        html += `<div class="drop-zone" id="zone-${i}"></div>`
        html += '</div>';
        html += '<div class="draggable-list">';
        unsortedList.forEach((element, index) => {
            html += `<div class="draggable-item" draggable="true" id="box-${index}-${element}">${element}</div>`;
        });
        html += '</div>';
        html += '<button class="finish" id="check-button" style="margin-top:20px;">Fertig</button>';
        targetElement.innerHTML = html;
        document.getElementById('check-button').addEventListener('click', () => {
            let correct = true;
            for(let j=0; j<resolvedList.length; j++) {
                if(resolvedList[j][0] !== sortedList[j]) {
                    correct = false;
                    break;
                }
            }
            if(correct) {
                html = `<div class="won">
                    <h2>Glückwunsch! Du hast richtig sortiert.</h2>
                    <img src="./data/cat.gif" alt="Congratulations Gif"/>
                    <div><button id="again" style="margin-top:20px;">Noch Mal!</button></div>
                </div>`;
                targetElement.innerHTML = html;	
                document.getElementById('again').addEventListener('click', (event) => {
                    resetGame(event);
                });
                
            } else {
                alert('Leider falsch sortiert. Versuche es noch einmal!');
                unsortedList = resolvedList.map(el => el[0]);
                resolvedList = [];
                createGameInitHtml();
            }
        });
        return;
    }
    
    createCorrectResolveList(dropId, listElementId);
    // Rebuild HTML
    html = '<div class="drop-zones">';
    let i=0;
    for(i; i<resolvedList.length; i++) {
        
        html += `<div class="drop-zone" id="zone-${i}"></div><div>${resolvedList[i][0]}</div>`;
    }
    html += `<div class="drop-zone" id="zone-${i}"></div>`
    html += '</div>';
    html += '<div class="draggable-list">';
    unsortedList.forEach((element, index) => {
        html += `<div class="draggable-item" draggable="true" id="box-${index}-${element}">${element}</div>`;
    });
    html += '</div>';
    targetElement.innerHTML = html;
    addDragAndDropListeners();
}

/**
 * update resolvedList with correct positions
 * @param {number} dropId the target sort position
 * @param {string} listElementId the dragged element
 */
function createCorrectResolveList(dropId, listElementId) {
    if(resolvedList.length > 0) {
        const pushIndex = resolvedList.findIndex(el => el[1]==dropId);
        if(pushIndex >-1 && pushIndex <= resolvedList.length) { 
            resolvedList.forEach((element, index) => {
                if(index >= pushIndex) {
                    element[1]++;
                }
            });
        }
    }
    resolvedList.push([listElementId, dropId]);
    resolvedList.sort((a,b) => a[1]-b[1]);
}

// Drag and Drop functionality

/**
 * Add event listeners to draggable items and drop zones
 */
function addDragAndDropListeners() {
    const draggableBoxes = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');
        draggableBoxes.forEach((box) => {
            box.addEventListener('dragstart', (event) => event.dataTransfer.setData('text', event.target.id));
        });
 
    dropZones.forEach((zone) => {
        zone.addEventListener('dragover', (event) => event.preventDefault());
        zone.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedBoxId = event.dataTransfer.getData('text'); // Get the dragged element's ID
            const draggedBox = document.getElementById(draggedBoxId);
            event.target.appendChild(draggedBox); // Append the dragged box to the drop zone
            createGameUpdateHtml(parseInt(event.target.id.split('-')[1]), draggedBoxId.split('-')[2]);
        });
    });
}

/**
 * create a random string of letters
 * @param {number} length taret length of the random string
 * @returns random string of letters
 */
function getLetters(length, abc) {
    const ind = sortElements.findIndex((e) => e[0] === abc);
    const alpha1 = sortElements[ind][1];
    const alpha2 = sortElements[ind][2];
    let result = '';
    result += alpha1[Math.floor(Math.random() * alpha1.length)];
    for (let i = 1; i < length; i++) {
        result += alpha2[Math.floor(Math.random() * alpha2.length)];
    }
    return result;
}

// Initialize the view

view();