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

// Merge results from multiple queries, deduplicating by slug and keeping highest score
export function mergeResults(resultSets: SpecResult[][]): SpecResult[] {
  const seen = new Map<string, SpecResult>()

  for (const results of resultSets) {
    for (const doc of results) {
      const slug = (doc.source as { slug: string }).slug
      const existing = seen.get(slug)
      const score = doc.score ?? 0

      if (!existing || (existing.score ?? 0) < score) {
        seen.set(slug, doc)
      }
    }
  }

  return Array.from(seen.values()).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}
