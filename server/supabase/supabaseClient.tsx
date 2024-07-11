import { createClient } from '@supabase/supabase-js'
import type { Context } from 'hono'

export const supabase = (c: Context) =>
  createClient(c.env?.SUPABASE_URL, c.env?.SUPABASE_API_KEY)
