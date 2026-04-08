import { embedText } from './embedder'
import { vectorSearch, brandSearch, mergeResults, type SpecResult } from './retriever'
import { rerank } from './reranker'
import { generateAnswer, expandQuery, detectIntent } from './typhoon'

import { RAG_CONFIG } from '../config/rag'

const TOP_K_FETCH = RAG_CONFIG.TOP_K_FETCH
const TOP_K_CONTEXT = RAG_CONFIG.TOP_K_CONTEXT

// Known brands + aliases (alias → canonical brand field value pattern)
const BRAND_KEYWORDS: Record<string, string> = {
  samsung: 'samsung',
  galaxy: 'samsung',
  apple: 'apple',
  iphone: 'apple',
  xiaomi: 'xiaomi',
  redmi: 'xiaomi',
  oppo: 'oppo',
  vivo: 'vivo',
  realme: 'realme',
  oneplus: 'oneplus',
  google: 'google',
  pixel: 'google',
  huawei: 'huawei',
  honor: 'honor',
  sony: 'sony',
  nokia: 'nokia',
  motorola: 'motorola',
  moto: 'motorola',
}

const BRAND_POSITIONING: Record<string, string> = {
  apple: 'แบรนด์พรีเมียม เน้นระบบนิเวศ (Ecosystem) และความเสถียร ใช้งานง่าย ราคามักจะอยู่ในกลุ่มสูง',
  samsung: 'แบรนด์ที่มีนวัตกรรมหลากหลาย มีตัวเลือกตั้งแต่รุ่นเริ่มต้นไปจนถึงรุ่นท็อปซีรีส์ S/Fold เน้นหน้าจอและกล้อง',
  xiaomi: 'เน้นความคุ้มค่า (Value for money) สเปคแรงในราคาที่เข้าถึงง่าย เหมาะกับผู้ที่ชอบปรับแต่ง',
  redmi: 'แบรนด์ย่อยของ Xiaomi เน้นความคุ้มค่าสูงสุดในราคาประหยัดและระดับกลาง',
  oppo: 'เน้นดีไซน์สวยงามและการถ่ายภาพเซลฟี่/กล้องหลังที่ปรับแต่งมาให้นุ่มนวล ชาร์จเร็ว',
  vivo: 'เน้นความบันเทิงและการถ่ายภาพเป็นหลัก โดยเฉพาะภาพพอร์ตเทรตและการออกแบบที่บางเบา',
  realme: 'แบรนด์สำหรับคนรุ่นใหม่ เน้นความเร็ว สเปคการเล่นเกม และเทคโนโลยีชาร์จเร็วในราคาจับต้องได้',
  oneplus: 'เน้นประสิทธิภาพความเร็ว (Fast & Smooth) และประสบการณ์การใช้งานที่ลื่นไหล',
  google: 'ประสบการณ์ Android แท้ๆ จากผู้พัฒนา เน้นซอฟต์แวร์ที่ฉลาดและกล้องจากการประมวลผล Computational Photography',
  sony: 'แบรนด์สำหรับผู้เชี่ยวชาญ เน้นการถ่ายภาพและวิดีโอแบบมืออาชีพ และจอภาพคุณภาพสูงระดับ 4K',
}

function getBrandPositioning(brand: string): string | null {
  const brandKey = BRAND_KEYWORDS[brand.toLowerCase()] || brand.toLowerCase()
  return BRAND_POSITIONING[brandKey] || null
}

// Cap results at maxPerBrand from any single brand so no one brand dominates
// on general queries. Preserves rank order within the cap.
function diversifyByBrand(docs: SpecResult[], maxPerBrand: number): SpecResult[] {
  const counts = new Map<string, number>()
  return docs.filter((doc) => {
    const brand = doc.brand.toLowerCase()
    const count = counts.get(brand) ?? 0
    if (count >= maxPerBrand) return false
    counts.set(brand, count + 1)
    return true
  })
}

function detectBrands(query: string): string[] {
  const lower = query.toLowerCase()
  const detected = new Set<string>()
  for (const [keyword, brand] of Object.entries(BRAND_KEYWORDS)) {
    if (lower.includes(keyword)) {
      detected.add(brand)
    }
  }
  return Array.from(detected)
}

