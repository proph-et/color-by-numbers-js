const container = document.querySelector(".drawing-container");

function onHover(inputDiv, color) {
    inputDiv.style.background = color;
}

function stopHover(inputDiv, color) {
    inputDiv.style.background = color;
}

const ColorPalette = Object.freeze({
    1: "RED",
    2: "BLUE",
    3: "GREEN",
});

function getRandomColor() {
    return ColorPalette[Math.floor(Math.random() * 3 + 1)];
}

for (let i = 0; i < 10; i++) {
    const newContainer = document.createElement("div");
    newContainer.classList.add(`row-${i}`);
    for (let j = 0; j < 10; j++) {
        const newDiv = document.createElement("div");
        newDiv.classList.add(`drawing-cell`);
        newDiv.classList.add(`col-${j}`);
        newDiv.textContent = "(" + String(i) + " " + String(j) + ")";
        newDiv.addEventListener("click", () => onHover(newDiv, getRandomColor()));
        // newDiv.addEventListener("mouseout", () => stopHover(newDiv));

        newContainer.appendChild(newDiv);
    }
    container.appendChild(newContainer);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

let selectedRow = 0;
let selectedCol = 0;
let testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
testCell.style.border = "1px solid red";
document.addEventListener("keydown", (event) => {
    testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
    testCell.style.border = "none";
    switch (event.key) {
        case "ArrowUp":
            console.log("Up arrow pressed");
            selectedRow--;
            break;
        case "ArrowDown":
            console.log("Down arrow pressed");
            selectedRow++;
            break;
        case "ArrowLeft":
            console.log("Left arrow pressed");
            selectedCol--;
            break;
        case "ArrowRight":
            console.log("Right arrow pressed");
            selectedCol++;
            break;
        case " ":
            onHover(testCell, "black");
            break;
    }
    selectedRow = clamp(selectedRow, 0, 9);
    selectedCol = clamp(selectedCol, 0, 9);

    testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
    testCell.style.border = "1px solid";
});

// testCell.forEach(cell => cell.style.background = "black");


