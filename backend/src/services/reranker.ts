import { pipeline } from '@xenova/transformers'
import type { SpecResult } from './retriever'

let rerankerModel: any = null

async function getReranker() {
  if (!rerankerModel) {
    console.log('[reranker] loading bge-reranker-v2-m3...')
    rerankerModel = await pipeline('text-classification', 'Xenova/bge-reranker-base')
  }
  return rerankerModel
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[\s,.\-|:\/()[\]]+/)
      .filter((t) => t.length > 1)
  )
}

function keywordScore(queryTokens: Set<string>, document: SpecResult): number {
  const docText = [
    document.brand,
    document.model,
    document.search_text,
  ]
    .filter(Boolean)
    .join(' ')

  const docTokens = tokenize(docText)
  let matches = 0

  for (const token of queryTokens) {
    if (docTokens.has(token)) matches++
  }

  return queryTokens.size > 0 ? matches / queryTokens.size : 0
}

import { RAG_CONFIG } from '../config/rag'

// Combine vector search score (0–1) with keyword/neural score
const VECTOR_WEIGHT = RAG_CONFIG.WEIGHTS.VECTOR
const NEURAL_WEIGHT = RAG_CONFIG.WEIGHTS.NEURAL

export async function rerank(
  query: string, 
  docs: SpecResult[], 
  topK: number,
  intent: string = 'general'
): Promise<SpecResult[]> {
  if (docs.length === 0) return []

  try {
    const model = await getReranker()
    const queryTokens = tokenize(query)

    // Prepare batch for inference: list of text pairs [query, docText]
    const batch = docs.map(doc => {
      return { 
        text: query, 
        text_pair: `${doc.brand} ${doc.model} ${doc.search_text}` 
      }
    })

    // Run batch inference — much more efficient than individual calls
    console.log(`[reranker] Running batch rerank for ${docs.length} docs...`)
    const results = await model(batch)
    
    // Process results and combine with keyword scoring + intent boosts
    const scored = docs.map((doc, i) => {
      const neuralScore = results[i]?.score || 0
      const kScore = keywordScore(queryTokens, doc)
      const docText = `${doc.brand} ${doc.model} ${doc.search_text}`.toLowerCase()

      // Intent-based boosting
      let boost = 0
      if (intent === 'budget' && doc.price_thb && doc.price_thb < 15000) boost += RAG_CONFIG.BOOSTS.INTENT_PRICE
      if (intent === 'flagship' && doc.price_thb && doc.price_thb > 30000) boost += RAG_CONFIG.BOOSTS.INTENT_PRICE
      
      const h = doc.highlights as Record<string, string>
      if (intent === 'camera' && (h.camera || docText.includes('camera') || docText.includes('megapixel'))) boost += RAG_CONFIG.BOOSTS.INTENT_FEATURE
      if (intent === 'battery' && (h.battery || docText.includes('mah') || docText.includes('charging'))) boost += RAG_CONFIG.BOOSTS.INTENT_FEATURE

      return {
        doc,
        finalScore: 
          VECTOR_WEIGHT * (doc.score ?? 0) + 
          NEURAL_WEIGHT * neuralScore + 
          RAG_CONFIG.WEIGHTS.KEYWORD * kScore +
          boost
      }
    })

    // Sort by finalScore (Primary) and document score (Secondary tie-breaker)
    scored.sort((a, b) => {
      const diff = b.finalScore - a.finalScore
      if (Math.abs(diff) < 0.0001) return (b.doc.score ?? 0) - (a.doc.score ?? 0)
      return diff
    })

    return scored.slice(0, topK).map(({ doc, finalScore }) => ({
      ...doc,
      score: finalScore,
    }))
  } catch (err: any) {
    console.error('[reranker] cross-encoder failed, falling back to keyword logic:', err.message)
    const queryTokens = tokenize(query)
    const scored = docs.map((doc) => ({
      doc,
      finalScore: 0.6 * (doc.score ?? 0) + 0.4 * keywordScore(queryTokens, doc),
    }))
    scored.sort((a, b) => b.finalScore - a.finalScore)
    return scored.slice(0, topK).map(({ doc, finalScore }) => ({ ...doc, score: finalScore }))
  }
}
