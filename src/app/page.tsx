'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

import CurvedLoop from '@/components/ui/curved-loop'
import { useAuth } from '@/contexts/auth-context'

// Subtle magnetic button - less dramatic than before
function Button({ children, href, variant = 'default' }: { children: React.ReactNode, href: string, variant?: 'default' | 'primary' | 'ghost' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })
  
  return (
    <Link href={href}>
      <motion.button
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          x.set((e.clientX - centerX) * 0.05)
          y.set((e.clientY - centerY) * 0.05)
        }}
        onMouseLeave={() => { x.set(0); y.set(0) }}
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative px-7 py-3.5 rounded-full font-outfit text-[15px] transition-all
          ${variant === 'primary' 
            ? 'bg-accent-green text-primary-dark hover:bg-accent-green/90' 
            : variant === 'ghost'
            ? 'bg-white/[0.03] text-text-primary border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]'
            : 'bg-white/[0.03] text-text-primary border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]'
          }
        `}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    </Link>
  )
}

// Simple rotating stats
function RotatingStats() {
  const stats = [
    { value: '3 min', label: 'quick assessment' },
    { value: '€4.50', label: 'start offsetting' },
    { value: '8.4t', label: 'avg EU footprint' }
  ]
  const [index, setIndex] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % stats.length), 3000)
    return () => clearInterval(timer)
  }, [stats.length])
  
  return (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 text-md"
    >
      <span className="text-accent-green text-xl font-semibold">{stats[index].value}</span>
      <span className="text-text-secondary font-mono">{stats[index].label}</span>
    </motion.div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
      </div>
    )
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="relative overflow-hidden">
            <div 
        className="fixed inset-0 animate-pulse"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(74, 222, 128, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%)
          `,
          animationDuration: '4s',
          animationTimingFunction: 'ease-in-out'
        }}
      />
      {/* Subtle gradient background - no animation */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-dark via-primary-dark/95 to-surface-dark opacity-50 animate-pulse" />
      
      {/* Very subtle floating orbs - static positioning with gentle pulse */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent-green/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-accent-cyan/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="px-6 lg:px-12 flex flex-col justify-center pt-16 md:pt-20 lg:pt-24">
          
          {/* Hero Text - centered and clean */}
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Small badge */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/[0.08] border border-accent-green animate-pulse"
              >
                <span className="text-xs text-accent-green font-mono">Living Carbon Offsetter</span>
              </motion.div>
            )}

            {/* Main headline */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <h1 className="text-5xl max-w-[300px] lg:text-6xl font-outfit text-white leading-[1.1]">
                  Track your impact,
                </h1>
              </motion.div>
            )}
          </div>
        </div>

        {/* CurvedLoop for "alive and social" - positioned to break all constraints */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className=" w-full h-32 md:h-40 lg:h-48 z-20 pointer-events-none "
          >
            <CurvedLoop 
              marqueeText="share your progress ✦ inspire your friends ✦ change the world ✦ "
              speed={3}
              direction="left"
              interactive={false}
              fontSize="text-[10rem] md:text-[8rem]"
              responsiveCurve={true}
              className="fill-accent-green !fill-accent-green [&>text]:fill-accent-green [&_text]:fill-accent-green [&_textPath]:fill-accent-green"
            />
          </motion.div>
        )}

        {/* Content below the curved text */}
        <div className="px-6 lg:px-12 pb-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Description */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed font-mono">
                  Transform climate action from guilt to empowerment. Track, compete, and 
                  celebrate your journey to carbon neutrality with friends.
                </p>
              </motion.div>
            )}

            {/* Simple stats */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="h-6"
              >
                <RotatingStats />
              </motion.div>
            )}

            {/* CTAs - cleaner design */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                <Button href="/calculator" variant="primary">
                  Calculate Your Footprint
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button href="/login" variant="ghost">
                  Sign In to Track Progress
                </Button>
              </motion.div>
            )}

            {/* Social proof - minimal */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-3 pt-8"
              >
                <div className="flex -space-x-2">
                  {['JD', 'SK', 'AL', 'MK'].map((initials, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-surface-darker border border-white/10 flex items-center justify-center text-xs font-medium text-white/70"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary font-mono">
                  Join <span className="text-xl text-white font-medium font-batamy">2,847</span> people reducing their impact
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}