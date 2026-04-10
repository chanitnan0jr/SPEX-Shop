import axios from 'axios'

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  // Ensure absolute URL (must start with http:// or https://)
  if (!url.startsWith('http')) {
    return `https://${url}`
  }
  return url
}
const baseURL = `${getBaseUrl().replace(/\/$/, '')}/api`

const api = axios.create({
  baseURL,
  timeout: 45000, // 45s timeout
})

// Add debugging interceptors to track "Why it's like this" in the browser
api.interceptors.request.use((config) => {
  console.log(`[api] Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[api] Error ${error.response.status}:`, error.response.data)
    } else if (error.request) {
      console.error('[api] No response received:', error.request)
    } else {
      console.error('[api] Request Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export interface SpecHighlights {
  display?: string
  ram?: string
  storage?: string
  camera?: string
  battery?: string
  chipset?: string
  os?: string
}

export interface SpecSource {
  site: string
  specphone_id?: number
  slug: string
}

export interface Spec {
  _id?: string
  brand: string
  model: string
  category: string
  price_thb: number | null
  source_url: string
  thumbnail_url: string | null
  source: SpecSource
  highlights: SpecHighlights
  spec_sections: Record<string, Record<string, string>>
  search_text: string
  scraped_at: string
  updated_at: string
}

export interface SearchSource {
  brand: string
  model: string
  source_url: string
  thumbnail_url: string | null
  price_thb: number | null
  score?: number
}

export interface SearchResponse {
  answer: string
  sources: SearchSource[]
}

export function isDatasetSourceUrl(url: string): boolean {
  return url.startsWith('dataset://')
}

export interface ChatHistoryMessage {
  _id: string
  sessionId: string
  query: string
  answer: string
  sources: SearchSource[]
  createdAt: string
}

export const searchApi = async ({ query, sessionId }: { query: string; sessionId?: string }): Promise<SearchResponse> => {
  const { data } = await api.post<SearchResponse>('/search', { query, sessionId })
  return data
}

export const getChatHistoryApi = async (sessionId: string): Promise<ChatHistoryMessage[]> => {
  const { data } = await api.get<ChatHistoryMessage[]>(`/chat/${sessionId}`)
  return data
}

export const deleteChatHistoryApi = async (sessionId: string): Promise<void> => {
  await api.delete(`/chat/${sessionId}`)
}

export const getModelsApi = async (): Promise<string[]> => {
  const { data } = await api.get<{ count: number; models: string[] }>('/models')
  return data.models
}

export const getSpecsByBrandApi = async (brand: string): Promise<Spec[]> => {
  const { data } = await api.get<{ brand: string; count: number; specs: Spec[] }>(`/specs/${brand}`)
  return data.specs
}

export const compareSpecsApi = async (models: string[]): Promise<Spec[]> => {
  const { data } = await api.get<{ count: number; specs: Spec[] }>('/compare', {
    params: { models: models.join(',') }
  })
  return data.specs
}

export const getOfficialImageApi = async (brand: string, model: string): Promise<string> => {
  try {
    const { data } = await api.get<{ url: string }>('/images/official', {
      params: { brand, model }
    })
    return data.url
  } catch (error) {
    throw error
  }
}

export const submitFeedbackApi = async (params: {
  sessionId: string;
  messageId: string;
  query: string;
  answer: string;
  rating: number;
}): Promise<any> => {
  const { data } = await api.post('/feedback', params)
  return data
}
