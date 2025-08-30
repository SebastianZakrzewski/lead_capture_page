// Application constants

export const APP_CONFIG = {
  name: 'Lead Capture Page',
  version: '1.0.0',
  description: 'A modern lead capture application built with Next.js',
} as const;

export const API_ENDPOINTS = {
  base: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  leads: '/leads',
  users: '/users',
} as const;

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
