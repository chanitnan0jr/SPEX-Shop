export type Language = 'en' | 'th'

export interface LocalizedText {
  en: string
  th: string
}

export function pickText(language: Language, text: LocalizedText): string {
  return text[language]
}
