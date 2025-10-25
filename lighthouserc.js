/**
 * UI-FREEZE: Lighthouse CI Configuration
 * 
 * CLS, LCP, bundle size monitoring
 * Performance budget enforcement
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4000',
        'http://localhost:4000/testnets',
        'http://localhost:4000/admin'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      // UI-FREEZE: Performance budgets
      assertions: {
        // Core Web Vitals
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.02 }], // CLS ≤ 0.02
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // LCP ≤ 2.5s
        'first-input-delay': ['error', { maxNumericValue: 100 }], // FID ≤ 100ms
        
        // Performance Score
        'performance': ['error', { minScore: 0.9 }], // Performance score ≥ 90
        
        // Accessibility
        'accessibility': ['error', { minScore: 0.95 }], // Accessibility score ≥ 95
        
        // Best Practices
        'best-practices': ['error', { minScore: 0.9 }], // Best practices ≥ 90
        
        // SEO
        'seo': ['error', { minScore: 0.9 }], // SEO score ≥ 90
        
        // Bundle size monitoring
        'resource-summary': ['error', {
          details: {
            items: [
              {
                resourceType: 'script',
                budget: 300000 // 300KB JS budget
              },
              {
                resourceType: 'stylesheet',
                budget: 100000 // 100KB CSS budget
              },
              {
                resourceType: 'image',
                budget: 500000 // 500KB image budget
              }
            ]
          }
        }],
        
        // Specific metrics for UI-FREEZE
        'unused-javascript': ['warn', { maxLength: 0 }], // No unused JS
        'unused-css-rules': ['warn', { maxLength: 0 }], // No unused CSS
        'render-blocking-resources': ['error', { maxLength: 0 }], // No render-blocking resources
        
        // Font optimization
        'font-display': ['error', { maxLength: 0 }], // All fonts have font-display
        'preload-lcp-image': ['warn', { maxLength: 1 }], // LCP image preloaded
        
        // Image optimization
        'modern-image-formats': ['warn', { maxLength: 0 }], // Use modern image formats
        'optimized-images': ['warn', { maxLength: 0 }], // Images optimized
        
        // Third-party resources
        'third-party-summary': ['warn', { maxLength: 3 }], // Limit third-party resources
        
        // Network requests
        'total-byte-weight': ['error', { maxNumericValue: 1000000 }], // Total page weight ≤ 1MB
        'num-requests': ['warn', { maxNumericValue: 50 }], // Max 50 requests
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
