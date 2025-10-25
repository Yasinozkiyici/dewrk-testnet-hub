import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { testnetListResponseSchema, testnetDetailResponseSchema } from '@/lib/zod'

// Contract tests for real API endpoints
describe('API Contract Tests - Real Endpoints', () => {
  const baseUrl = 'http://localhost:4000'
  
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  describe('GET /api/testnets', () => {
    it('should return correct response structure', async () => {
      const response = await fetch(`${baseUrl}/api/testnets`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      
      // Validate with Zod schema
      const validated = testnetListResponseSchema.parse(data)
      
      expect(validated).toHaveProperty('items')
      expect(validated).toHaveProperty('page')
      expect(validated).toHaveProperty('pageSize')
      expect(validated).toHaveProperty('total')
      
      expect(Array.isArray(validated.items)).toBe(true)
      expect(typeof validated.page).toBe('number')
      expect(typeof validated.pageSize).toBe('number')
      expect(typeof validated.total).toBe('number')
    })

    it('should handle pagination parameters', async () => {
      const response = await fetch(`${baseUrl}/api/testnets?page=1&pageSize=5`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      const validated = testnetListResponseSchema.parse(data)
      
      expect(validated.page).toBe(1)
      expect(validated.pageSize).toBe(5)
      expect(validated.items.length).toBeLessThanOrEqual(5)
    })

    it.skip('should handle filter parameters', async () => {
      const response = await fetch(`${baseUrl}/api/testnets?q=aurora`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      const validated = testnetListResponseSchema.parse(data)
      
      expect(Array.isArray(validated.items)).toBe(true)
      // Items should match filter criteria
      validated.items.forEach(item => {
        if (item.name) {
          expect(item.name.toLowerCase()).toContain('aurora')
        }
      })
    })

    it('should remove null values from response', async () => {
      const response = await fetch(`${baseUrl}/api/testnets`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      const validated = testnetListResponseSchema.parse(data)
      
      // Check that items don't have null values
      validated.items.forEach(item => {
        Object.values(item).forEach(value => {
          expect(value).not.toBeNull()
        })
      })
    })

    it('should have correct socials structure', async () => {
      const response = await fetch(`${baseUrl}/api/testnets`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      const validated = testnetListResponseSchema.parse(data)
      
      validated.items.forEach(item => {
        if (item.socials) {
          expect(typeof item.socials).toBe('object')
          // Socials should only contain twitter/discord
          Object.keys(item.socials).forEach(key => {
            expect(['twitter', 'discord']).toContain(key)
          })
        }
      })
    })
  })

  describe('GET /api/testnets/:slug', () => {
    let testSlug: string

    beforeAll(async () => {
      // Get a test slug from the list
      const response = await fetch(`${baseUrl}/api/testnets`)
      const data = await response.json()
      const validated = testnetListResponseSchema.parse(data)
      
      if (validated.items.length > 0) {
        testSlug = validated.items[0].slug
      } else {
        throw new Error('No testnets available for testing')
      }
    })

    it('should return correct response structure', async () => {
      const response = await fetch(`${baseUrl}/api/testnets/${testSlug}`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      
      // Validate with Zod schema
      const validated = testnetDetailResponseSchema.parse(data)
      
      expect(validated).toHaveProperty('slug')
      expect(validated).toHaveProperty('name')
      expect(validated).toHaveProperty('status')
      expect(validated).toHaveProperty('kycRequired')
      expect(validated).toHaveProperty('tasksCount')
      expect(validated).toHaveProperty('updatedAt')
      expect(validated).toHaveProperty('hasDashboard')
      expect(validated).toHaveProperty('socials')
      expect(validated).toHaveProperty('discordRoles')
      expect(validated).toHaveProperty('tasks')

      expect(typeof validated.slug).toBe('string')
      expect(typeof validated.name).toBe('string')
      expect(typeof validated.status).toBe('string')
      expect(typeof validated.kycRequired).toBe('boolean')
      expect(typeof validated.tasksCount).toBe('number')
      expect(typeof validated.updatedAt).toBe('string')
      expect(typeof validated.hasDashboard).toBe('boolean')
      expect(typeof validated.socials).toBe('object')
      expect(Array.isArray(validated.discordRoles)).toBe(true)
      expect(Array.isArray(validated.tasks)).toBe(true)
    })

    it('should handle 404 responses', async () => {
      const response = await fetch(`${baseUrl}/api/testnets/non-existent-slug`)
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('NotFound')
    })

    it('should remove null values from response', async () => {
      const response = await fetch(`${baseUrl}/api/testnets/${testSlug}`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      const validated = testnetDetailResponseSchema.parse(data)
      
      // Check that response doesn't have null values
      Object.values(validated).forEach(value => {
        expect(value).not.toBeNull()
      })
    })

    it('should have correct socials structure', async () => {
      const response = await fetch(`${baseUrl}/api/testnets/${testSlug}`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      const validated = testnetDetailResponseSchema.parse(data)
      
      expect(typeof validated.socials).toBe('object')
      // Socials should only contain twitter/discord
      Object.keys(validated.socials).forEach(key => {
        expect(['twitter', 'discord']).toContain(key)
      })

      expect(Array.isArray(validated.discordRoles)).toBe(true)
      expect(Array.isArray(validated.tasks)).toBe(true)
    })
  })

  describe('Cache Headers', () => {
    it('should set correct cache tags for testnets list', async () => {
      const response = await fetch(`${baseUrl}/api/testnets`)
      expect(response.status).toBe(200)
      
      const cacheTags = response.headers.get('Cache-Tags')
      expect(cacheTags).toBe('testnets')
    })

    it('should set correct cache tags for individual testnet', async () => {
      const response = await fetch(`${baseUrl}/api/testnets`)
      const data = await response.json()
      const validated = testnetListResponseSchema.parse(data)
      
      if (validated.items.length > 0) {
        const testSlug = validated.items[0].slug
        const detailResponse = await fetch(`${baseUrl}/api/testnets/${testSlug}`)
        expect(detailResponse.status).toBe(200)
        
        const cacheTags = detailResponse.headers.get('Cache-Tags')
        expect(cacheTags).toBe(`testnets,testnet:${testSlug}`)
      }
    })
  })
})
