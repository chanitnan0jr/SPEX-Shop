import { Schema, model } from 'mongoose'

export interface ISpecHighlights {
  display?: string
  ram?: string
  storage?: string
  camera?: string
  battery?: string
  chipset?: string
  os?: string
}

export interface ISpecSource {
  site: string
  specphone_id?: number
  slug: string
}

// Plain interface — no Document extension to avoid Mongoose's .model() method conflict
export interface ISpec {
  brand: string
  model: string
  category: string
  price_thb: number | null
  source_url: string
  thumbnail_url: string | null
  source: ISpecSource
  highlights: ISpecHighlights
  spec_sections: Record<string, Record<string, string>>
  search_text: string
  embedding?: number[]
  scraped_at: Date
  updated_at: Date
}

const SpecSchema = new Schema<ISpec>(
  {
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true },
    category: { type: String, default: 'smartphone' },
    price_thb: { type: Number, default: null },
    source_url: { type: String, required: true },
    thumbnail_url: { type: String, default: null },
    source: {
      site: { type: String, required: true },
      specphone_id: { type: Number },
      slug: { type: String, required: true },
    },
    highlights: {
      display: String,
      ram: String,
      storage: String,
      camera: String,
      battery: String,
      chipset: String,
      os: String,
    },
    spec_sections: { type: Schema.Types.Mixed, default: {} },
    search_text: { type: String, default: '' },
    // embedding excluded from default projections — only retrieved for vector ops
    embedding: { type: [Number], select: false },
    scraped_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'specs',
    versionKey: false,
  }
)

// Compound index matching scraper upsert filter
SpecSchema.index({ 'source.site': 1, 'source.slug': 1 }, { unique: true })

export const SpecModel = model<ISpec>('Spec', SpecSchema)
