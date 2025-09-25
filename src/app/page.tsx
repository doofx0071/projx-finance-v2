import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { ROUTES } from '@/lib/routes'

export default async function Home() {
  const { userId } = await auth()

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Top */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, var(--home-radial-start) 40%, var(--home-radial-end) 100%)",
        }}
      />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full border-b bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Image
                src="/logos/PHPinancia-light.png"
                alt="Phinancia"
                width={120}
                height={32}
                className="h-8 dark:hidden"
                style={{ width: 'auto', height: '32px' }}
                priority
              />
              <Image
                src="/logos/PHPinancia-dark.png"
                alt="Phinancia"
                width={120}
                height={32}
                className="h-8 hidden dark:block"
                style={{ width: 'auto', height: '32px' }}
                priority
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" className="font-sans font-normal antialiased dark:hover:text-accent">
                <Link href={ROUTES.LOGIN}>Sign In</Link>
              </Button>
              <Button asChild className="font-sans font-normal antialiased">
                <Link href={ROUTES.SIGNUP}>Get Started</Link>
              </Button>
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-5xl mx-auto text-center">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">AI-Powered Financial Intelligence</span>
            </div>

            {/* Enhanced Headline */}
            <div className="mb-8">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-4 text-foreground leading-none">
                Master Your
              </h1>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-primary leading-none">
                Money Moves
              </h1>
            </div>

            {/* Enhanced Description */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed mb-6 font-light">
                Track expenses, set budgets, and unlock
                <span className="text-primary font-medium"> AI-driven insights</span> to build wealth.
              </p>
              <p className="text-lg text-muted-foreground/80 leading-relaxed">
                Join Filipino entrepreneurs who trust PHPinancia for their financial journey.
              </p>
            </div>

            {/* Subtle accent line */}
            <div className="mt-12 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
