// === 1. WSTAWIANIE PINEZEK NA FIOLETOWY GLOBUS ===
const mapContainer = document.getElementById('map');

// Definicja miast i ich pozycji procentowych na okrągłym globusie
const locations = [
  { city: "Kopenhaga", top: "28%", left: "45%" },
  { city: "Warszawa", top: "42%", left: "68%" },
  { city: "Wrocław", top: "54%", left: "38%" },
  { city: "Lublin", top: "58%", left: "75%" },
  { city: "Kraków", top: "70%", left: "55%" }
];

locations.forEach(loc => {
  const pin = document.createElement('div');
  pin.className = 'globe-pin';
  pin.style.top = loc.top;
  pin.style.left = loc.left;
  pin.innerHTML = `
    <div class="pin-dot"></div>
    <div class="pin-label">${loc.city}</div>
  `;
  pin.title = `Koncert w: ${loc.city}`;
  mapContainer.appendChild(pin);
});


// === 2. LISTA ARTYSTÓW (ROZWIJANE MENU) ===
const artistsData = [
  { name: "🎤 Palaye Royale", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 All for Metal", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Kim Dracula", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 DPR Ian, DPR Cream, DPR Arctic", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Dead Poet Society", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Des Rocs", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Grandson", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Lordi", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Kpop Nation", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Lordofon", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Nothing but Thieves", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 SBM Festiwal", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 The Rose", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Wind Rose", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Zdechły Osa", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Yann", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] },
  { name: "🎤 Tabber", shows: [{ date: "Do uzupełnienia", venue: "Wybierz miasto" }] }
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
