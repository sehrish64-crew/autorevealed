'use client'

import Script from 'next/script'

export default function PaddleInitialization() {
  // Determine environment: Check NEXT_PUBLIC_PADDLE_ENV first, default to 'sandbox'
  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox'
  const isProduction = paddleEnv === 'production' || paddleEnv === 'live'
  
  // Get the appropriate token based on environment
  // For production: use NEXT_PUBLIC_LIVE_PADDLE_CLIENT_TOKEN or NEXT_PUBLIC_LIVE_PADDLE_BILLING_TOKEN
  // For sandbox: use NEXT_PUBLIC_PADDLE_CLIENT_TOKEN or NEXT_PUBLIC_PADDLE_BILLING_TOKEN
  const token = isProduction 
    ? (process.env.NEXT_PUBLIC_LIVE_PADDLE_CLIENT_TOKEN || process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)
    : (process.env.NEXT_PUBLIC_PADDLE_BILLING_TOKEN || process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)

  console.log('[Paddle Init] Environment:', paddleEnv)
  console.log('[Paddle Init] Is Production:', isProduction)
  console.log('[Paddle Init] Token available:', !!token)
  console.log('[Paddle Init] Token prefix:', token?.substring(0, 5) + '...')

  if (!token) {
    console.error('❌ [Paddle] Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN environment variable')
    return null
  }

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as any
        
        // Prevent double initialization
        if (w.PADDLE_INITIALIZED) {
          console.log('[Paddle] Already initialized, skipping.')
          return
        }

        try {
          if (!w.Paddle) {
            console.error('❌ [Paddle] Paddle object not available on window')
            return
          }

          const env = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox'
          const isProd = env === 'production' || env === 'live'
          
          console.log('[Paddle] Initializing with:')
          console.log('  - Token:', token.substring(0, 15) + '...')
          console.log('  - Environment:', isProd ? 'production' : 'sandbox')



          // Initialize Paddle using Setup (v2 method, not Initialize)
          w.Paddle.Setup({ 
            token: token.trim()
          })

          // Mark as initialized to prevent duplicate attempts
          w.PADDLE_INITIALIZED = true
          console.log('✅ [Paddle] Initialization complete')

          // Verify Checkout is ready
          if (w.Paddle.Checkout && typeof w.Paddle.Checkout.open === 'function') {
            console.log('✅ [Paddle] Checkout.open is ready')
          }
        } catch (err) {
          console.error('❌ [Paddle] Initialization error:', err)
        }
      }}
      onError={(e) => {
        console.error('❌ [Paddle] Script loading error:', e)
      }}
    />
  )
}
