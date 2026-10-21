// =====================================================
//  PODSTRONA ARTYSTY – artysta.html?id=palaye-royale
// =====================================================
// Jeden szablon dla wszystkich artystów. Pobiera dane z bazy,
// nakłada motyw artysty i pokazuje jego koncerty.

(async function () {
  try {
    await Koncertownik.wczytajDane();
  } catch (blad) {
    Koncertownik.bladLadowania(blad);
    return;
  }

  const { esc, data, youtubeId, koncertyArtysty } = Koncertownik.narzedzia;
  const id = new URLSearchParams(location.search).get('id');
  const artysta = Koncertownik.dane.artysci.find(a => a.id === id);
  const naglowek = document.getElementById('nazwaArtysty');
  const lista = document.getElementById('koncerty');

  Koncertownik.motyw.zastosuj(artysta?.motyw);
  document.getElementById('stopka').textContent = Koncertownik.dane.ustawienia.stopka;

  if (!artysta) {
    naglowek.textContent = 'Nie znaleziono artysty';
    return;
  }

  document.title = `${artysta.nazwa} – Koncertownik`;
  naglowek.textContent = artysta.nazwa;

  const koncerty = koncertyArtysty(id);
  lista.innerHTML = koncerty.length
    ? koncerty.map(kartaKoncertu).join('')
    : '<section><p class="pusto">Koncerty do uzupełnienia.</p></section>';

  // --- Jedna karta koncertu ---
  function kartaKoncertu(k) {
    return `
      <section class="koncert">
        <h2>📅 ${esc(data(k.data))}</h2>
        <p class="miejsce">📍 ${esc(k.miasto || 'miasto do uzupełnienia')}${k.miejsce ? ' · ' + esc(k.miejsce) : ''}</p>
        ${setlista(k.setlista)}
        ${filmy(k.filmy)}
      </section>`;
  }

  function setlista(utwory = []) {
    if (!utwory?.length) return '';
    return `<h3>🎶 Setlista</h3><ol class="setlista">${utwory.map(u => `<li>${esc(u)}</li>`).join('')}</ol>`;
  }

  function filmy(linki = []) {
    const ids = (linki || []).map(youtubeId).filter(Boolean);
    if (!ids.length) return '';
    return `<h3>🎥 Nagrania</h3><div class="filmy">${ids.map(v => `
      <iframe src="https://www.youtube-nocookie.com/embed/${v}" title="Nagranie z koncertu"
        loading="lazy" allowfullscreen
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"></iframe>`).join('')}</div>`;
  }
})();
