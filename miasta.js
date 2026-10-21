// =====================================================
//  MIASTA – plakietki pod globusem
// =====================================================
// Tworzy przycisk dla każdego miasta z dane.js.
// Kliknięcie obraca globus do tego miasta.

(function () {
  const lista = document.getElementById('listaMiast');
  if (!lista) return;

  Koncertownik.dane.miasta.forEach(miasto => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'city-badge';
    btn.textContent = '📍 ' + miasto.nazwa;

    btn.addEventListener('click', () => {
      lista.querySelectorAll('.city-badge').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Koncertownik.globus?.lecDo(miasto.nazwa);
    });

    lista.appendChild(btn);
  });
})();
