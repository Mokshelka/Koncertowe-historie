// === 1. KONFIGURACJA MAPY Z MIASTAMI ===
const map = L.map('map').setView([53.0, 14.0], 5); // Widok na Polskę i Danię

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Punkty na mapie (Wrocław, Kraków, Warszawa, Lublin, Kopenhaga)
const locations = [
  { city: "Wrocław", coords: [51.1100, 17.0325] },
  { city: "Kraków", coords: [50.0647, 19.9450] },
  { city: "Warszawa", coords: [52.2297, 21.0122] },
  { city: "Lublin", coords: [51.2465, 22.5684] },
  { city: "Kopenhaga", coords: [55.6761, 12.5683] }
];

locations.forEach(loc => {
  L.marker(loc.coords).addTo(map)
    .bindPopup(`<b>${loc.city}</b><br>Byłam tu na koncercie! 🎵`);
});

// === 2. DANE ARTYSTÓW I ROZWIJANE MENU ===
// Przykład struktury danych (możesz łatwo dopisywać kolejnych):
const artistsData = [
  {
    name: "Dawid Podsiadło",
    shows: [
      { id: "podsiadlo-1", date: "15.06.2024", venue: "PGE Narodowy, Warszawa" },
      { id: "podsiadlo-2", date: "Data nieznana (2022)", venue: "Hala Stulecia, Wrocław" }
    ]
  },
  {
    name: "Coldplay",
    shows: [
      { id: "coldplay-1", date: "08.07.2023", venue: "Kopenhaga" }
    ]
  }
];

// Generowanie rozwijanego menu w HTML
const artistListContainer = document.getElementById('artistList');

artistsData.forEach(artist => {
  const item = document.createElement('div');
  item.className = 'artist-item';
  
  let showsList = artist.shows.map(show => 
    `<li><a href="#${show.id}">📅 ${show.date} — ${show.venue}</a></li>`
  ).join('');

  item.innerHTML = `
    <button class="artist-btn" onclick="toggleArtist(this)">
      ${artist.name} <span class="arrow">▼</span>
    </button>
    <ul class="shows-dropdown" style="display: none;">
      ${showsList}
    </ul>
  `;
  
  artistListContainer.appendChild(item);
});

// Funkcja rozwijania i zwijania listy dat
function toggleArtist(button) {
  const dropdown = button.nextElementSibling;
  const isOpen = dropdown.style.display === "block";
  dropdown.style.display = isOpen ? "none" : "block";
  button.querySelector('.arrow').innerText = isOpen ? "▼" : "▲";
}

// === 3. OBSŁUGA FORMULARZA GOŚCI ===
document.getElementById('guestbookForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert("Dziękuję za wpis! w kolejnym kroku podepniemy go do bazy.");
  this.reset();
});
