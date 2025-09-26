'use client'

import { useState } from 'react'
import { AnimatePresence,motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

import { signInWithOAuth } from '@/app/(auth)/auth-actions'

interface SocialLoginButtonsProps {
  onLoginStart?: () => void
  className?: string
}

export function SocialLoginButtons({ onLoginStart, className = "" }: SocialLoginButtonsProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter' | 'linkedin', providerName: string) => {
    try {
      setLoading(provider)
      onLoginStart?.()
      
      // Call the server action for supported providers
      if (provider === 'google') {
        await signInWithOAuth('google', 'homepage')
      } else {
        // For other providers, show coming soon message for now
        setLoading(null)
        // You can implement other OAuth providers here later
        console.log(`${providerName} login - coming soon`)
      }
    } catch (error) {
      console.error(`${providerName} login failed:`, error)
      setLoading(null)
    }
  }

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      bgColor: 'bg-white hover:bg-gray-50',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      fullWidth: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bgColor: 'bg-[#1877F2] hover:bg-[#166FE5]',
      textColor: 'text-white',
      borderColor: 'border-[#1877F2]',
      fullWidth: false
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bgColor: 'bg-black hover:bg-gray-900',
      textColor: 'text-white',
      borderColor: 'border-black',
      fullWidth: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      bgColor: 'bg-[#0A66C2] hover:bg-[#0952A5]',
      textColor: 'text-white',
      borderColor: 'border-[#0A66C2]',
      fullWidth: false
    }
  ]

  return (
    <div className={className}>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group w-full px-6 py-3 rounded-full font-outfit text-[15px] transition-all bg-white/[0.06] text-text-primary border border-white/[0.12] hover:bg-white/[0.08] hover:border-white/[0.16]"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-green" />
          <span>Sign In to Track Progress</span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-green/20 to-accent-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      </motion.button>

      {/* Social Login Options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
             <div className="pt-4">
               {/* All providers in 2x2 Grid */}
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="grid grid-cols-2 gap-3"
               >
                 {socialProviders.map((provider, index) => (
                   <motion.button
                     key={provider.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 + 0.1 }}
                     onClick={() => handleSocialLogin(provider.id as 'google' | 'facebook' | 'twitter' | 'linkedin', provider.name)}
                     disabled={loading === provider.id}
                     className={`
                       w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg font-medium h-12
                       transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 
                       disabled:cursor-not-allowed ${provider.bgColor} ${provider.textColor} 
                       border ${provider.borderColor}
                     `}
                   >
                     {loading === provider.id ? (
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                     ) : (
                       provider.icon
                     )}
                     <span className="font-outfit text-sm">
                       {loading === provider.id ? 'Signing in...' : provider.name}
                     </span>
                   </motion.button>
                 ))}
               </motion.div>
              
              {/* Benefits reminder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-3 border-t border-white/[0.08]"
              >
                <div className="flex items-center justify-center gap-6 text-xs text-text-secondary font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-accent-green">✓</span>
                    <span>Plant trees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-accent-green">✓</span>
                    <span>Offset impact</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-accent-green">✓</span>
                    <span>Inspire friends</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
