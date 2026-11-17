// =====================================================
//  MEDIA – zdjęcia, nagrania, bilety i foldery z koncertów
// =====================================================
// Źródła: pliki wgrane do Supabase, YouTube, Dysk Google.
// Odwiedzający dostają z bazy tylko publiczne rzeczy –
// pilnują tego reguły w bazie (media.sql), nie ten plik.

window.Koncertownik = window.Koncertownik || {};

Koncertownik.media = {

  LIMIT_MB: 50,   // limit pliku w darmowym Supabase

  // Rozpoznaje link: YouTube, plik albo folder z Dysku Google
  rozpoznajLink(link) {
    const url = String(link).trim();
    const yt = Koncertownik.narzedzia.youtubeId(url);
    if (yt) return { zrodlo: 'youtube', adres: url };
    if (/drive\.google\.com/.test(url)) {
      if (/\/folders\/|embeddedfolderview/.test(url)) return { zrodlo: 'drive', adres: url, folder: true };
      if (this.driveId(url)) return { zrodlo: 'drive', adres: url };
    }
    if (/^https?:\/\//.test(url)) return { zrodlo: 'link', adres: url };
    return null;
  },

  // ID pliku/folderu z linku Dysku Google
  driveId(url) {
    const m = String(url).match(/\/(?:file\/d|folders)\/([\w-]{10,})/) || String(url).match(/[?&]id=([\w-]{10,})/);
    return m ? m[1] : null;
  },

  // Pobiera media koncertów i dokłada gotowe adresy do wyświetlenia
  async pobierz(koncertIds) {
    if (!koncertIds.length) return [];
    const { data, error } = await Koncertownik.db.from('media').select('*')
      .in('koncert_id', koncertIds).order('kolejnosc').order('utworzono');
    if (error) { console.error(error); return []; }
    await this.podpiszPliki(data);
    data.forEach(m => Object.assign(m, this.adresy(m)));
    return data;
  },

  // Pliki z prywatnych schowków otwieramy przez linki ważne 1 godzinę
  async podpiszPliki(lista) {
    const wgSchowka = {};
    lista.filter(m => m.zrodlo === 'plik').forEach(m => (wgSchowka[m.schowek] ||= []).push(m));
    for (const [schowek, pliki] of Object.entries(wgSchowka)) {
      const { data } = await Koncertownik.db.storage.from(schowek)
        .createSignedUrls(pliki.map(p => p.adres), 3600);
      (data || []).forEach((d, i) => { pliki[i].podpisany = d.signedUrl; });
    }
  },

  // Adres obrazka / odtwarzacza dla danego źródła
  adresy(m) {
    if (m.zrodlo === 'plik') return { src: m.podpisany };
    if (m.zrodlo === 'youtube') {
      const id = Koncertownik.narzedzia.youtubeId(m.adres);
      return { embed: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (m.zrodlo === 'drive') {
      const id = this.driveId(m.adres);
      if (m.typ === 'folder') return { embed: `https://drive.google.com/embeddedfolderview?id=${id}#grid` };
      if (m.typ === 'zdjecie') return { src: `https://drive.google.com/thumbnail?id=${id}&sz=w1600` };
      return { embed: `https://drive.google.com/file/d/${id}/preview` };
    }
    return { src: m.adres };
  },

  // Zmniejsza duże zdjęcia przed wysłaniem (oszczędza miejsce)
  async zmniejsz(plik, max = 2000, jakosc = 0.85) {
    if (!plik.type.startsWith('image/') || plik.type === 'image/gif') return plik;
    const obraz = await createImageBitmap(plik).catch(() => null);
    if (!obraz) return plik;   // np. HEIC z iPhone'a – wysyłamy bez zmian
    const skala = Math.min(1, max / Math.max(obraz.width, obraz.height));
    if (skala === 1 && plik.size < 1.5e6) return plik;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(obraz.width * skala);
    canvas.height = Math.round(obraz.height * skala);
    canvas.getContext('2d').drawImage(obraz, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', jakosc));
    return blob ? new File([blob], plik.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : plik;
  },

  // Usuwa pliki ze schowków (wiersze z bazy usuwa kto inny)
  async usunPliki(lista) {
    const wgSchowka = {};
    lista.filter(m => m.zrodlo === 'plik').forEach(m => (wgSchowka[m.schowek] ||= []).push(m.adres));
    for (const [schowek, sciezki] of Object.entries(wgSchowka)) {
      await Koncertownik.db.storage.from(schowek).remove(sciezki);
    }
  }
};
