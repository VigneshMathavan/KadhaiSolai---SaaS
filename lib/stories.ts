import { supabase } from './supabase'

export interface Story {
  id: string
  fingerprint: string
  author_name: string
  title: string
  body: string
  genre: string
  word_count: number
  likes_count: number
  comments_count: number
  ai_assisted: boolean
  published: boolean
  created_at: string
}

export interface StoryComment {
  id: string
  story_id: string
  fingerprint: string
  author_name: string
  body: string
  created_at: string
}

export function getFingerprint(): string {
  if (typeof window === 'undefined') return ''
  let fp = localStorage.getItem('ks_fp')
  if (!fp) { fp = crypto.randomUUID(); localStorage.setItem('ks_fp', fp) }
  return fp
}

export async function fetchStories(opts?: {
  genre?: string
  sort?: 'newest' | 'popular'
  limit?: number
  offset?: number
}): Promise<Story[]> {
  const { genre = 'All', sort = 'newest', limit = 20, offset = 0 } = opts || {}
  let q = supabase.from('stories').select('*').eq('published', true)
  if (genre !== 'All') q = q.eq('genre', genre)
  q = q.order(sort === 'popular' ? 'likes_count' : 'created_at', { ascending: false })
  q = q.range(offset, offset + limit - 1)
  const { data } = await q
  return (data || []) as Story[]
}

export async function fetchStory(id: string): Promise<Story | null> {
  const { data } = await supabase.from('stories').select('*').eq('id', id).single()
  return data as Story | null
}

export async function fetchComments(storyId: string): Promise<StoryComment[]> {
  const { data } = await supabase.from('story_comments')
    .select('*').eq('story_id', storyId).order('created_at', { ascending: true })
  return (data || []) as StoryComment[]
}

export async function hasLiked(storyId: string, fingerprint: string): Promise<boolean> {
  if (!fingerprint) return false
  const { data } = await supabase.from('story_likes')
    .select('story_id').eq('story_id', storyId).eq('fingerprint', fingerprint).maybeSingle()
  return !!data
}

export async function publishStory(payload: {
  fingerprint: string
  author_name: string
  title: string
  body: string
  genre: string
  ai_assisted: boolean
}): Promise<Story> {
  const { data, error } = await supabase
    .from('stories').insert({ ...payload, published: true }).select().single()
  if (error) throw error
  return data as Story
}

export async function likeStory(storyId: string, fingerprint: string): Promise<void> {
  await supabase.from('story_likes').insert({ story_id: storyId, fingerprint })
}

export async function unlikeStory(storyId: string, fingerprint: string): Promise<void> {
  await supabase.from('story_likes')
    .delete().eq('story_id', storyId).eq('fingerprint', fingerprint)
}

export async function addComment(
  storyId: string, fingerprint: string, authorName: string, body: string
): Promise<StoryComment> {
  const { data, error } = await supabase.from('story_comments')
    .insert({ story_id: storyId, fingerprint, author_name: authorName || 'Anonymous', body })
    .select().single()
  if (error) throw error
  return data as StoryComment
}

export async function deleteStory(id: string): Promise<void> {
  await supabase.from('stories').delete().eq('id', id)
}

export async function fetchMyStories(fingerprint: string): Promise<Story[]> {
  if (!fingerprint) return []
  const { data } = await supabase.from('stories').select('*')
    .eq('fingerprint', fingerprint).order('created_at', { ascending: false })
  return (data || []) as Story[]
}
