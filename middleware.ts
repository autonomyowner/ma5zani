import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api/webhooks(.*)',
  '/admin(.*)',
  // Public storefront routes - match any slug that's not a reserved path
  '/:slug',
  '/:slug/checkout',
  '/:slug/order-success/:orderId',
])

// Reserved paths that should NOT be treated as storefront slugs
const reservedPaths = [
  'dashboard',
  'login',
  'signup',
  'admin',
  'api',
  'onboarding',
  '_next',
]

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname

  // Check if it's a reserved path
  const firstSegment = pathname.split('/')[1]
  if (reservedPaths.includes(firstSegment)) {
    // If it's a dashboard route, require auth
    if (firstSegment === 'dashboard' || firstSegment === 'onboarding') {
      await auth.protect()
    }
    return
  }

  // Otherwise, it's either a public route or a storefront slug (public)
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
