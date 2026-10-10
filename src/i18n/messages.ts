// Mensajes de la UI. El idioma se fija al compilar con VITE_APP_LOCALE (por defecto "en");
// si no existe el diccionario pedido se cae a inglés.
const dictionaries = import.meta.glob<{ default: Record<string, unknown> }>('../../messages/*.json', {
  eager: true,
});

export const locale: string = import.meta.env.VITE_APP_LOCALE || 'en';

export const messages: Record<string, unknown> = (
  dictionaries[`../../messages/${locale}.json`] ?? dictionaries['../../messages/en.json']
).default;
