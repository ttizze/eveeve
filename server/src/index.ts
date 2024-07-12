import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import translate from './routes/translate'

import type { Context } from 'hono'
const app = new Hono()

app.use('*', cors())

app.get('/', c => c.text('Hello World!!'))
app.route('/api/translate', translate)

app.post('/api/save-article', async (c: Context) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)
  const { url, title, content } = await c.req.json()

  const { data, error } = await supabase
    .from('articles')
    .upsert({ url, title, content }, { onConflict: 'url' })
    .select()
    .single()

  if (error) {
    console.error('Save article error:', error)
    return c.json({ error: error.message, success: false }, 500)
  }

  return c.json({ url: data.url, success: true })
})

app.get('/api/get-article', async (c: Context) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)
  const url = c.req.query('url')

  if (!url) {
    return c.json({ error: 'URL is required', success: false }, 400)
  }

  const { data, error } = await supabase
    .from('articles')
    .select('title, content')
    .eq('url', url)
    .single()

  if (error) {
    console.error('Get article error:', error)
    return c.json({ error: error.message, success: false }, 404)
  }

  if (!data) {
    return c.json({ error: 'Article not found', success: false }, 404)
  }

  return c.json({ ...data, success: true })
})

export default app
