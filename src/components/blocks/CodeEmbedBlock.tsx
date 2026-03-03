'use client'

import { useEffect, useRef } from 'react'

interface CodeEmbedBlockProps {
  block: {
    code: string
    maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
  }
}

const widthClasses: Record<string, string> = {
  narrow: 'max-w-3xl',
  medium: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'w-full',
}

export function CodeEmbedBlock({ block }: CodeEmbedBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !block.code) return

    const container = containerRef.current
    container.innerHTML = block.code

    // Find and execute any script tags
    const scripts = container.querySelectorAll('script')
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      // Copy all attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value)
      })
      // Copy inline script content
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }, [block.code])

  if (!block.code) return null

  const maxW = widthClasses[block.maxWidth || 'wide']

  return (
    <section className="py-8">
      <div className={`${maxW} mx-auto px-4`}>
        <div ref={containerRef} />
      </div>
    </section>
  )
}
