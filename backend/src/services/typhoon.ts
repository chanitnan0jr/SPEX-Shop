import axios from 'axios'
import { ISpecHighlights } from '../models/Spec'

const TYPHOON_API_KEY = process.env.TYPHOON_API_KEY
const TYPHOON_MODEL = process.env.TYPHOON_MODEL || 'typhoon-v1.5-instruct'

export interface IOCRResult {
  brand: string
  model: string
  highlights: ISpecHighlights
}

export class TyphoonService {
  /**
   * Extract smartphone specs from a provided image URL or base64.
   * Maps visual data directly to the SpecBot technical schema.
   */
  static async extractSpecsFromImage(imagePath: string): Promise<IOCRResult> {
    if (!TYPHOON_API_KEY) {
      throw new Error('TYPHOON_API_KEY is not configured')
    }

    const payload = {
      model: TYPHOON_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract smartphone specifications from this image (e.g. box, manual, or sheet). Return a JSON object with: brand, model, display, chipset, ram, storage, camera, battery. If Thai text is present, translate technical terms to English but keep the core data accurate. Return ONLY valid JSON.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imagePath.startsWith('http') ? imagePath : `data:image/jpeg;base64,${imagePath}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    }

    try {
      const response = await axios.post('https://api.opentyphoon.ai/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${TYPHOON_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const content = response.data.choices[0].message.content
      const parsed = JSON.parse(content)

      return {
        brand: parsed.brand || 'Unknown',
        model: parsed.model || 'Unknown',
        highlights: {
          display: parsed.display,
          chipset: parsed.chipset,
          ram: parsed.ram,
          storage: parsed.storage,
          camera: parsed.camera,
          battery: parsed.battery
        }
      }
    } catch (error) {
      console.error('Typhoon OCR Error:', error)
      throw new Error('Failed to extract technical specs from image via Typhoon AI.')
    }
  }
}

/**
 * Expand a user query for better vector search retrieval.
 * Returns up to 3 distinct variations of the original technical query.
 */
export async function expandQuery(query: string): Promise<string[]> {
  if (!TYPHOON_API_KEY) return [query]

  try {
    const response = await axios.post('https://api.opentyphoon.ai/v1/chat/completions', {
      model: TYPHOON_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a smartphone search expert. Expand user queries into exactly 3 distinct technical search variations (brand, model, chipset, specs) in Thai. Return each variation on a new line. Do not use numbering or bullet points.'
        },
        { role: 'user', content: query }
      ],
      max_tokens: 512,
      temperature: 0.6,
    }, {
      headers: { 
        'Authorization': `Bearer ${TYPHOON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    const content = response.data.choices[0].message.content || ''
    const variations = content
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 3)

    return variations.length > 0 ? variations : [query]
  } catch (error: any) {
    if (error.response) {
      console.error('[typhoon] expandQuery API Error:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error('[typhoon] expandQuery error:', error.message)
    }
    return [query]
  }
}

/**
 * Generate a technically accurate answer based on the provided hardware context.
 */
export async function generateAnswer(query: string, context: string): Promise<string> {
  if (!TYPHOON_API_KEY) return 'Technical service unavailable.'

  try {
    const response = await axios.post('https://api.opentyphoon.ai/v1/chat/completions', {
      model: TYPHOON_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are SpecBot, a professional smartphone expert. Answer questions using the provided technical context. Be accurate, objective, and highlight key hardware differences. All prices in the context are already in Thai Baht (THB) — use them as-is without any conversion. If information is missing, state it clearly.'
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${query}`
        }
      ],
      max_tokens: 4096,
      temperature: 0.1,
    }, {
      headers: { 
        'Authorization': `Bearer ${TYPHOON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data.choices[0].message.content || 'I could not generate a technical analysis at this time.'
  } catch (error: any) {
    if (error.response) {
      console.error('[typhoon] generateAnswer API Error:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error('[typhoon] generateAnswer error:', error.message)
    }
    return 'The AI analyst is currently offline.'
  }
}
