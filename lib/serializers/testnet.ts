export function serializeDetail(row: any) {
  return {
    ...row,
    socials: {
      websiteUrl: row.website_url ?? null,
      githubUrl: row.github_url ?? null,
      twitterUrl: row.twitter_url ?? null,
      discordUrl: row.discord_url ?? null
    },
    discordRoles: Array.isArray(row.discord_roles) ? row.discord_roles : [],
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null
  };
}
