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

    // Reduce the number of pixels to process
    const step = 5; // Reduced step size for more precise results
    const colors = [];
    for (let i = 0; i < pixelData.length; i += step * 4) {
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

    const palette = kMeansClustering(colors, paletteCount, 50); // Increased iterations for more precise results

    // Sort the palette from brightest to darkest
    palette.sort((a, b) => {
      const luminanceA = calculateLuminance(a[0], a[1], a[2]);
      const luminanceB = calculateLuminance(b[0], b[1], b[2]);
      return luminanceB - luminanceA;
    });

    const paletteContainer = document.getElementById("palette-container");
    paletteContainer.innerHTML = "";

    palette.forEach((color) => {
      const colorDiv = document.createElement("div");
      colorDiv.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      colorDiv.style.width = "180px";
      colorDiv.style.height = "50px";
      colorDiv.style.display = "inline-block";
      colorDiv.style.margin = "0px";
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
      colorCodeSpan.style.fontWeight = "bold";
      colorCodeSpan.style.opacity = "0";
      colorCodeSpan.style.transition = "opacity 0.5s";
    
      // Round the RGB values to the nearest integer
      const roundedColor = color.map(Math.round);
      colorCodeSpan.textContent = `rgb(${roundedColor.join(", ")})`;
    
      // Calculate the opposite color
      const oppositeColor = [
        255 - color[0],
        255 - color[1],
        255 - color[2]
      ];
    
      // Set the text color to the opposite color
      colorCodeSpan.style.color = `rgb(${oppositeColor.join(", ")})`;
    
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

function calculateLuminance(r, g, b) {
  const rLinear = r / 255;
  const gLinear = g / 255;
  const bLinear = b / 255;

  const rLinearAdjusted = rLinear <= 0.03928 ? rLinear / 12.92 : Math.pow((rLinear + 0.055) / 1.055, 2.4);
  const gLinearAdjusted = gLinear <= 0.03928 ? gLinear / 12.92 : Math.pow((gLinear + 0.055) / 1.055, 2.4);
  const bLinearAdjusted = bLinear <= 0.03928 ? bLinear / 12.92 : Math.pow((bLinear + 0.055) / 1.055, 2.4);

  return  0.2126 * rLinearAdjusted + 0.7152 * gLinearAdjusted + 0.0722 * bLinearAdjusted;
}

function kMeansClustering(data, k, iterations) {
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)]);
  }

  let clusters = [];
  for (let i = 0; i < k; i++) {
    clusters.push([]);
  }

  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < data.length; j++) {
      let minDistance = Infinity;
      let closestCentroidIndex = -1;
      for (let l = 0; l < centroids.length; l++) {
        let distance = euclideanDistance(data[j], centroids[l]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = l;
        }
      }
      clusters[closestCentroidIndex].push(data[j]);
    }

    let newCentroids = [];
    for (let j = 0; j < clusters.length; j++) {
      let sum = [0, 0, 0];
      for (let l = 0; l < clusters[j].length; l++) {
        sum[0] += clusters[j][l][0];
        sum[1] += clusters[j][l][1];
        sum[2] += clusters[j][l][2];
      }
      newCentroids.push([sum[0] / clusters[j].length, sum[1] / clusters[j].length, sum[2] / clusters[j].length]);
    }

    centroids = newCentroids;
    clusters = [];
    for (let j = 0; j < k; j++) {
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
paletteCountInput.value = 6;

// Generate palette button click event
// ...



const generatePaletteButton = document.getElementById("generate-palette");
generatePaletteButton.addEventListener("click", () => {
  generateColorPalette();
  const secondDiv = document.getElementById("seconddiv");
  secondDiv.classList.toggle("show");
});