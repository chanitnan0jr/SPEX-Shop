import { embedText } from './embedder'
import { vectorSearch, mergeResults, type SpecResult } from './retriever'
import { rerank } from './reranker'
import { generateAnswer, expandQuery } from './typhoon'

const TOP_K_FETCH = 15  // docs retrieved per query variation
const TOP_K_CONTEXT = 5 // docs passed to LLM after reranking

function formatSpecAsContext(doc: SpecResult, index: number): string {
  const lines: string[] = [
    `[${index + 1}] ${doc.brand} ${doc.model}`,
  ]

  if (doc.price_thb) {
    lines.push(`ราคา: ${doc.price_thb.toLocaleString('th-TH')} บาท`)
  }

  const h = doc.highlights as Record<string, string>
  const highlightLabels: Record<string, string> = {
    display: 'หน้าจอ',
    ram: 'RAM',
    storage: 'ความจุ',
    camera: 'กล้อง',
    battery: 'แบตเตอรี่',
    chipset: 'ชิปเซ็ต',
    os: 'ระบบปฏิบัติการ',
  }

  for (const [key, label] of Object.entries(highlightLabels)) {
    if (h[key]) lines.push(`${label}: ${h[key]}`)
  }

  lines.push(`ข้อมูลเพิ่มเติม: ${doc.source_url}`)

  return lines.join('\n')
}

function assembleContext(docs: SpecResult[]): string {
  return docs.map((doc, i) => formatSpecAsContext(doc, i)).join('\n\n---\n\n')
}

export interface RAGResult {
  answer: string
  sources: Array<{
    brand: string
    model: string
    source_url: string
    thumbnail_url: string | null
    price_thb: number | null
    score?: number
  }>
}

function buildFallbackAnswer(query: string, docs: SpecResult[]): string {
  if (docs.length === 0) {
    return `ไม่พบข้อมูลที่เกี่ยวข้องกับคำถาม "${query}" ในฐานข้อมูล`
  }

  const lines = [
    `สรุปจากผลค้นหาในฐานข้อมูลสำหรับคำถาม "${query}":`,
    ...docs.map((doc, index) => {
      const parts = [
        `${index + 1}. ${doc.brand} ${doc.model}`,
        doc.price_thb ? `ราคา ${doc.price_thb.toLocaleString('th-TH')} บาท` : null,
        (doc.highlights as Record<string, string>).battery ? `แบตเตอรี่ ${(doc.highlights as Record<string, string>).battery}` : null,
        (doc.highlights as Record<string, string>).display ? `หน้าจอ ${(doc.highlights as Record<string, string>).display}` : null,
        (doc.highlights as Record<string, string>).chipset ? `ชิปเซ็ต ${(doc.highlights as Record<string, string>).chipset}` : null,
      ].filter(Boolean)

      return parts.join(' | ')
    }),
    'หมายเหตุ: ระบบตอบแบบ fallback เพราะบริการสร้างคำตอบภายนอกไม่พร้อมใช้งานชั่วคราว',
  ]

  return lines.join('\n')
}

export async function runRAG(query: string): Promise<RAGResult> {
  // Step 1: Multi-query expansion
  const [queryVariations, queryEmbedding] = await Promise.all([
    expandQuery(query),
    embedText(query),
  ])

  // Step 2: Embed all query variations + vector search in parallel
  const variationEmbeddings = await Promise.all(
    queryVariations.map((q) => embedText(q))
  )

  const allEmbeddings = [queryEmbedding, ...variationEmbeddings]
  const resultSets = await Promise.all(
    allEmbeddings.map((vec) => vectorSearch(vec, TOP_K_FETCH))
  )

  // Step 3: Merge deduplicated results
  const merged = mergeResults(resultSets)

  // Step 4: Rerank
  const topDocs = await rerank(query, merged, TOP_K_CONTEXT)

  // Step 5: Assemble context and generate answer
  const context = assembleContext(topDocs)
  let answer: string
  try {
    answer = await generateAnswer(query, context)
  } catch (error) {
    console.error('[rag] generateAnswer failed, falling back to retrieval-only response:', error)
    answer = buildFallbackAnswer(query, topDocs)
  }

  return {
    answer,
    sources: topDocs.map((doc) => ({
      brand: doc.brand,
      model: doc.model,
      source_url: doc.source_url,
      thumbnail_url: doc.thumbnail_url,
      price_thb: doc.price_thb,
      score: doc.score,
    })),
  }
}
