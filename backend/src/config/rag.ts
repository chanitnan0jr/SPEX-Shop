/**
 * RAG Configuration & Tuning Parameters
 */
export const RAG_CONFIG = {
  // Retrieval stages
  TOP_K_FETCH: 15,          // Docs per query variation
  TOP_K_CONTEXT: 5,         // Docs passed to LLM
  
  // Weights (Should sum to ~1.0 for primary scoring)
  WEIGHTS: {
    VECTOR: 0.5,
    NEURAL: 0.5,
    KEYWORD: 0.1,           // Normalized exact match bonus
  },
  
  // Boosting & Intent
  BOOSTS: {
    INTENT_PRICE: 0.15,     // Boost for budget/flagship match
    INTENT_FEATURE: 0.1,    // Boost for camera/battery match
    DIVERSIFY_DEFAULT: 3,   // Max docs per brand normally
    DIVERSIFY_COMPARE: 5,   // Max docs per brand during comparison
  },
  
  // Context Limits
  LIMITS: {
    SPEC_SECTIONS_CHAR_CAP: 800,
    QUERY_EXTRACTION_THRESHOLD: 100, // Query length to trigger noise stripping
  },

  DEBUG_MODE: process.env.NODE_ENV !== 'production',
}
