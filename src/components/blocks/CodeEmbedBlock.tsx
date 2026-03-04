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
    if (!containerRef.current) return

    // Snapshot body children before scripts run so we can clean up after
    const bodyChildrenBefore = new Set(Array.from(document.body.children))

    // Re-create <script> tags so they actually execute.
    // dangerouslySetInnerHTML renders the HTML (including iframes) but
    // does NOT execute <script> elements — we handle that here.
    const scripts = containerRef.current.querySelectorAll('script')
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value)
      })
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })

    // Cleanup: remove any elements the scripts added to document.body
    return () => {
      Array.from(document.body.children).forEach((child) => {
        if (!bodyChildrenBefore.has(child)) {
          child.remove()
        }
      })
    }
  }, [block.code])

  if (!block.code) return null

  const maxW = widthClasses[block.maxWidth || 'wide']

  return (
    <section className="py-8">
      <div className={`${maxW} mx-auto px-4`}>
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: block.code }}
        />
      </div>
    </section>
  )
}
