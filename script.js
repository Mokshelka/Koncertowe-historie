// === 1. MAPA Z PRAWIDŁOWYMI WSPÓŁRZĘDNYMI ===
const map = L.map('map', {
  zoomControl: false,
  dragging: true,
  scrollWheelZoom: false
}).setView([52.0, 16.0], 5); // Centrowanie na Polskę i Danię

// Dodanie ciemnych kafli mapy
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Poprawne współrzędne miast (Wrocław, Kraków, Warszawa, Lublin, Kopenhaga)
const locations = [
  { city: "Wrocław", coords: [51.1079, 17.0385] },
  { city: "Kraków", coords: [50.0647, 19.9450] },
  { city: "Warszawa", coords: [52.2297, 21.0122] },
  { city: "Lublin", coords: [51.2465, 22.5684] },
  { city: "Kopenhaga", coords: [55.6761, 12.5683] }
];

locations.forEach(loc => {
  L.marker(loc.coords).addTo(map)
    .bindPopup(`<b>🎵 ${loc.city}</b>`);
});


// === 2. MENU ARTYSTÓW (ROZWIJANE DATY) ===
const artistsData = [
  {
    name: "🎤 Dawid Podsiadło",
    shows: [
      { date: "15.06.2024", venue: "PGE Narodowy, Warszawa" },
      { date: "Data nieznana (2022)", venue: "Hala Stulecia, Wrocław" }
    ]
  },
  {
    name: "🎤 Coldplay",
    shows: [
      { date: "08.07.2023", venue: "Parken, Kopenhaga" }
    ]
  }
];

const artistListContainer = document.getElementById('artistList');

artistsData.forEach(artist => {
  const item = document.createElement('div');
  item.className = 'artist-item';
  
  let showsList = artist.shows.map(show => 
    `<li>📅 <b>${show.date}</b> — ${show.venue}</li>`
  ).join('');

  item.innerHTML = `
    <button class="artist-btn" onclick="toggleArtist(this)">
      <span>${artist.name}</span> <span class="arrow">▼</span>
    </button>
    <ul class="shows-dropdown" style="display: none;">
      ${showsList}
    </ul>
  `;
  
  artistListContainer.appendChild(item);
});

// Funkcja rozwijania i zwijania listy
function toggleArtist(button) {
  const dropdown = button.nextElementSibling;
  const isOpen = dropdown.style.display === "block";
  dropdown.style.display = isOpen ? "none" : "block";
  button.querySelector('.arrow').innerText = isOpen ? "▼" : "▲";
}


// === 3. OBSŁUGA FORMULARZA ===
document.getElementById('guestbookForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert("Dziękuję za wpis! ✨");
  this.reset();
});
