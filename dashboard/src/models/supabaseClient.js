import supabase from '@lib/supabase-browser'
import { createClient } from '@supabase/supabase-js'

export default process.env.SUPABASE_GOD_MODE_KEY ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY) : supabase