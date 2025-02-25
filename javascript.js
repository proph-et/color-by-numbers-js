const drawingContainer = document.querySelector(".drawing-container");
const paletteContainer = document.querySelector(".palette-container");

const SIZE_X = 10;
const SIZE_Y = 10;

function onCellClick(row, col, color, correctColor) {
  let cell = document.querySelector(`.row-${row} .col-${col}`);
  if (!cell.classList.contains("solved")) {
    cell.style.background = color;
  }
  if (color === correctColor) {
    cell.textContent = "";
    cell.classList.add("solved");
    solveSurrounding(row, col);
  }
}


function solveSurrounding(row, col) {
  for (let i = row - 1; i <= row + 1; i += 1) {
    for (let j = col - 1; j <= col + 1; j += 1) {
      let cell = document.querySelector(`.row-${i} .col-${j}`);
      if (i < 0 || j < 0 || i > SIZE_X - 1 || j > SIZE_Y - 1) {
        continue;
      }
      if (cell.classList.contains("solved")) {
        continue;
      }
      if (
          (i === row - 1 && j === col) ||
          (i === row && j === col - 1) ||
          (i === row && j === col + 1) ||
          (i === row + 1 && j === col)
      ) {
        if (colorArray[i][j] === colorArray[row][col]) {
          onCellClick(i, j, SelectedColor, SelectedColor);
        }
      }
    }
  }
}

function onColorSelect(inputDiv, color) {
  SelectedColor = color;
}

const ColorPalette = Object.freeze({
  0: "RED",
  1: "BLUE",
  2: "GREEN",
});

let colorArray = [];
for (let i = 0; i < SIZE_X; i++) {
  colorArray[i] = [];
  for (let j = 0; j < SIZE_Y; j += 1) {
    colorArray[i][j] = Math.floor(Math.random() * 3);
  }
}


let SelectedColor = ColorPalette[0];

for (let i = 0; i < 3; i++) {
  const newDiv = document.createElement("div");
  newDiv.classList.add(`color-cell`);
  newDiv.textContent = String(i);
  newDiv.style.backgroundColor = ColorPalette[i];
  newDiv.addEventListener("click", () => onColorSelect(newDiv, ColorPalette[i]));
  paletteContainer.appendChild(newDiv);
}

for (let i = 0; i < SIZE_X; i++) {
  const newContainer = document.createElement("div");
  newContainer.classList.add(`row-${i}`);
  for (let j = 0; j < SIZE_Y; j++) {
    const newDiv = document.createElement("div");
    newDiv.classList.add(`drawing-cell`);
    newDiv.classList.add(`col-${j}`);
    // newDiv.textContent = "(" + String(i) + " " + String(j) + ")";
    newDiv.textContent = String(colorArray[i][j]);
    // newDiv.addEventListener("click", () => onCellClick(newDiv, ColorPalette[colorArray[i][j]]));
    newDiv.addEventListener("click", () => onCellClick(i, j, SelectedColor, ColorPalette[colorArray[i][j]]));
    // newDiv.addEventListener("mouseout", () => stopHover(newDiv));

    newContainer.appendChild(newDiv);
  }
  drawingContainer.appendChild(newContainer);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

let selectedRow = 0;
let selectedCol = 0;
let testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
// testCell.style.border = "1px solid red";
document.addEventListener("keydown", (event) => {
  testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
  testCell.style.border = "none";
  switch (event.key) {
    case "ArrowUp":
      selectedRow--;
      break;
    case "ArrowDown":
      selectedRow++;
      break;
    case "ArrowLeft":
      selectedCol--;
      break;
    case "ArrowRight":
      selectedCol++;
      break;
    case " ":
      onCellClick(selectedRow, selectedCol, "black", SelectedColor);
      break;
  }
  selectedRow = clamp(selectedRow, 0, SIZE_X - 1);
  selectedCol = clamp(selectedCol, 0, SIZE_Y - 1);

  testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
  // testCell.style.border = "1px solid";
});


