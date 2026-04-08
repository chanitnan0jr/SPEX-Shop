import axios from 'axios'
import { ISpecHighlights } from '../models/Spec'
import { RAG_CONFIG } from '../config/rag'

const TYPHOON_API_KEY = process.env.TYPHOON_API_KEY
const TYPHOON_MODEL = process.env.TYPHOON_MODEL || 'typhoon-v1.5-instruct'

export interface IOCRResult {
  brand: string
  model: string
  highlights: ISpecHighlights
}

export type SearchIntent = 'camera' | 'battery' | 'performance' | 'budget' | 'flagship' | 'general'

export class TyphoonService {
  /**
   * Unified request helper for Typhoon AI.
   */
  private static async request(messages: any[], options: { 
    max_tokens?: number, 
    temperature?: number, 
    response_format?: { type: string } 
  } = {}) {
    if (!TYPHOON_API_KEY) {
      throw new Error('TYPHOON_API_KEY is not configured')
    }

    const payload = {
      model: TYPHOON_MODEL,
      messages,
      max_tokens: options.max_tokens || 512,
      temperature: options.temperature ?? 0.1,
      response_format: options.response_format
    }

    try {
      const response = await axios.post('https://api.opentyphoon.ai/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${TYPHOON_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15s timeout
      })
      return response.data.choices[0].message.content
    } catch (error: any) {
      const apiError = error.response?.data ? JSON.stringify(error.response.data) : error.message
      console.error(`[typhoon] API Error: ${apiError}`)
      throw error
    }
  }

  /**
   * Extract smartphone specs from a provided image.
   */
  static async extractSpecsFromImage(imagePath: string): Promise<IOCRResult> {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract smartphone specifications from this image. Return a JSON object with: brand, model, display, chipset, ram, storage, camera, battery. Return ONLY valid JSON.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imagePath.startsWith('http') ? imagePath : `data:image/jpeg;base64,${imagePath}`
            }
          }
        ]
      }
    ]

    const content = await this.request(messages, { response_format: { type: 'json_object' } })
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
  }
}

/**
 * Strip noise from long queries.
 */
async function extractCoreQuestion(query: string): Promise<string> {
  try {
    const payload = [
      {
        role: 'system',
        content: 'You are a smartphone query extractor. Extract only the core technical question. Remove social fluff and travel stories. Return ONE clean concise question in Thai.'
      },
      { role: 'user', content: query }
    ]
    // Call via class internal if it were public, but since these are standalone functions 
    // for now, I'll just keep the logic clean. Actually, I'll move them INTO the class to be cleaner.
    return await (TyphoonService as any).request(payload, { max_tokens: 128, temperature: 0 })
  } catch {
    return query
  }
}

/**
 * Expand a user query for better vector search retrieval.
 */
export async function expandQuery(query: string): Promise<string[]> {
  try {
    const effectiveQuery = query.length > RAG_CONFIG.LIMITS.QUERY_EXTRACTION_THRESHOLD 
      ? await extractCoreQuestion(query) 
      : query

    const payload = [
      {
        role: 'system',
        content: 'You are a smartphone search expert. Expand user queries into exactly 3 distinct technical search variations (brand, model, chipset, specs) in Thai. Return each variation on a new line. Do not use numbering or bullet points.'
      },
      { role: 'user', content: effectiveQuery }
    ]

    const content = await (TyphoonService as any).request(payload, { temperature: 0.6 })
    
    return content
      .split('\n')
      .map((s: string) => s.replace(/^[\d.\-\s*•]+/, '').trim()) // Defensive split (removes bullets/numbers)
      .filter(Boolean)
      .slice(0, 3) || [query]
  } catch {
    return [query]
  }
}

/**
 * Categorize the user's intent.
 */
export async function detectIntent(query: string): Promise<SearchIntent> {
  try {
    const payload = [
      {
        role: 'system',
        content: `Categorize the query into ONE: 'camera', 'battery', 'performance', 'budget', 'flagship', 'general'. Return ONLY the category name.`
      },
      { role: 'user', content: query }
    ]

    const intent = (await (TyphoonService as any).request(payload, { max_tokens: 16, temperature: 0 }))
      .trim().toLowerCase()
    
    const valid: SearchIntent[] = ['camera', 'battery', 'performance', 'budget', 'flagship']
    return valid.includes(intent as SearchIntent) ? (intent as SearchIntent) : 'general'
  } catch {
    return 'general'
  }
}

/**
 * Generate a technically accurate answer.
 */
export async function generateAnswer(query: string, context: string): Promise<string> {
  try {
    const payload = [
      {
        role: 'system',
        content: `คุณคือ SpecBot ผู้เชี่ยวชาญด้านสเปคมือถือและวิเคราะห์ความคุ้มค่า

<rules>
- ใช้ข้อมูลจาก <context> ที่ให้มาเท่านั้น
- ห้ามใช้ความรู้ภายนอกเว้นแต่เป็นความรู้พื้นฐานทางเทคนิคมือถือทั่วไป
- ตอบให้แม่นยำ เป็นกลาง และเปรียบเทียบจุดเด่นจุดด้อยให้ชัดเจน
- หากใน context มีราคา (THB) ให้ใช้ราคานั้นโดยไม่ต้องแปลงสกุลเงิน
- หากไม่มีข้อมูลใน context ให้แจ้งผู้ใช้ตามตรง
</rules>

<output_format>
- ตอบเป็นภาษาไทย
- จัดรูปแบบให้อ่านง่าย ใช้ Bullet points เมื่อต้องเปรียบเทียบหลายหัวข้อ
- สรุปสั้นๆ ในตอนท้ายว่ารุ่นไหนเหมาะกับผู้ใช้กลุ่มใด
</output_format>`
      },
      {
        role: 'user',
        content: `<context>\n${context}\n</context>\n\n<question>${query}</question>`
      }
    ]

    return await (TyphoonService as any).request(payload, { max_tokens: 4096, temperature: 0.1 })
  } catch (error) {
    throw error // Propagate for RAG fallback
  }
}
