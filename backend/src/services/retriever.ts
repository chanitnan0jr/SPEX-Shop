import { SpecModel, type ISpec } from '../models/Spec'

const VECTOR_INDEX = process.env.VECTOR_INDEX_NAME ?? 'vector_index'
const NUM_CANDIDATES = 100

export type SpecResult = Omit<ISpec, 'embedding'> & { score?: number }

export async function vectorSearch(
  queryVector: number[],
  topK: number = 10
): Promise<SpecResult[]> {
  const results = await SpecModel.aggregate<SpecResult>([
    {
      $vectorSearch: {
        index: VECTOR_INDEX,
        path: 'embedding',
        queryVector,
        numCandidates: NUM_CANDIDATES,
        limit: topK,
      },
    },
    {
      $project: {
        embedding: 0,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ])

  return results
}

// Direct brand query — used to supplement vector results when brand is underrepresented
export async function brandSearch(brand: string, topK: number): Promise<SpecResult[]> {
  return SpecModel.find({ brand: { $regex: brand, $options: 'i' } })
    .select('-embedding')
    .limit(topK)
    .lean() as Promise<SpecResult[]>
}

// RRF (Reciprocal Rank Fusion) merge — fuses multiple ranked result sets.
// Docs that rank highly across multiple query variations get a compounding bonus,
// which distributes results more fairly across brands than a simple "keep highest score".
export function mergeResults(resultSets: SpecResult[][], rrf_k = 60): SpecResult[] {
  const rrfScores = new Map<string, number>()
  const best = new Map<string, SpecResult>()

  for (const results of resultSets) {
    for (let rank = 0; rank < results.length; rank++) {
      const doc = results[rank]
      const slug = (doc.source as { slug: string }).slug
      rrfScores.set(slug, (rrfScores.get(slug) ?? 0) + 1.0 / (rrf_k + rank + 1))
      const existing = best.get(slug)
      if (!existing || (existing.score ?? 0) < (doc.score ?? 0)) {
        best.set(slug, doc)
      }
    }
  }

  return Array.from(rrfScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug, rrf]) => ({ ...best.get(slug)!, score: rrf }))
}
