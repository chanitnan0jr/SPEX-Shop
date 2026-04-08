import { pipeline } from '@xenova/transformers'
import type { SpecResult } from './retriever'

let rerankerModel: any = null

async function getReranker() {
  if (!rerankerModel) {
    console.log('[reranker] loading ms-marco-MiniLM-L-12-v2...')
    rerankerModel = await pipeline('text-classification', 'Xenova/ms-marco-MiniLM-L-12-v2')
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

// Combine vector search score (0–1) with keyword/neural score
const VECTOR_WEIGHT = 0.5
const NEURAL_WEIGHT = 0.5

export async function rerank(query: string, docs: SpecResult[], topK: number): Promise<SpecResult[]> {
  if (docs.length === 0) return []

  try {
    const model = await getReranker()
    const queryTokens = tokenize(query)

    // Run reranking in parallel batches if needed, but for top 15-20 we can just map
    const scored = await Promise.all(
      docs.map(async (doc) => {
        const docText = `${doc.brand} ${doc.model} ${doc.search_text}`
        
        // ms-marco cross-encoder returns a score for [query, text] pair
        // and Xenova version maps it to LABEL_1 for relevance
        const result = await model(query, {
          text_pair: docText,
          topk: 1
        })
        
        const neuralScore = result[0]?.score || 0
        const kScore = keywordScore(queryTokens, doc)

        return {
          doc,
          // Hybrid: Vector Search (context) + Neural (semantics) + Keyword (Exact match boost)
          finalScore: 
            VECTOR_WEIGHT * (doc.score ?? 0) + 
            NEURAL_WEIGHT * neuralScore + 
            0.1 * kScore 
        }
      })
    )

    scored.sort((a, b) => b.finalScore - a.finalScore)

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
