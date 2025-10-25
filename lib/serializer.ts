// Serializer utility to remove null/empty values from API responses
// Contract-compliant serializers for TestnetLite and TestnetFull

export function serializeTestnetLite(data: any): any {
  const serialized: any = {}
  
  // Required fields
  serialized.slug = data.slug
  serialized.name = data.name
  serialized.status = data.status
  serialized.kycRequired = data.kycRequired
  serialized.tasksCount = data.tasksCount
  serialized.updatedAt = data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt
  serialized.hasDashboard = data.hasDashboard
  
  // Optional fields - only include if not null/empty
  if (data.logoUrl) serialized.logoUrl = data.logoUrl
  if (data.network) serialized.network = data.network
  if (data.difficulty) serialized.difficulty = data.difficulty
  if (data.estTimeMinutes) serialized.estTimeMinutes = data.estTimeMinutes
  if (data.rewardType) serialized.rewardType = data.rewardType
  if (data.rewardNote) serialized.rewardNote = data.rewardNote
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) serialized.tags = data.tags
  if (data.totalRaisedUSD) serialized.totalRaisedUSD = Number(data.totalRaisedUSD)
  
  // Socials object
  const socials: any = {}
  if (data.twitterUrl) socials.twitter = data.twitterUrl
  if (data.discordUrl) socials.discord = data.discordUrl
  
  if (Object.keys(socials).length > 0) {
    serialized.socials = socials
  } else {
    serialized.socials = {}
  }
  
  return serialized
}

export function serializeTestnetFull(data: any): any {
  const serialized = serializeTestnetLite(data)
  
  // Additional fields for full testnet
  if (data.shortDescription) serialized.shortDescription = data.shortDescription
  if (data.highlights && Array.isArray(data.highlights) && data.highlights.length > 0) {
    serialized.highlights = data.highlights
  }
  if (data.prerequisites && Array.isArray(data.prerequisites) && data.prerequisites.length > 0) {
    serialized.prerequisites = data.prerequisites
  }
  if (data.gettingStarted && Array.isArray(data.gettingStarted) && data.gettingStarted.length > 0) {
    serialized.gettingStarted = data.gettingStarted
  }
  if (data.websiteUrl) serialized.websiteUrl = data.websiteUrl
  if (data.githubUrl) serialized.githubUrl = data.githubUrl
  if (data.twitterUrl) serialized.twitterUrl = data.twitterUrl
  if (data.discordUrl) serialized.discordUrl = data.discordUrl
  if (data.dashboardUrl) serialized.dashboardUrl = data.dashboardUrl
  if (data.discordRoles && Array.isArray(data.discordRoles) && data.discordRoles.length > 0) {
    serialized.discordRoles = data.discordRoles
  }
  
  return serialized
}

// Generic serializer for removing null/empty values
export function removeNullValues(obj: any): any {
  if (obj === null || obj === undefined) return undefined
  if (Array.isArray(obj)) {
    return obj.map(removeNullValues).filter(item => item !== undefined)
  }
  if (typeof obj === 'object') {
    const cleaned: any = {}
    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = removeNullValues(value)
      if (cleanedValue !== undefined && cleanedValue !== '') {
        cleaned[key] = cleanedValue
      }
    })
    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }
  return obj
}
