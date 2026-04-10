import { Fonts } from './constants'
import { Language } from './i18n'

export type FontWeight = keyof typeof Fonts.weights

/**
 * Returns the appropriate font family based on language and weight.
 * For Thai, returns the weight-specific Prompt font variant.
 * For English, returns the system font (which handles weights automatically).
 */
export function getFontFamily(language: Language, weight: FontWeight = 'regular'): string {
  if (language !== 'th') {
    return Fonts.families.english
  }

  // Weight-shifted Prompt fonts for Thai to reduce global thickness
  const weightValue = Fonts.weights[weight]
  switch (weightValue) {
    case '700':
      return 'Prompt-Bold' 
    case '600':
      return 'Prompt-SemiBold'
    case '500':
      return 'Prompt-Medium'
    case '400':
    default:
      return 'Prompt-Regular'
  }
}
