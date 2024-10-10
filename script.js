//Create Initial references
let pickColor = document.getElementById("pick-color");
let error = document.getElementById("error");
let fileInput = document.getElementById("file");
let image = document.getElementById("uploaded-image");
let hexValRef = document.getElementById("hex-val-ref");
let rgbValRef = document.getElementById("rgb-val-ref");
let customAlert = document.getElementById("custom-alert");
let pickedColorRef = document.getElementById("picked-color-ref");
let eyeDropper;



//drop area and image size and image viewing functions goes here
const dropArea=document.getElementById("drop-area");
const inputFile=document.getElementById("input-file");
const imageView=document.getElementById("img-view")
inputFile.addEventListener("change",uploadImage);
function uploadImage(){
    let imgLink=URL.createObjectURL(inputFile.files[0]);
    imageView.style.backgroundImage=`url(${imgLink})`;
    imageView.textContent='';
    imageView.style.minWidth='200px';
    imageView.style.minHeight='200px';
    imageView.style.maxWidth='1000px';
    imageView.style.maxHeight='2000px';
    imageView.style.backgroundSize='cover';
    imageView.style.backgroundPosition='center';
    imageView.style.display = 'flex'; 
    imageView.style.justifyContent = 'center'; 
    imageView.style.alignItems = 'center';
    imageView.style.border=0;
}





//Function On Window Load
window.onload = () => {
  //Check if the browser supports eyedropper
  if ("EyeDropper" in window) {
    pickColor.classList.remove("hide");
    eyeDropper = new EyeDropper();
  } else {
    error.classList.remove("hide");
    error.innerText = "Your browser doesn't support Eyedropper API";
    pickColor.classList.add("hide");
    return false;
  }
};

//Eyedropper logic
const colorSelector = async () => {
  const color = await eyeDropper
    .open()
    .then((colorValue) => {
      error.classList.add("hide");
      //Get the hex color code
      let hexValue = colorValue.sRGBHex;
      //Convert Hex Value To RGB
      let rgbArr = [];
      for (let i = 1; i < hexValue.length; i += 2) {
        rgbArr.push(parseInt(hexValue[i] + hexValue[i + 1], 16));
        console.log(rgbArr);
      }
      let rgbValue = "rgb(" + rgbArr + ")";
      //CONVERSION OF RGB TO HSL
      let r = rgbArr[0]/255;
      let g = rgbArr[1]/255;
      let b = rgbArr[2]/255;
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);
      let h, s, l=(max + min)/2;
      if (max === min) {
        h = s = 0;
      } else{
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
          case r:
            h=(g-b)/d+(g<b?6:0);
            break;
          case g:
            h=(b-r)/d+2;
            break;
          case b:
            h=(r-g)/d+4;
            break;
        }
        h/=6;
      }
      h=Math.round(h*360);
      s=Math.round(s*100);
      l=Math.round(l*100);
      let hslValue=`hsl(${h},${s}%,${l}%)`;

      console.log(hexValue, rgbValue, hslValue);
      result.style.display = "grid";
      hexValRef.value = hexValue;
      rgbValRef.value = rgbValue;
      document.getElementById("hsl-val-ref").value =hslValue;
      pickedColorRef.style.backgroundColor = hexValue;

      document.getElementById("hex-label").innerText="HEX Value";
      document.getElementById("rgb-label").innerText="RGB Value";
      document.getElementById("hsl-label").innerText="HSL Value";
    })
    .catch((err) => {
      error.classList.remove("hide");
      //If user presses escape to close the eyedropper
      if (err.toString().includes("AbortError")) {
        error.innerText = "";
      } else {
        error.innerText = err;
      }
    });
};

//Button click
pickColor.addEventListener("click", colorSelector);

//Allow user to choose image of their own choice
fileInput.onchange = () => {
  result.style.display = "none";
  //The fileReader object helps to read contents of file stored on computer
  let reader = new FileReader();
  //readAsDataURL reads the content of input file
  reader.readAsDataURL(fileInput.files[0]);
  reader.onload = () => {
    //onload is triggered after file reading operation is successfully completed
    //set src attribute of image to result/input file
    imageView.src=reader.result;
    imageView.style.border-0;
  };
};

