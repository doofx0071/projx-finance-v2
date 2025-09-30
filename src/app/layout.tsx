import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: "PHPinancia",
  description: "PHPinancia - A modern finance tracking application built with Next.js and TypeScript",
  icons: {
    icon: "https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark-logo-only.png",
    apple: "https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark-logo-only.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
