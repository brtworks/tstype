// EXIT CODE WATERMARKS
// 1001 FETCH_WORDS_FAIL
// 1002 FETCH_PHOTOS_FAIL
// 2001 WEBGL_UNSUPPORTED
// 3001 LIGHTBOX_EMPTY

(function diagnostics(){
  try {
    const count = parseInt(sessionStorage.getItem('loadCount') || '0', 10) + 1;
    sessionStorage.setItem('loadCount', count.toString());
    console.log(`[PAGE LOAD] count=${count}`);
  } catch(e) {
    console.warn('[PAGE LOAD] sessionStorage unavailable');
  }
})();

const EXIT_CODES = {
  FETCH_WORDS_FAIL: 1001,
  FETCH_PHOTOS_FAIL: 1002,
  WEBGL_UNSUPPORTED: 2001,
  LIGHTBOX_EMPTY: 3001
};

window.addEventListener('error', (e) => {
  console.error(`[GLOBAL ERROR][code=0] ${e.message}`, e);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error(`[UNHANDLED PROMISE][code=0]`, e.reason);
});

// TYPEWRITER (hero rotating words)
function TxtType(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.isDeleting = false;
  this.tick();
}

TxtType.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];
  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }
  this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';
  var that = this;
  var delta = 80 - Math.random() * 60;
  if (this.isDeleting) delta /= 2;
  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 300;
  }
  setTimeout(function() { that.tick(); }, delta);
};

// Utility
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Lightbox state
let allPhotos = [];
let currentPhotoIndex = 0;

// DOM refs (after load)
let lightbox, lightboxImg, lightboxClose, lightboxPrev, lightboxNext, lightboxInfo;

// Lightbox functions
function openLightbox(index) {
  if (!allPhotos.length) {
    console.error(`[LIGHTBOX][code=${EXIT_CODES.LIGHTBOX_EMPTY}] No photos loaded.`);
    return;
  }
  currentPhotoIndex = index;
  lightboxImg.src = allPhotos[index].urls.full;
  lightboxInfo.textContent = `${index + 1} / ${allPhotos.length}`;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function showNext() {
  currentPhotoIndex = (currentPhotoIndex + 1) % allPhotos.length;
  lightboxImg.src = allPhotos[currentPhotoIndex].urls.full;
  lightboxInfo.textContent = `${currentPhotoIndex + 1} / ${allPhotos.length}`;
}

function showPrev() {
  currentPhotoIndex = (currentPhotoIndex - 1 + allPhotos.length) % allPhotos.length;
  lightboxImg.src = allPhotos[currentPhotoIndex].urls.full;
  lightboxInfo.textContent = `${currentPhotoIndex + 1} / ${allPhotos.length}`;
}

// Projects typewriter
function startProjectsTypewriter() {
  const lines = [
    "Crafting Digital Experiences",
    "Building tomorrow's solutions today",
    "Innovation meets design",
    "Code that speaks volumes"
  ];
  let speed = 50;
  let idx = 0;
  let charPos = 0;
  let currentLength = lines[0].length;
  const destination = document.getElementById("typedtext");

  function loop() {
    let s = lines.slice(0, idx).join('<br />');
    destination.innerHTML = s + (idx < lines.length ? (s ? '<br />' : '') + lines[idx].substring(0, charPos) + "<span style='color:#888;'>_</span>" : s);
    if (charPos++ === currentLength) {
      charPos = 0;
      idx++;
      if (idx < lines.length) {
        currentLength = lines[idx].length;
        setTimeout(loop, 500);
      }
    } else {
      setTimeout(loop, speed);
    }
  }
  setTimeout(loop, 500);
}

// Creative words fetch
async function fetchCreativeWords() {
  try {
    // Single fetch instead of 7 separate (optimization)
    const response = await fetch('https://random-word-api.herokuapp.com/all');
    const allWords = await response.json();
    const words = [];
    for (let i = 0; i < 7; i++) {
      words.push(allWords[Math.floor(Math.random() * allWords.length)]);
    }
    return words;
  } catch (error) {
    console.error(`[WORDS][code=${EXIT_CODES.FETCH_WORDS_FAIL}]`, error);
    return ['creator','innovator','visionary','builder','dreamer','explorer','artist'];
  }
}

// Unsplash loading
function loadUnsplashPhotos() {
  const username = 'beratbk';
  const accessKey = 'QdGsxleLkUbuuytPTUt-g5HpOwB_Mg6OEhNHc3GoKGg';
  const url = `https://api.unsplash.com/users/${username}/photos?client_id=${accessKey}&per_page=50`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      allPhotos = data;
      const photosContainer = document.getElementById('photos-container');
      const shuffled = shuffleArray(data);
      const rows = [[], [], []];
      shuffled.forEach((photo, i) => rows[i % 3].push(photo));
      rows.forEach(rowPhotos => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'photos-row';
        rowPhotos.forEach(photo => {
          const card = document.createElement('div');
          card.className = 'photo-card';
            const img = document.createElement('img');
            img.src = photo.urls.regular;
            img.alt = photo.alt_description || 'Photo';
            img.onerror = () => console.warn('[IMAGE LOAD WARNING]', img.src);
            card.appendChild(img);
            card.addEventListener('click', () => openLightbox(data.indexOf(photo)));
            rowDiv.appendChild(card);
        });
        photosContainer.appendChild(rowDiv);
      });
    })
    .catch(err => console.error(`[PHOTOS][code=${EXIT_CODES.FETCH_PHOTOS_FAIL}]`, err));
}

