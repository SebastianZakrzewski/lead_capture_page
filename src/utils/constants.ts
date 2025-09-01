// Application constants

export const APP_CONFIG = {
  name: 'Lead Capture Page',
  version: '1.0.0',
  description: 'A modern lead capture application built with Next.js',
} as const;

export const API_CONFIG = {
  base: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
}

export const API_ENDPOINTS = {
  leads: '/leads',
  users: '/users',
} as const;

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWJuc2luaHNlZG12dnN0dnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Njg4MDYsImV4cCI6MjA1MDU0NDgwNn0.TiuCGOvIcIDYkTpjlsKfq9u8v8jWY6-E_YcxaE5rAUU',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWJuc2luaHNlZG12dnN0dnZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk2ODgwNiwiZXhwIjoyMDUwNTQ0ODA2fQ.FUGDbvuIRpzgz-PBZ7jFz3BZU0VQLQ2M4r_9ZmVXlYE',
}

export const VALIDATION_RULES = {
  email: {
    required: 'Email jest wymagany',
    pattern: 'Nieprawidłowy format email',
  },
  name: {
    required: 'Imię jest wymagane',
    minLength: 'Imię musi mieć co najmniej 2 znaki',
  },
  phone: {
    required: 'Telefon jest wymagany',
    pattern: 'Nieprawidłowy format telefonu',
  },
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