//Function to copy the color code
let copy = (textId) => {
  //Selects the text in the <input> element
  document.getElementById(textId).select();
  //Copies the selected text to clipboard
  document.execCommand("copy");
  //Display Alert
  customAlert.style.transform = "scale(1)";
  setTimeout(() => {
    customAlert.style.transform = "scale(0)";
  }, 20000);
};











// Generate Color Palette function
function generateColorPalette() {
  const img = document.getElementById("img-view");
  const imageSrc = img.style.backgroundImage.replace('url("', '').replace('")', '');
  const imgElement = new Image();
  imgElement.src = imageSrc;

  imgElement.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = pixels.data;

    const colors = [];
    for (let i = 0; i < pixelData.length; i += 4) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];

      if (a > 0) {
        colors.push([r, g, b]);
      }
    }

    const paletteCountInput = document.getElementById("palette-count");
    const paletteCount = parseInt(paletteCountInput.value);

    const palette = kMeansClustering(colors, paletteCount);

    const paletteContainer = document.getElementById("palette-container");
    paletteContainer.innerHTML = "";

    palette.forEach((color) => {
      const colorDiv = document.createElement("div");
      colorDiv.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      colorDiv.style.width = "150px";
      colorDiv.style.height = "50px";
      colorDiv.style.display = "inline-block";
      colorDiv.style.margin = "3px";
      colorDiv.style.position = "relative";

      const colorCodeSpan = document.createElement("span");
      colorCodeSpan.style.position = "absolute";
      colorCodeSpan.style.top = "0";
      colorCodeSpan.style.left = "0";
      colorCodeSpan.style.width = "100%";
      colorCodeSpan.style.height = "100%";
      colorCodeSpan.style.display = "flex";
      colorCodeSpan.style.justifyContent = "center";
      colorCodeSpan.style.alignItems = "center";
      colorCodeSpan.style.color = "white";
      colorCodeSpan.style.fontWeight = "bold";
      colorCodeSpan.style.opacity = "0";
      colorCodeSpan.style.transition = "opacity 0.5s";
      colorCodeSpan.textContent = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      colorDiv.appendChild(colorCodeSpan);

      colorDiv.addEventListener("mouseover", () => {
        colorCodeSpan.style.opacity = "1";
      });

      colorDiv.addEventListener("mouseout", () => {
        colorCodeSpan.style.opacity = "0";
      });

      paletteContainer.appendChild(colorDiv);
    });
  }
}

function kMeansClustering(data, k) {
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)]);
  }

  let clusters = [];
  for (let i = 0; i < k; i++) {
    clusters.push([]);
  }

  let converged = false;
  while (!converged) {
    for (let i = 0; i < data.length; i++) {
      let minDistance = Infinity;
      let closestCentroidIndex = -1;
      for (let j = 0; j < centroids.length; j++) {
        let distance = euclideanDistance(data[i], centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = j;
        }
      }
      clusters[closestCentroidIndex].push(data[i]);
    }

    let newCentroids = [];
    for (let i = 0; i < clusters.length; i++) {
      let sum = [0, 0, 0];
      for (let j = 0; j < clusters[i].length; j++) {
        sum[0] += clusters[i][j][0];
        sum[1] += clusters[i][j][1];
        sum[2] += clusters[i][j][2];
      }
      newCentroids.push([sum[0] / clusters[i].length, sum[1] / clusters[i].length, sum[2] / clusters[i].length]);
    }

    if (JSON.stringify(centroids) === JSON.stringify(newCentroids)) {
      converged = true;
    } else {
      centroids = newCentroids;
    }

    clusters = [];
    for (let i = 0; i < k; i++) {
      clusters.push([]);
    }
  }

  return centroids;
}

function euclideanDistance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
}
// Set default palette count
const paletteCountInput = document.getElementById("palette-count");
paletteCountInput.value = 10;

// Generate palette button click event
// ...

// ...

// ...

const generatePaletteButton = document.getElementById("generate-palette");
generatePaletteButton.addEventListener("click", () => {
  generateColorPalette();
  const secondDiv = document.getElementById("seconddiv");
  secondDiv.classList.toggle("show");
});