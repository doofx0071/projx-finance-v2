'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Quote } from 'lucide-react'

interface RandomImage {
  url: string
  alt: string
}

interface RandomQuote {
  content: string
  author: string
}

// Global variable to track seed across component mounts within the same page session
let currentPageSeed: string | null = null

export function AuthBackground() {
  const [image, setImage] = useState<RandomImage | null>(null)
  const [quote, setQuote] = useState<RandomQuote | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  // Generate seed once per page load, persist across form switches
  const [seed] = useState(() => {
    if (typeof window === 'undefined') return Date.now().toString()

    try {
      // Check if we already have a seed for this page session
      if (currentPageSeed) {
        return currentPageSeed
      }

      // Check if this is a fresh page load by comparing with stored timestamp
      const lastPageLoad = sessionStorage.getItem('auth-last-page-load')
      const currentTime = Date.now()
      const timeDiff = lastPageLoad ? currentTime - parseInt(lastPageLoad) : Infinity

      // If more than 1 second has passed, consider it a new page load
      if (!lastPageLoad || timeDiff > 1000) {
        currentPageSeed = currentTime.toString()
        sessionStorage.setItem('auth-last-page-load', currentTime.toString())
      } else {
        // Use existing seed from sessionStorage
        currentPageSeed = sessionStorage.getItem('auth-current-seed') || currentTime.toString()
      }

      // Store the current seed
      sessionStorage.setItem('auth-current-seed', currentPageSeed)
      return currentPageSeed
    } catch (e) {
      // Fallback if sessionStorage is not available
      const fallbackSeed = Date.now().toString()
      currentPageSeed = fallbackSeed
      return fallbackSeed
    }
  })

  // Initialize image with page load seed (changes on refresh, consistent during form switching)
  useEffect(() => {
    const initializeImage = () => {
      try {
        // Generate consistent dimensions and URL using seed
        const width = 900
        const height = 700
        const imageUrl = `https://picsum.photos/${width}/${height}?random=${seed}`

        setImage({
          url: imageUrl,
          alt: 'Random inspirational background image'
        })
      } catch (error) {
        console.error('Failed to initialize image:', error)
        // Fallback to a default image
        setImage({
          url: '/placeholder.svg',
          alt: 'Placeholder background image'
        })
      } finally {
        setImageLoading(false)
      }
    }

    initializeImage()
  }, [seed])

  // Initialize quote with page load seed (changes on refresh, consistent during form switching)
  useEffect(() => {
    const initializeQuote = () => {
      try {
        // Use a consistent fallback based on page load seed
        const fallbackQuotes = [
          { content: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
          { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
          { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
          { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
          { content: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
          { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
          { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
          { content: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" }
        ]

        // Use seed to consistently pick the same quote for this page load
        const seedNumber = parseInt(seed.slice(-3)) || 0 // Use last 3 digits for variety
        const selectedQuote = fallbackQuotes[seedNumber % fallbackQuotes.length]

        setQuote(selectedQuote)
      } catch (error) {
        console.warn('Failed to initialize quote:', error)
        // Ultimate fallback
        const defaultQuote = {
          content: "The only way to do great work is to love what you do.",
          author: "Steve Jobs"
        }
        setQuote(defaultQuote)
      }
    }

    initializeQuote()
  }, [seed])

  return (
    <div className="bg-muted relative hidden lg:block flex-1">
      {/* Background Image */}
      {image && (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 0vw, 50vw"
          className="object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          priority
        />
      )}

      {/* Loading overlay for image */}
      {imageLoading && (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Quote overlay in bottom left */}
      <div className="absolute bottom-6 left-6 max-w-xl">
        <div className="text-white">
          <div className="flex items-start gap-4">
            <Quote className="h-8 w-8 text-white/90 flex-shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              {quote && (
                <>
                  <blockquote className="text-xl leading-relaxed mb-3 italic font-medium">
                    &quot;{quote.content}&quot;
                  </blockquote>
                  <cite className="text-lg text-white/90 font-semibold">
                    — {quote.author}
                  </cite>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
    </div>
  )
}