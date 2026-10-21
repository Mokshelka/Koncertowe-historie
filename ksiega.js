// =====================================================
//  KSIĘGA GOŚCI
// =====================================================
// Na razie wpisy NIE są zapisywane – GitHub Pages nie ma serwera.
// W kroku 3 podłączymy tu bazę Supabase.

(function () {
  const form = document.getElementById('guestbookForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const info = document.getElementById('guestbookInfo');
    info.textContent = 'Dziękuję za wpis! ✨';
    form.reset();
    setTimeout(() => { info.textContent = ''; }, 4000);
  });
})();
