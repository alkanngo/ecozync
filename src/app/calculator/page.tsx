import CalculatorForm from '@/components/calculator/calculator-form'
import { getSession } from '@/features/account/controllers/get-session'

export default async function CalculatorPage() {
  // Get session but don't require authentication
  const session = await getSession()
  const userId = session?.user?.id || null

  return (
    <div className="relative overflow-hidden full-content-height">
      {/* Breathing gradient background */}
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
      <CalculatorForm userId={userId} />
    </div>
  )
}
