// Harita
const map = L.map('map').setView([39.8858, 32.6258], 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

// Batman
const batmanIcon = L.icon({
  iconUrl:'https://upload.wikimedia.org/wikipedia/tr/4/40/Batmanlee.png',
  iconSize:[50,50], iconAnchor:[25,25]
});
let batmanMarker = L.marker([39.8858,32.6258],{icon:batmanIcon}).addTo(map);

// HUD
let score = 0, health = 3;
const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");

// Düşmanlar
let enemies = [];
function spawnEnemy(){
  let lat = 39.8845 + Math.random()*0.003; 
  let lng = 32.6240 + Math.random()*0.003;
  let e = L.marker([lat,lng],{
    icon:L.divIcon({
      className:'enemy', 
      html:'<div style="width:40px;height:40px;background:red;border-radius:50%;"></div>'
    })
  }).addTo(map);
  enemies.push(e);
}
for(let i=0;i<2;i++) spawnEnemy();

// Gizli nesneler
let hiddenItems = [
  L.marker([39.8859,32.6255],{
    icon: L.divIcon({
      className:'hidden', 
      html:'<div style="width:30px;height:30px;background:yellow;border-radius:50%;"></div>'
    })
  }).addTo(map),
  L.marker([39.8856,32.6262],{
    icon: L.divIcon({
      className:'hidden', 
      html:'<div style="width:30px;height:30px;background:yellow;border-radius:50%;"></div>'
    })
  }).addTo(map)
];
hiddenItems.forEach(i=>i.setOpacity(0)); // başta görünmez

// Bataranglar
let batarangs = [];

// Karakter hareketi ve tuşlar
let detectiveMode = false;
window.addEventListener('keydown', e => {
  let latlng = batmanMarker.getLatLng();
  let step = 0.0003;
  if(e.key === "ArrowUp") latlng.lat += step;
  if(e.key === "ArrowDown") latlng.lat -= step;
  if(e.key === "ArrowLeft") latlng.lng -= step;
  if(e.key === "ArrowRight") latlng.lng += step;
  batmanMarker.setLatLng(latlng);
  checkCollisions(latlng);

  if(e.key === " ") shootBatarang(latlng);
  if(e.key === "d") toggleDetectiveMode(); // Detektif modu
});

// Batarang atma
function shootBatarang(pos){
  let b = L.circleMarker([pos.lat,pos.lng],{radius:5,color:'blue'}).addTo(map);
  batarangs.push({marker:b, dir:[0.0005,0]}); // sabit kuzey yönü
}

// Detektif modu
function toggleDetectiveMode(){
  detectiveMode = !detectiveMode;
  hiddenItems.forEach(item => item.setOpacity(detectiveMode ? 1 : 0));
}

// Düşman rastgele hareketi
function moveEnemies(){
  enemies.forEach(e => {
    let pos = e.getLatLng();
    let dx = (Math.random()-0.5)*0.0005;
    let dy = (Math.random()-0.5)*0.0005;
    e.setLatLng([pos.lat+dx, pos.lng+dy]);
  });
}
setInterval(moveEnemies, 500);

// Batarang hareketi
setInterval(()=>{
  for(let i=batarangs.length-1; i>=0; i--){
    let b = batarangs[i];
    let latlng = b.marker.getLatLng();
    latlng.lat += b.dir[0];
    latlng.lng += b.dir[1];
    b.marker.setLatLng(latlng);

    for(let j=enemies.length-1; j>=0; j--){
      let e = enemies[j];
      if(latlng.distanceTo(e.getLatLng())<10){
        map.removeLayer(e);
        enemies.splice(j,1);
        score += 20;
        scoreEl.textContent = score;
        setTimeout(spawnEnemy, 1000); // yeni düşman
      }
    }

    if(latlng.lat>39.888 || latlng.lat<39.883){
      map.removeLayer(b.marker);
      batarangs.splice(i,1);
    }
  }
}, 50);

// Çarpışma kontrolü
function checkCollisions(batmanPos){
  for(let i=enemies.length-1; i>=0; i--){
    if(batmanPos.distanceTo(enemies[i].getLatLng())<10){
      health--;
      healthEl.textContent = health;
      if(health <= 0){
        alert("GAME OVER!");
        location.reload();
      }
    }
  }

  for(let i=0; i<hiddenItems.length; i++){
    let item = hiddenItems[i];
    if(batmanPos.distanceTo(item.getLatLng())<10 && item.options.opacity===0){
      score += 10;
      scoreEl.textContent = score;
      if(!detectiveMode) item.setOpacity(1);
    }
  }
}
