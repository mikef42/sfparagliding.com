'use client'

import { useEffect, useRef, useMemo } from 'react'

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

/**
 * Separate HTML from <script> tags so we can render the HTML via
 * dangerouslySetInnerHTML (safe, no execution) and only run scripts
 * once in a useEffect. This prevents double-execution caused by:
 *   1. Browser executing inline scripts during SSR HTML parsing
 *   2. useEffect re-executing them after hydration
 */
function splitScripts(html: string) {
  const scriptRegex = /<script[\s\S]*?<\/script>/gi
  const scripts: string[] = []
  const htmlOnly = html.replace(scriptRegex, (match) => {
    scripts.push(match)
    return ''
  })
  return { htmlOnly, scripts }
}

export function CodeEmbedBlock({ block }: CodeEmbedBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptsRan = useRef(false)

  const { htmlOnly, scripts } = useMemo(
    () => splitScripts(block.code || ''),
    [block.code],
  )

  useEffect(() => {
    if (!containerRef.current || scriptsRan.current || scripts.length === 0) return
    scriptsRan.current = true

    // Snapshot body children before scripts run so we can clean up after
    const bodyChildrenBefore = new Set(Array.from(document.body.children))

    // Parse each <script> string and create a live script element
    const parser = new DOMParser()
    scripts.forEach((scriptStr) => {
      const doc = parser.parseFromString(scriptStr, 'text/html')
      const parsed = doc.querySelector('script')
      if (!parsed) return

      const newScript = document.createElement('script')
      Array.from(parsed.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value)
      })
      if (parsed.textContent) {
        newScript.textContent = parsed.textContent
      }
      containerRef.current!.appendChild(newScript)
    })

    // Cleanup: remove any elements the scripts added to document.body
    return () => {
      Array.from(document.body.children).forEach((child) => {
        if (!bodyChildrenBefore.has(child)) {
          child.remove()
        }
      })
    }
  }, [scripts])

  if (!block.code) return null

  const maxW = widthClasses[block.maxWidth || 'wide']

  return (
    <section className="py-8">
      <div className={`${maxW} mx-auto px-4`}>
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: htmlOnly }}
        />
      </div>
    </section>
  )
}
