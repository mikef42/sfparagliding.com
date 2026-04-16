'use client'

import React, { useState, useEffect, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────
interface ApiKey {
  id: number
  label: string
  keyPrefix: string
  createdAt: string
}

export default function ApiEndpointsViewClient() {
  const [copied, setCopied] = useState<string | null>(null)

  // Key management state
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBase = typeof window !== 'undefined' ? window.location.origin : 'https://sfparagliding.com'
  const apiUrl = `${apiBase}/api/blog`

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // Fetch existing keys
  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/api-keys')
      if (res.ok) {
        const data = await res.json()
        setKeys(data.keys)
      }
    } catch {
      // Silently fail — keys section will show empty
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  // Generate a new key
  const handleGenerateKey = async () => {
    if (!newKeyLabel.trim()) return
    setIsGenerating(true)
    setError(null)
    setJustCreatedKey(null)

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to generate key')
        return
      }

      const data = await res.json()
      setJustCreatedKey(data.key.rawKey)
      setNewKeyLabel('')
      fetchKeys()
    } catch {
      setError('Failed to generate key')
    } finally {
      setIsGenerating(false)
    }
  }

  // Revoke a key
  const handleRevokeKey = async (id: number) => {
    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id))
        setDeleteConfirmId(null)
      }
    } catch {
      // Silently fail
    }
  }

  const createExample = `curl -X POST '${apiUrl}' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "title": "Your Blog Post Title",
    "content": "<h2>Heading</h2><p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p><ul><li>Bullet</li></ul>",
    "excerpt": "A short summary for the listing page.",
    "status": "published",
    "author": "SF Paragliding",
    "featuredImage": {
      "base64": "/9j/4AAQ...(base64 data)...",
      "filename": "my-image.jpg",
      "alt": "Image description"
    },
    "meta": {
      "metaTitle": "SEO Title | SF Paragliding",
      "metaDescription": "Meta description for search engines."
    }
  }'`

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>API Endpoints</h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 14 }}>
        Use these endpoints to publish blog posts remotely from your marketing site or other services.
      </p>

      {/* ═══════════════════════ API Key Management ═══════════════════════ */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ ...iconStyle, background: '#fef3c7' }}>
            <svg width="18" height="18" fill="none" stroke="#d97706" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 style={sectionTitle}>API Key Management</h2>
        </div>
        <p style={bodyText}>
          Generate Bearer tokens to authenticate API requests. Keys are hashed before storage — the full key is shown only once at creation time.
        </p>

        {/* Generate form */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Key label (e.g., Marketing Site)"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateKey()}
            style={inputStyle}
          />
          <button
            onClick={handleGenerateKey}
            disabled={isGenerating || !newKeyLabel.trim()}
            style={{
              ...generateBtn,
              opacity: isGenerating || !newKeyLabel.trim() ? 0.5 : 1,
              cursor: isGenerating || !newKeyLabel.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Key'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* One-time key display */}
        {justCreatedKey && (
          <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" fill="none" stroke="#16a34a" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>Key created! Copy it now:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{
                flex: 1,
                padding: '8px 12px',
                background: '#dcfce7',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                color: '#166534',
              }}>
                {justCreatedKey}
              </code>
              <button
                onClick={() => copyToClipboard(justCreatedKey, 'new-key')}
                style={{
                  ...generateBtn,
                  padding: '6px 16px',
                  flexShrink: 0,
                }}
              >
                {copied === 'new-key' ? '✓ Copied' : 'Copy Key'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#b45309', margin: '8px 0 0', fontWeight: 500 }}>
              ⚠ This key will not be shown again. Store it securely.
            </p>
          </div>
        )}

        {/* Existing keys table */}
        {keys.length > 0 ? (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={keyThStyle}>Label</th>
                  <th style={keyThStyle}>Key Prefix</th>
                  <th style={keyThStyle}>Created</th>
                  <th style={{ ...keyThStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={keyTdStyle}>
                      <span style={{ fontWeight: 500 }}>{key.label}</span>
                    </td>
                    <td style={keyTdStyle}>
                      <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>
                        {key.keyPrefix}...
                      </code>
                    </td>
                    <td style={{ ...keyTdStyle, color: '#6b7280' }}>
                      {new Date(key.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ ...keyTdStyle, textAlign: 'right' }}>
                      {deleteConfirmId === key.id ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#dc2626' }}>Revoke?</span>
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            style={revokeConfirmBtn}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            style={revokeCancelBtn}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(key.id)}
                          style={revokeBtn}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            No API keys yet. Generate one above to get started.
          </p>
        )}
      </div>

      {/* ═══════════════════════ Authentication ═══════════════════════ */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ ...iconStyle, background: '#fef3c7' }}>
            <svg width="18" height="18" fill="none" stroke="#d97706" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 style={sectionTitle}>Authentication</h2>
        </div>
        <p style={bodyText}>
          All requests require a Bearer token. Generate API keys above, then include the token in every request header.
        </p>
        <div style={codeBlockWrap}>
          <pre style={codeBlock}>Authorization: Bearer sfp_your_api_key_here</pre>
        </div>
      </div>

      {/* ═══════════════════════ Endpoint URL ═══════════════════════ */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ ...iconStyle, background: '#dbeafe' }}>
            <svg width="18" height="18" fill="none" stroke="#2563eb" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </div>
          <h2 style={sectionTitle}>Endpoint URL</h2>
        </div>
        <div style={{ ...codeBlockWrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <pre style={{ ...codeBlock, margin: 0 }}>{apiUrl}</pre>
          <button
            onClick={() => copyToClipboard(apiUrl, 'url')}
            style={copyBtn}
          >
            {copied === 'url' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* POST — Create */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={methodBadge('#16a34a', '#dcfce7')}>POST</span>
          <h2 style={sectionTitle}>Create a Blog Post</h2>
        </div>
        <p style={bodyText}>Publish a new blog post with rich HTML content and an optional base64 featured image.</p>

        <div style={codeBlockWrap}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
            <button onClick={() => copyToClipboard(createExample, 'create')} style={copyBtn}>
              {copied === 'create' ? 'Copied!' : 'Copy cURL'}
            </button>
          </div>
          <pre style={codeBlock}>{createExample}</pre>
        </div>

        {/* Field table */}
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={thStyle}>Field</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Required</th>
              <th style={thStyle}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['title', 'string', true, 'Blog post title'],
              ['content', 'string', true, 'HTML body content'],
              ['contentFormat', '"html" | "lexical"', false, 'Defaults to "html"'],
              ['slug', 'string', false, 'URL slug (auto-generated from title)'],
              ['excerpt', 'string', false, 'Summary for listing page'],
              ['status', '"draft" | "published"', false, 'Defaults to "draft"'],
              ['author', 'string', false, 'Author name on the post'],
              ['publishedAt', 'ISO 8601', false, 'Auto-set when status is "published"'],
              ['featuredImage', 'object | number', false, 'Base64 upload or existing media ID'],
              ['meta.metaTitle', 'string', false, 'SEO title (defaults to post title)'],
              ['meta.metaDescription', 'string', false, 'SEO meta description'],
            ].map(([field, type, required, desc], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#4f46e5', fontSize: 12 }}>{field}</td>
                <td style={{ ...tdStyle, color: '#666' }}>{type}</td>
                <td style={tdStyle}>
                  {required
                    ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Yes</span>
                    : <span style={{ color: '#9ca3af' }}>No</span>
                  }
                </td>
                <td style={{ ...tdStyle, color: '#666' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
          <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>
            <strong>Supported HTML tags:</strong>{' '}
            {['h2–h6', 'p', 'ul', 'ol', 'li', 'strong / b', 'em / i', 'a'].map((tag, i) => (
              <code key={i} style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4, marginRight: 4, fontSize: 11 }}>{tag}</code>
            ))}
          </p>
        </div>
      </div>

      {/* PATCH — Update */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={methodBadge('#d97706', '#fef3c7')}>PATCH</span>
          <h2 style={sectionTitle}>Update an Existing Post</h2>
        </div>
        <p style={bodyText}>
          Identify by <code style={codeInline}>id</code> or <code style={codeInline}>slug</code>. Only include the fields you want to change.
        </p>
        <div style={codeBlockWrap}>
          <pre style={codeBlock}>{`{
  "slug": "your-post-slug",
  "title": "Updated Title",
  "content": "<p>Replaced body content.</p>",
  "status": "published"
}`}</pre>
        </div>
      </div>

      {/* GET — List */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={methodBadge('#2563eb', '#dbeafe')}>GET</span>
          <h2 style={sectionTitle}>List Posts</h2>
        </div>
        <p style={bodyText}>Retrieve posts with optional filters.</p>
        <div style={codeBlockWrap}>
          <pre style={codeBlock}>{`GET ${apiUrl}?status=published&limit=10&page=1

Query parameters:
  status  — "published" (default), "draft", or "all"
  limit   — 1–250 (default: 50)
  page    — Page number (default: 1)`}</pre>
        </div>
      </div>

      {/* DELETE */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={methodBadge('#dc2626', '#fef2f2')}>DELETE</span>
          <h2 style={sectionTitle}>Delete a Post</h2>
        </div>
        <p style={bodyText}>Remove a post by ID or slug.</p>
        <div style={codeBlockWrap}>
          <pre style={codeBlock}>{`DELETE ${apiUrl}?id=8
DELETE ${apiUrl}?slug=your-post-slug`}</pre>
        </div>
      </div>

      {/* Response */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ ...iconStyle, background: '#dcfce7' }}>
            <svg width="18" height="18" fill="none" stroke="#16a34a" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h2 style={sectionTitle}>Success Response (201)</h2>
        </div>
        <div style={codeBlockWrap}>
          <pre style={codeBlock}>{`{
  "success": true,
  "post": {
    "id": 8,
    "title": "Your Blog Post Title",
    "slug": "your-blog-post-title",
    "status": "published",
    "url": "${apiBase}/blog/your-blog-post-title",
    "createdAt": "2026-03-10T19:00:00.000Z"
  }
}`}</pre>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

const iconStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
}

const bodyText: React.CSSProperties = {
  fontSize: 14,
  color: '#666',
  marginBottom: 12,
  lineHeight: 1.5,
}

const codeInline: React.CSSProperties = {
  background: '#f3f4f6',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 12,
  fontFamily: 'monospace',
}

const codeBlockWrap: React.CSSProperties = {
  background: '#111827',
  borderRadius: 8,
  padding: 16,
  overflowX: 'auto',
}

const codeBlock: React.CSSProperties = {
  color: '#4ade80',
  fontSize: 13,
  fontFamily: 'monospace',
  whiteSpace: 'pre',
  margin: 0,
  lineHeight: 1.6,
}

const copyBtn: React.CSSProperties = {
  background: '#374151',
  color: '#d1d5db',
  border: 'none',
  borderRadius: 6,
  padding: '4px 12px',
  fontSize: 12,
  cursor: 'pointer',
  flexShrink: 0,
}

const methodBadge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 700,
  color,
  background: bg,
})

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#6b7280',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  fontSize: 14,
  border: '1px solid #d1d5db',
  borderRadius: 8,
  outline: 'none',
  background: '#fff',
}

const generateBtn: React.CSSProperties = {
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 20px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}

const revokeBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: 6,
  padding: '3px 10px',
  fontSize: 12,
  cursor: 'pointer',
}

const revokeConfirmBtn: React.CSSProperties = {
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '2px 8px',
  fontSize: 12,
  cursor: 'pointer',
}

const revokeCancelBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#6b7280',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  padding: '2px 8px',
  fontSize: 12,
  cursor: 'pointer',
}

const keyThStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#6b7280',
  textAlign: 'left',
}

const keyTdStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
}
