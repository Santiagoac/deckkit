/** The handful of words deckkit itself says.
 *
 *  Everything a founder writes lives in `canon/` and their slides. These are the
 *  strings the tool supplies: the index, the password screen, the draft tag. A
 *  Mexican founder showing a deck to a client should not hit "Pick the deck for
 *  the room you're walking into" on the way in.
 *
 *  Driven by `language` in canon/voice.yaml, which the onboarding already asks
 *  for. Two languages because two are honestly maintained; an unknown one falls
 *  back to English rather than shipping blanks.
 */

export const LANGUAGES = ['en', 'es'];

const STRINGS = {
  en: {
    decks: 'Decks',
    indexNote: "Pick the deck for the room you're walking into.",
    draft: 'Draft',
    slideCount: 'slides',
    gateNote: 'Internal. Enter the team password to see the list.',
    gateLabel: 'Password',
    gateSubmit: 'Enter',
    gateError: 'That password is not right.',
    gateFoot: 'A deck you were sent opens without this.',
    backToDecks: '← Decks',
    pause: 'Pause',
    play: 'Play',
    share: 'Share',
    shareNormal: 'Normal',
    shareStory: 'Story',
    shareSeconds: 'Seconds per slide',
    shareCopy: 'Copy link',
    shareCopied: 'Copied',
  },
  es: {
    decks: 'Decks',
    indexNote: 'Elige el deck para la junta a la que vas entrando.',
    draft: 'Borrador',
    slideCount: 'slides',
    gateNote: 'Interno. Escribe la contraseña del equipo para ver la lista.',
    gateLabel: 'Contraseña',
    gateSubmit: 'Entrar',
    gateError: 'Esa contraseña no es.',
    gateFoot: 'Un deck que te mandaron abre sin esto.',
    backToDecks: '← Decks',
    pause: 'Pausar',
    play: 'Reanudar',
    share: 'Compartir',
    shareNormal: 'Normal',
    shareStory: 'Story',
    shareSeconds: 'Segundos por slide',
    shareCopy: 'Copiar link',
    shareCopied: 'Copiado',
  },
};

/** `es-MX` and `ES` both mean Spanish. Anything unknown means English. */
export function normalizeLanguage(language) {
  const base = String(language ?? '').toLowerCase().split('-')[0];
  return LANGUAGES.includes(base) ? base : 'en';
}

export function uiStrings(language) {
  return STRINGS[normalizeLanguage(language)];
}
