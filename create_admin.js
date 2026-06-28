import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xboritaasjkhbruftrkz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhib3JpdGFhc2praGJydWZ0cmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDM2MjMsImV4cCI6MjA5NjUxOTYyM30.yOk2e6GPcadxyYBrqkmmKmwYSj5Cr16COOE8WS-tXw8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdmin() {
  const email = 'admin@agribridge.com'
  const password = 'AgriBridgeAdmin2026!@#'
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin',
        full_name: 'System Admin'
      }
    }
  })
  
  if (error) {
    console.error('Error creating admin:', error.message)
  } else {
    console.log('Admin user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
  }
}

createAdmin()
