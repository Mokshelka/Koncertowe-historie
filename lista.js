// =====================================================
//  LISTA ARTYSTÓW – rozwijane menu na stronie głównej
// =====================================================
// Po rozwinięciu widać koncerty artysty i link do jego podstrony.

(function () {
  const kontener = document.getElementById('artistList');
  if (!kontener) return;
  const { esc, data, koncertyArtysty } = Koncertownik.narzedzia;

  Koncertownik.dane.artysci.forEach(artysta => {
    const koncerty = koncertyArtysty(artysta.id);

    const wiersze = koncerty.length
      ? koncerty.map(k => `<li>📅 <b>${esc(data(k.data))}</b> — ${esc(k.miasto || 'miasto do uzupełnienia')}</li>`).join('')
      : '<li>Koncerty do uzupełnienia</li>';

    const item = document.createElement('div');
    item.className = 'artist-item';
    item.innerHTML = `
      <button type="button" class="artist-btn" aria-expanded="false">
        <span>🎤 ${esc(artysta.nazwa)}</span> <span class="arrow">▼</span>
      </button>
      <div class="shows-dropdown" hidden>
        <ul>${wiersze}</ul>
        <a class="artist-link" href="artysta.html?id=${encodeURIComponent(artysta.id)}">Zobacz stronę artysty →</a>
      </div>`;

    const btn = item.querySelector('.artist-btn');
    const panel = item.querySelector('.shows-dropdown');
    btn.addEventListener('click', () => {
      const otwarte = !panel.hidden;
      panel.hidden = otwarte;
      btn.setAttribute('aria-expanded', String(!otwarte));
      btn.querySelector('.arrow').textContent = otwarte ? '▼' : '▲';
    });

    kontener.appendChild(item);
  });
})();
