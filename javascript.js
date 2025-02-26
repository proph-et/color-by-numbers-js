const zoomContainer = document.querySelector('.zoom-container');
const flexWrapper = document.querySelector('.flex-wrapper');

let scale = 1;
let isPanning = false;
let lastX = 0, lastY = 0;
let currentTranslateX = 0, currentTranslateY = 0;
const scaleFactor = 1;
const minScale = 1;
const maxScale = 3;

zoomContainer.addEventListener('wheel', (event) => {
  event.preventDefault();

  if (event.deltaY < 0) {
    scale += scaleFactor;
  } else {
    scale -= scaleFactor;
  }

  scale = clamp(scale, minScale, maxScale);

  flexWrapper.style.transformOrigin = '0% 0%';
  flexWrapper.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
});

zoomContainer.addEventListener('mousedown', (event) => {
  if (event.button === 2) { // Right-click (button code 2)
    isPanning = true;
    lastX = event.clientX;
    lastY = event.clientY;
  }
});

zoomContainer.addEventListener('mousemove', (event) => {
  if (isPanning) {
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    currentTranslateX += deltaX / scale;
    currentTranslateY += deltaY / scale;

    const contentWidth = flexWrapper.offsetWidth * scale;
    const contentHeight = flexWrapper.offsetHeight * scale;

    const containerWidth = zoomContainer.clientWidth;
    const containerHeight = zoomContainer.clientHeight;

    const maxTranslateX = 0;
    const maxTranslateY = 0;

    const minTranslateX = (containerWidth / scale) - contentWidth / scale;
    const minTranslateY = (containerHeight / scale) - contentHeight / scale;


    currentTranslateX = Math.max(minTranslateX, Math.min(currentTranslateX, maxTranslateX));
    currentTranslateY = Math.max(minTranslateY, Math.min(currentTranslateY, maxTranslateY));

    flexWrapper.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;

    lastX = event.clientX;
    lastY = event.clientY;
  }
});


zoomContainer.addEventListener('mouseup', () => {
  isPanning = false;
  zoomContainer.style.cursor = 'cursor';
});

zoomContainer.addEventListener('mouseleave', () => {
  isPanning = false;
  zoomContainer.style.cursor = 'cursor';
});

zoomContainer.addEventListener('contextmenu', (event) => {
  event.preventDefault(); // Disable the default right-click context menu
});


// -------------------------------------------------------------------
const drawingContainer = document.querySelector(".drawing-container");
const paletteContainer = document.querySelector(".palette-container");

const imageUpload = document.getElementById("imageUpload");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

const colorPalette = [
  [255, 255, 255],
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 0],
  [169, 169, 169],
  [255, 165, 0],
  [255, 224, 189],
  [255, 192, 203],
  [0, 128, 128]
];

// Euclidean distance function
function getNearestColor(pixel, palette) {
  let minDist = Infinity;
  let closestColor = palette[0];

  for (let color of palette) {
    let dist = Math.sqrt(
        Math.pow(pixel[0] - color[0], 2) +
        Math.pow(pixel[1] - color[1], 2) +
        Math.pow(pixel[2] - color[2], 2)
    );

    if (dist < minDist) {
      minDist = dist;
      closestColor = color;
    }
  }
  return closestColor;
}

let width = 0;
let height = 0;
let hexColors = [];
let imgScaleFactor = 0;

function processImage(img) {
  imgScaleFactor = Math.min(100 / img.height, 100 / img.width);
  width = Math.floor(img.width * imgScaleFactor);
  height = Math.floor(img.height * imgScaleFactor);

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCtx.drawImage(img, 0, 0, width, height);

  let imageData = tempCtx.getImageData(0, 0, width, height);
  let pixels = imageData.data;


  const contrastFactor = 2.0;
  for (let i = 0; i < pixels.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      let color = pixels[i + j] / 255.0;
      color = ((color - 0.5) * contrastFactor + 0.5) * 255;
      pixels[i + j] = Math.min(255, Math.max(0, color));
    }
  }

  for (let i = 0; i < pixels.length; i += 4) {
    let nearestColor = getNearestColor([pixels[i], pixels[i + 1], pixels[i + 2]], colorPalette);
    pixels[i] = nearestColor[0];
    pixels[i + 1] = nearestColor[1];
    pixels[i + 2] = nearestColor[2];
  }

  tempCtx.putImageData(imageData, 0, 0);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(tempCanvas, 0, 0);

  for (let i = 0; i < pixels.length; i += 4) {
    hexColors.push(rgbToHex(pixels[i], pixels[i + 1], pixels[i + 2]));
  }

  generateGrid();

}

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      let img = new Image();
      img.src = e.target.result;
      paletteContainer.replaceChildren();
      drawingContainer.replaceChildren();
      img.onload = () => processImage(img);
    };
    reader.readAsDataURL(file);
  }
});

