// =====================================================
//  POŁĄCZENIE Z BAZĄ SUPABASE – jedyne miejsce z adresem
// =====================================================
// Te dwie wartości są publiczne (i tak widać je w kodzie strony).
// Dostęp do danych chronią reguły w bazie (plik baza.sql).
// NIGDY nie wklejaj tu klucza „secret” / „service_role”!

window.Koncertownik = window.Koncertownik || {};

Koncertownik.SUPABASE_URL   = 'https://katdkffizktwlgwnpqkd.supabase.co';
Koncertownik.SUPABASE_KLUCZ = 'sb_publishable_13SuX6ZVhcNH2FgF1dQAaA_4QCSge-O';

Koncertownik.db = window.supabase.createClient(
  Koncertownik.SUPABASE_URL,
  Koncertownik.SUPABASE_KLUCZ
);