const HIGHLIGHT_SECTION_PATTERN = /display|ram|storage|camera|battery|chipset|os/i
const SPEC_SECTIONS_CHAR_CAP = RAG_CONFIG.LIMITS.SPEC_SECTIONS_CHAR_CAP

function formatSpecSections(sections: Record<string, Record<string, string>>): string {
  const chunks: string[] = []
  let totalChars = 0

  for (const [sectionName, fields] of Object.entries(sections)) {
    if (HIGHLIGHT_SECTION_PATTERN.test(sectionName)) continue

    const header = `[หมวด: ${sectionName}]`
    const rows = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')
    const block = `${header}\n${rows}`

    if (totalChars + block.length > SPEC_SECTIONS_CHAR_CAP) {
      chunks.push('...(ข้อมูลเพิ่มเติมถูกตัดทอน)')
      break
    }
    chunks.push(block)
    totalChars += block.length
  }

  return chunks.join('\n')
}

function formatSpecAsContext(doc: SpecResult, index: number): string {
  const positioning = getBrandPositioning(doc.brand)
  
  const contentLines: string[] = [
    `Product: ${doc.brand} ${doc.model}`,
  ]

  if (doc.price_thb) {
    contentLines.push(`ราคา: ${doc.price_thb.toLocaleString('th-TH')} บาท`)
  }

  if (positioning) {
    contentLines.push(`แบรนด์ไฮไลท์: ${positioning}`)
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
    if (h[key]) contentLines.push(`${label}: ${h[key]}`)
  }

  const sectionsBlock = formatSpecSections(
    (doc.spec_sections ?? {}) as Record<string, Record<string, string>>
  )
  if (sectionsBlock) contentLines.push(sectionsBlock)

  contentLines.push(`Source: ${doc.source_url}`)

  return `<document index="${index + 1}" source="${doc.source_url}">\n${contentLines.join('\n')}\n</document>`
}

function assembleContext(docs: SpecResult[]): string {
  return docs.map((doc, i) => formatSpecAsContext(doc, i)).join('\n\n')
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
  // Step 1: Multi-query expansion + intent detection
  const [queryVariations, queryEmbedding, intent] = await Promise.all([
    expandQuery(query),
    embedText(query),
    detectIntent(query),
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

  // Step 3b: Brand supplement — if query targets specific brands but vector results
  // are underrepresented, inject direct brand docs before reranking
  const detectedBrands = detectBrands(query)
  let docsForRerank = merged

  if (detectedBrands.length > 0) {
    const brandDocsPromises = detectedBrands.map(brand => brandSearch(brand, 10))
    const brandDocsSets = await Promise.all(brandDocsPromises)
    const brandDocs = brandDocsSets.flat()

    const seen = new Set(merged.map(d => (d.source as { slug: string }).slug))
    const scores = merged.map(d => d.score ?? 0)
    const medianScore = scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0.5

    const newDocs = brandDocs
      .filter(d => !seen.has((d.source as { slug: string }).slug))
      .map(d => ({ ...d, score: medianScore }))

    // Bypass aggressive diversification if user is explicitly comparing multiple brands
    if (detectedBrands.length > 1) {
      // Comparison query: allow up to N docs per brand
      docsForRerank = diversifyByBrand([...merged, ...newDocs], RAG_CONFIG.BOOSTS.DIVERSIFY_COMPARE)
    } else {
      // Single brand query: allow up to N docs for that brand + others
      docsForRerank = [...merged, ...newDocs]
    }
  } else {
    // General query: cap each brand at N docs so no single brand dominates
    docsForRerank = diversifyByBrand(merged, RAG_CONFIG.BOOSTS.DIVERSIFY_DEFAULT)
  }

  // Step 4: Rerank
  const topDocs = await rerank(query, docsForRerank, TOP_K_CONTEXT, intent)

  if (RAG_CONFIG.DEBUG_MODE) {
    console.log(`[rag] Top ${topDocs.length} models selected. Top scores:`, 
      topDocs.slice(0, 3).map(d => `${d.model} (${d.score?.toFixed(2)})`)
    )
  }

  // Step 5: Assemble context and generate answer
  const context = assembleContext(topDocs)
  let answer: string
  try {
    answer = await generateAnswer(query, context)
  } catch (error) {
    if (RAG_CONFIG.DEBUG_MODE) console.error('[rag] LLM generation failed, using fallback.')
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