let ColorPalette = {};
for (let i in colorPalette) {
  ColorPalette[i] = rgbToHex(colorPalette[i][0], colorPalette[i][1], colorPalette[i][2]);
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

let isIterating = false;

function onCellClick(row, col, color) {
  let cell = document.querySelector(`.row-${row} .col-${col}`);
  if (!cell) return;

  if (!cell.classList.contains("solved")) {
    cell.style.background = color;
  }

  if (color === ColorPalette[colorArray[row][col]]) {
    cell.textContent = "";
    cell.classList.add("solved");
    if (!isIterating) {
      isIterating = true;
      solveSurroundingIteratively(row, col, color);
    }
  }
}

function solveSurroundingIteratively(row, col, color) {
  let queue = [{row, col}];
  let visited = new Set();

  while (queue.length > 0) {
    let {row, col} = queue.shift();
    let cell = document.querySelector(`.row-${row} .col-${col}`);

    if (!cell || row < 0 || col < 0 || row >= SIZE_Y || col >= SIZE_X ||
        visited.has(`${row}-${col}`)
    ) {
      continue;
    }

    visited.add(`${row}-${col}`);

    if (!cell.classList.contains("solved")) {
      onCellClick(row, col, color, ColorPalette[colorArray[row][col]]);
    }

    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if ((i === row - 1 && j === col) ||
            (i === row && j === col - 1) ||
            (i === row && j === col + 1) ||
            (i === row + 1 && j === col)
        ) {
          if (colorArray[i] && colorArray[i][j] === colorArray[row][col] &&
              !visited.has(`${i}-${j}`)
          ) {
            queue.push({row: i, col: j});
          }
        }
      }
    }
  }
  isIterating = false;
}


function onColorSelect(inputDiv, color) {
  SelectedColor = color;
}


let SelectedColor = ColorPalette[0];

let SIZE_X = 0;
let SIZE_Y = 0
let colorArray = [];

function generateGrid() {
  SIZE_X = width;
  SIZE_Y = height;
  zoomContainer.style.height = 80 + "vh";
  zoomContainer.style.aspectRatio = String(SIZE_X / SIZE_Y);
  flexWrapper.style.height = 80 + "vh";
  flexWrapper.style.aspectRatio = String(SIZE_X / SIZE_Y);

  for (let i = 0; i < SIZE_Y; i++) {
    colorArray[i] = [];
    for (let j = 0; j < SIZE_X; j += 1) {
      colorArray[i][j] = getKeyByValue(ColorPalette, (hexColors[i * SIZE_X + j]));
    }
  }


  for (let i = 0; i < 13; i++) {
    const newDiv = document.createElement("div");
    newDiv.classList.add(`color-cell`);
    newDiv.textContent = String(i);
    newDiv.style.backgroundColor = ColorPalette[i];
    newDiv.addEventListener("click", () => onColorSelect(newDiv, ColorPalette[i]));
    paletteContainer.appendChild(newDiv);
  }

  for (let i = 0; i < SIZE_Y; i++) {
    const newContainer = document.createElement("div");
    newContainer.classList.add(`row-${i}`);
    for (let j = 0; j < SIZE_X; j++) {
      const newDiv = document.createElement("div");
      newDiv.classList.add(`drawing-cell`);
      newDiv.classList.add(`col-${j}`);
      newDiv.style.height = 80 / (SIZE_Y + 1) + "vh";
      newDiv.style.width = 80 / (SIZE_Y + 1) + "vh";
      newDiv.addEventListener("click", () => onCellClick(i, j, SelectedColor));

      const newText = document.createElement("div");
      newText.classList.add(`drawing-cell-text`);
      newText.textContent = String(colorArray[i][j]);
      newText.style.fontSize = 80 / (SIZE_Y + 1) + "vh";

      newDiv.appendChild(newText);
      newContainer.appendChild(newDiv);
    }
    drawingContainer.appendChild(newContainer);
  }
}


function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

let selectedRow = 0;
let selectedCol = 0;
let testCell = document.querySelector(`.row-${selectedRow} .col-${selectedCol}`);
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
});