// Dots background
function initDots() {
  const spacing = 45;
  let dots = [];
  function createDots() {
    const cols = Math.ceil(window.innerWidth / spacing);
    const totalHeight = document.documentElement.scrollHeight;
    const rows = Math.ceil(totalHeight / spacing);
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        document.body.appendChild(dot);
        const baseX = col * spacing;
        const baseY = row * spacing;
        dots.push({ element: dot, baseX, baseY });
        dot.style.left = baseX + "px";
        dot.style.top = baseY + "px";
      }
    }
  }
  createDots();
  window.addEventListener('resize', () => {
    dots.forEach(d => d.element.remove());
    dots = [];
    createDots();
  });
}

// WebGL cube
function initWebGL() {
  const canvas = document.getElementById('webgl-container');
  const gl = canvas.getContext('webgl');
  canvas.width = 400;
  canvas.height = 400;
  if (!gl) {
    console.error(`[WEBGL][code=${EXIT_CODES.WEBGL_UNSUPPORTED}] WebGL not supported`);
    return;
  }

  const vertexShaderSource = `
    attribute vec3 position;
    attribute vec3 color;
    uniform mat4 projection;
    uniform mat4 view;
    uniform mat4 model;
    varying vec3 vertexColor;
    void main() {
      gl_Position = projection * view * model * vec4(position, 1.0);
      vertexColor = color;
    }
  `;
  const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vertexColor;
    void main() {
      gl_FragColor = vec4(vertexColor, 1.0);
    }
  `;
  function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[WEBGL SHADER ERROR]', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
  const vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
  const fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const vertices = new Float32Array([
    -0.3,-0.3,0.3,  0.3,-0.3,0.3,  0.3,0.3,0.3,  -0.3,0.3,0.3,
    -0.3,-0.3,-0.3, -0.3,0.3,-0.3, 0.3,0.3,-0.3, 0.3,-0.3,-0.3,
    -0.3,0.3,-0.3,  -0.3,0.3,0.3,  0.3,0.3,0.3,  0.3,0.3,-0.3,
    -0.3,-0.3,-0.3, 0.3,-0.3,-0.3, 0.3,-0.3,0.3, -0.3,-0.3,0.3,
    0.3,-0.3,-0.3,  0.3,0.3,-0.3,  0.3,0.3,0.3,  0.3,-0.3,0.3,
    -0.3,-0.3,-0.3, -0.3,-0.3,0.3, -0.3,0.3,0.3, -0.3,0.3,-0.3,
  ]);
  const colors = new Float32Array([
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    1,1,0, 1,1,0, 1,1,0, 1,1,0,
    0,1,1, 0,1,1, 0,1,1, 0,1,1,
    1,0,1, 1,0,1, 1,0,1, 1,0,1
  ]);
  const indices = new Uint16Array([
    0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11,
    12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'position');
  const colLoc = gl.getAttribLocation(program, 'color');
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colLoc);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0,0,0,0);
  gl.viewport(0,0,canvas.width,canvas.height);

  const projLoc = gl.getUniformLocation(program,'projection');
  const viewLoc = gl.getUniformLocation(program,'view');
  const modelLoc = gl.getUniformLocation(program,'model');

  function perspective(fov, aspect, near, far){
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1.0 / (near - far);
    return [f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,(2*far*near)*nf,0];
  }
  function identity(){ return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
  function multiply(a,b){
    const r = new Array(16);
    for(let i=0;i<4;i++){
      for(let j=0;j<4;j++){
        let sum=0;
        for(let k=0;k<4;k++){
          sum += a[i*4+k]*b[k*4+j];
        }
        r[i*4+j]=sum;
      }
    }
    return r;
  }
  function rotateX(a){ const c=Math.cos(a),s=Math.sin(a); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; }
  function rotateY(a){ const c=Math.cos(a),s=Math.sin(a); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; }
  function rotateZ(a){ const c=Math.cos(a),s=Math.sin(a); return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]; }

  const projection = perspective(Math.PI/4, 1, 0.1, 100);
  const view = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-2,1];

  let angle = 0;
  function render(){
    angle += 0.01;
    let model = identity();
    model = multiply(model, rotateX(angle));
    model = multiply(model, rotateY(angle));
    model = multiply(model, rotateZ(angle));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(projLoc,false,projection);
    gl.uniformMatrix4fv(viewLoc,false,view);
    gl.uniformMatrix4fv(modelLoc,false,model);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(render);
  }
  render();
}

// INIT
window.onload = function() {
  initDots();
  startProjectsTypewriter();
  loadUnsplashPhotos();

  // Hero dynamic words
  fetchCreativeWords().then(words => {
    const el = document.querySelector('.typewrite');
    el.setAttribute('data-type', JSON.stringify(words));
    new TxtType(el, words, 2000);
  });

  // Lightbox refs + events
  lightbox = document.getElementById('lightbox');
  lightboxImg = document.getElementById('lightbox-img');
  lightboxClose = document.getElementById('lightbox-close');
  lightboxPrev = document.getElementById('lightbox-prev');
  lightboxNext = document.getElementById('lightbox-next');
  lightboxInfo = document.getElementById('lightbox-info');

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closeLightbox();
  });

  initWebGL();

  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = this.getAttribute('href');
      if (target.startsWith('#')) {
        e.preventDefault(); // Prevent default only for same-page links
        document.querySelector(target).scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  const container = document.querySelector('.container');
  const numCols = 12; // Bootstrap grid has 12 columns
  const numRows = 6; // Adjust based on your layout

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.style.top = `${(row + 1) * 10}%`; // Adjust row spacing
      dot.style.left = `${(col + 1) * (100 / numCols)}%`; // Adjust column spacing
      container.appendChild(dot);
    }
  }
};