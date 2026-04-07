import type { FeatureExtractionPipeline } from '@xenova/transformers'

// Model name must use the Xenova-converted version of the same multilingual model the scraper uses
const MODEL_NAME =
  process.env.HF_MODEL?.replace(
    'sentence-transformers/',
    'Xenova/'
  ) ?? 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'

let _pipeline: FeatureExtractionPipeline | null = null

async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (_pipeline) return _pipeline

  // Lazy import so the heavy module doesn't block server startup
  const { pipeline, env } = await import('@xenova/transformers')
  env.cacheDir = './.cache/transformers'

  console.log(`[embedder] loading model ${MODEL_NAME} (first request may be slow)`)
  _pipeline = await pipeline('feature-extraction', MODEL_NAME)
  console.log('[embedder] model ready')

  return _pipeline
}

export async function embedText(text: string): Promise<number[]> {
  const pipe = await getPipeline()
  const output = await pipe(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}
