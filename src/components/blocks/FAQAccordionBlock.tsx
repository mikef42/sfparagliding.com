'use client'

import { useState } from 'react'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

interface FAQAccordionBlockProps {
  block: {
    heading?: string
    items: Array<{
      question: string
      answer: unknown
    }>
  }
}

export function FAQAccordionBlock({ block }: FAQAccordionBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!block.items || block.items.length === 0) return null

  return (
    <section className="py-16 lg:py-20">
      <div className="container-narrow">
        {block.heading && (
          <>
            <h2 className="section-heading">{block.heading}</h2>
            <div className="section-divider" />
          </>
        )}

        <div className="space-y-2">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left
                           hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800 pr-4">{item.question}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200
                             ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 prose-content text-sm text-gray-600 animate-fade-in">
                  <RichTextRenderer content={item.answer} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
