'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
  DEFAULT_STATIC_SITEMAP_ENTRIES,
  SITEMAP_CHANGE_FREQUENCY_OPTIONS,
  SITEMAP_GENERATION_FREQUENCY_OPTIONS,
  type SitemapChangeFrequency,
  type SitemapGenerationFrequency,
  type SitemapGenerationStatus,
  type SitemapDynamicCollectionsConfig,
  type SitemapStaticEntryConfig,
} from '@/lib/sitemap'

type StaticEntryFormState = {
  path: string
  changeFrequency: SitemapChangeFrequency
  priority: string
}

type SitemapSettingsFormState = {
  enabled: boolean
  staticEntries: StaticEntryFormState[]
  dynamicCollections: SitemapDynamicCollectionsConfig
  excludePaths: string
  generationFrequency: SitemapGenerationFrequency
  lastGeneratedAt: string | null
  lastGeneratedCount: number | null
  lastGenerationStatus: SitemapGenerationStatus | null
  lastGenerationMessage: string
  nextScheduledGenerationAt: string | null
}

const DEFAULT_FORM_STATE: SitemapSettingsFormState = {
  enabled: true,
  staticEntries: DEFAULT_STATIC_SITEMAP_ENTRIES.map((entry) => ({
    path: entry.path,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority.toString(),
  })),
  dynamicCollections: {
    pages: true,
    posts: true,
    products: true,
    services: true,
    categories: true,
  },
  excludePaths: '',
  generationFrequency: 'manual',
  lastGeneratedAt: null,
  lastGeneratedCount: null,
  lastGenerationStatus: null,
  lastGenerationMessage: '',
  nextScheduledGenerationAt: null,
}

function formatStaticEntries(entries: SitemapStaticEntryConfig[]): StaticEntryFormState[] {
  return entries.map((entry) => ({
    path: entry.path,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority.toString(),
  }))
}

function createEmptyStaticEntry(): StaticEntryFormState {
  return {
    path: '',
    changeFrequency: 'weekly',
    priority: '0.5',
  }
}

type SitemapSettingsApiShape = {
  enabled: boolean
  staticEntries: SitemapStaticEntryConfig[]
  dynamicCollections: SitemapDynamicCollectionsConfig
  excludePaths: string
  generationFrequency: SitemapGenerationFrequency
  lastGeneratedAt: string | null
  lastGeneratedCount: number | null
  lastGenerationStatus: SitemapGenerationStatus | null
  lastGenerationMessage: string
  nextScheduledGenerationAt: string | null
}

function applyApiSettings(settings: SitemapSettingsApiShape): SitemapSettingsFormState {
  return {
    enabled: settings.enabled,
    staticEntries: formatStaticEntries(settings.staticEntries),
    dynamicCollections: settings.dynamicCollections,
    excludePaths: settings.excludePaths,
    generationFrequency: settings.generationFrequency,
    lastGeneratedAt: settings.lastGeneratedAt,
    lastGeneratedCount: settings.lastGeneratedCount,
    lastGenerationStatus: settings.lastGenerationStatus,
    lastGenerationMessage: settings.lastGenerationMessage,
    nextScheduledGenerationAt: settings.nextScheduledGenerationAt,
  }
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Never'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatGenerationFrequency(value: SitemapGenerationFrequency): string {
  return (
    SITEMAP_GENERATION_FREQUENCY_OPTIONS.find((option) => option.value === value)?.label ||
    'Manual only'
  )
}

export default function SitemapSettingsViewClient() {
  const [form, setForm] = useState<SitemapSettingsFormState>(DEFAULT_FORM_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/sitemap-settings', {
          credentials: 'same-origin',
        })
        const data = (await response.json()) as {
          error?: string
          settings?: SitemapSettingsApiShape
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load sitemap settings.')
        }

        if (!isMounted || !data.settings) {
          return
        }

        setForm(applyApiSettings(data.settings))
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load sitemap settings.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  const saveSettings = async (
    successMessage: string | null,
  ): Promise<SitemapSettingsApiShape | null> => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/sitemap-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          enabled: form.enabled,
          staticEntries: form.staticEntries.map((entry) => ({
            path: entry.path,
            changeFrequency: entry.changeFrequency,
            priority: Number(entry.priority),
          })),
          dynamicCollections: form.dynamicCollections,
          excludePaths: form.excludePaths,
          generationFrequency: form.generationFrequency,
        }),
      })

      const data = (await response.json()) as {
        error?: string
        settings?: SitemapSettingsApiShape
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save sitemap settings.')
      }

      if (!data.settings) {
        throw new Error('Saved sitemap settings response was incomplete.')
      }

      setForm(applyApiSettings(data.settings))
      if (successMessage) {
        setSuccess(successMessage)
      }
      return data.settings
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save sitemap settings.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    await saveSettings('Sitemap settings saved.')
  }

  const handleGenerate = async () => {
    setError(null)
    setSuccess(null)
    setIsGenerating(true)

    const savedSettings = await saveSettings(null)
    if (!savedSettings) {
      setIsGenerating(false)
      return
    }

    try {
      const response = await fetch('/api/admin/sitemap-settings/generate', {
        method: 'POST',
        credentials: 'same-origin',
      })

      const data = (await response.json()) as {
        error?: string
        message?: string
        settings?: SitemapSettingsApiShape
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate sitemap.')
      }

      if (data.settings) {
        setForm(applyApiSettings(data.settings))
      }

      setSuccess(data.message || 'Sitemap generated successfully.')
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Failed to generate sitemap.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <Link
            href="/admin/settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--theme-elevation-700, #4b5563)',
              textDecoration: 'none',
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            <span aria-hidden="true">←</span>
            <span>Back to Settings</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: 'var(--theme-text, #111827)' }}>
            SEO Sitemap
          </h1>
          <p style={{ margin: 0, color: 'var(--theme-elevation-600, #6b7280)', fontSize: 14, lineHeight: 1.6, maxWidth: 720 }}>
            Control what appears in <a href="/sitemap.xml" target="_blank" rel="noreferrer" style={linkStyle}>/sitemap.xml</a> and whether it is advertised in <a href="/robots.txt" target="_blank" rel="noreferrer" style={linkStyle}>/robots.txt</a>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || isSaving || isGenerating}
            style={{
              ...secondaryButtonStyle,
              opacity: isLoading || isSaving || isGenerating ? 0.65 : 1,
              cursor: isLoading || isSaving || isGenerating ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Now'}
          </button>

          <button
            type="submit"
            form="sitemap-settings-form"
            disabled={isLoading || isSaving || isGenerating}
            style={{
              ...primaryButtonStyle,
              opacity: isLoading || isSaving || isGenerating ? 0.65 : 1,
              cursor: isLoading || isSaving || isGenerating ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error ? (
        <div style={errorBannerStyle}>{error}</div>
      ) : null}

      {success ? (
        <div style={successBannerStyle}>{success}</div>
      ) : null}

      {isLoading ? (
        <div style={cardStyle}>
          <p style={{ margin: 0, color: 'var(--theme-elevation-600, #6b7280)' }}>Loading sitemap settings...</p>
        </div>
      ) : (
        <form id="sitemap-settings-form" onSubmit={handleSave}>
          <section style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Publishing</h2>
                <p style={sectionCopyStyle}>Turn the generated sitemap on or off without changing the route.</p>
              </div>
            </div>

            <label style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => {
                  const { checked } = event.target
                  setForm((current) => ({ ...current, enabled: checked }))
                }}
              />
              <span>Enable sitemap.xml generation</span>
            </label>
          </section>

          <section style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Generation Schedule</h2>
                <p style={sectionCopyStyle}>
                  The server cron checks every 15 minutes and only regenerates the sitemap when the saved schedule is due.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>Auto-Generation Frequency</span>
                <select
                  value={form.generationFrequency}
                  onChange={(event) => {
                    const nextValue = event.target.value as SitemapGenerationFrequency
                    setForm((current) => ({ ...current, generationFrequency: nextValue }))
                  }}
                  style={inputStyle}
                >
                  {SITEMAP_GENERATION_FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div style={generationStatsGridStyle}>
                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Frequency</div>
                  <div style={statValueStyle}>{formatGenerationFrequency(form.generationFrequency)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Last Generated</div>
                  <div style={statValueStyle}>{formatDateTime(form.lastGeneratedAt)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Next Scheduled Run</div>
                  <div style={statValueStyle}>{formatDateTime(form.nextScheduledGenerationAt)}</div>
                </div>

                <div style={statCardStyle}>
                  <div style={statLabelStyle}>Last URL Count</div>
                  <div style={statValueStyle}>
                    {typeof form.lastGeneratedCount === 'number' ? form.lastGeneratedCount : 'Not run yet'}
                  </div>
                </div>
              </div>

              <div style={generationStatusCardStyle}>
                <div style={statLabelStyle}>Last Result</div>
                <div style={statValueStyle}>
                  {form.lastGenerationStatus === 'success'
                    ? 'Success'
                    : form.lastGenerationStatus === 'failed'
                      ? 'Failed'
                      : 'Not run yet'}
                </div>
                <p style={{ ...sectionCopyStyle, marginTop: 8 }}>
                  {form.lastGenerationMessage || 'Use Generate Now to save the current settings and refresh sitemap.xml immediately.'}
                </p>
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Auto-Included Content</h2>
                <p style={sectionCopyStyle}>Choose which published collections are added automatically.</p>
              </div>
            </div>

            <div style={checkboxGridStyle}>
              {[
                ['pages', 'Published CMS pages'],
                ['posts', 'Published blog posts'],
                ['products', 'Active products'],
                ['services', 'Active services'],
                ['categories', 'Categories'],
              ].map(([key, label]) => (
                <label key={key} style={checkboxCardStyle}>
                  <input
                    type="checkbox"
                    checked={form.dynamicCollections[key as keyof SitemapDynamicCollectionsConfig]}
                    onChange={(event) => {
                      const { checked } = event.target
                      setForm((current) => ({
                        ...current,
                        dynamicCollections: {
                          ...current.dynamicCollections,
                          [key]: checked,
                        },
                      }))
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Static Routes</h2>
                <p style={sectionCopyStyle}>Add site-relative paths or full URLs. Full URLs are normalized back to paths when saved.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    staticEntries: [...current.staticEntries, createEmptyStaticEntry()],
                  }))
                }}
                style={secondaryButtonStyle}
              >
                Add Route
              </button>
            </div>

            {form.staticEntries.length === 0 ? (
              <div style={emptyStateStyle}>
                No static routes configured. Dynamic collections will still be included if enabled.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {form.staticEntries.map((entry, index) => (
                  <div key={index} style={staticEntryCardStyle}>
                    <div style={fieldGridStyle}>
                      <label style={fieldStyle}>
                        <span style={fieldLabelStyle}>Path</span>
                        <input
                          type="text"
                          value={entry.path}
                          onChange={(event) => {
                            const nextPath = event.target.value
                            setForm((current) => ({
                              ...current,
                              staticEntries: current.staticEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, path: nextPath } : item,
                              ),
                            }))
                          }}
                          placeholder="/contact"
                          style={inputStyle}
                        />
                      </label>

                      <label style={fieldStyle}>
                        <span style={fieldLabelStyle}>Change Frequency</span>
                        <select
                          value={entry.changeFrequency}
                          onChange={(event) => {
                            const nextValue = event.target.value as SitemapChangeFrequency
                            setForm((current) => ({
                              ...current,
                              staticEntries: current.staticEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, changeFrequency: nextValue } : item,
                              ),
                            }))
                          }}
                          style={inputStyle}
                        >
                          {SITEMAP_CHANGE_FREQUENCY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={fieldStyle}>
                        <span style={fieldLabelStyle}>Priority</span>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={entry.priority}
                          onChange={(event) => {
                            const nextValue = event.target.value
                            setForm((current) => ({
                              ...current,
                              staticEntries: current.staticEntries.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, priority: nextValue } : item,
                              ),
                            }))
                          }}
                          style={inputStyle}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            staticEntries: current.staticEntries.filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }}
                        style={removeButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Excluded Paths</h2>
                <p style={sectionCopyStyle}>Enter one site-relative path per line to keep it out of the generated sitemap.</p>
              </div>
            </div>

            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>Excluded Paths</span>
              <textarea
                value={form.excludePaths}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setForm((current) => ({ ...current, excludePaths: nextValue }))
                }}
                rows={8}
                placeholder={'/checkout\n/thank-you'}
                style={{ ...inputStyle, minHeight: 180, resize: 'vertical' }}
              />
            </label>
          </section>
        </form>
      )}
    </div>
  )
}

const linkStyle: React.CSSProperties = {
  color: 'var(--theme-success-600, #2563eb)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--theme-elevation-0, #ffffff)',
  border: '1px solid var(--theme-elevation-150, #e5e7eb)',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 18,
  flexWrap: 'wrap',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--theme-text, #111827)',
}

const sectionCopyStyle: React.CSSProperties = {
  margin: '6px 0 0',
  color: 'var(--theme-elevation-600, #6b7280)',
  fontSize: 14,
  lineHeight: 1.6,
}

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 14,
  color: 'var(--theme-text, #111827)',
}

const checkboxGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
}

const checkboxCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid var(--theme-elevation-150, #e5e7eb)',
  background: 'var(--theme-elevation-50, #f8fafc)',
  fontSize: 14,
}

const generationStatsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
}

const statCardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150, #e5e7eb)',
  borderRadius: 12,
  padding: '14px 16px',
  background: 'var(--theme-elevation-25, #fcfcfd)',
}

const generationStatusCardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150, #e5e7eb)',
  borderRadius: 12,
  padding: '14px 16px',
  background: 'var(--theme-elevation-25, #fcfcfd)',
}

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: 'var(--theme-elevation-600, #6b7280)',
}

const statValueStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--theme-text, #111827)',
}

const fieldGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(180px, 1fr) minmax(120px, 0.7fr)',
  gap: 12,
}

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: 'var(--theme-elevation-600, #6b7280)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--theme-elevation-200, #d1d5db)',
  borderRadius: 10,
  padding: '11px 12px',
  fontSize: 14,
  color: 'var(--theme-text, #111827)',
  background: 'var(--theme-elevation-0, #ffffff)',
}

const staticEntryCardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150, #e5e7eb)',
  borderRadius: 14,
  padding: 16,
  background: 'var(--theme-elevation-25, #fcfcfd)',
  display: 'grid',
  gap: 14,
}

const emptyStateStyle: React.CSSProperties = {
  padding: '16px 18px',
  borderRadius: 12,
  background: 'var(--theme-elevation-50, #f8fafc)',
  color: 'var(--theme-elevation-600, #6b7280)',
  fontSize: 14,
}

const primaryButtonStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 999,
  background: '#111827',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 600,
  padding: '11px 18px',
}

const secondaryButtonStyle: React.CSSProperties = {
  appearance: 'none',
  border: '1px solid var(--theme-elevation-200, #d1d5db)',
  borderRadius: 999,
  background: 'var(--theme-elevation-0, #ffffff)',
  color: 'var(--theme-text, #111827)',
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 16px',
  cursor: 'pointer',
}

const removeButtonStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  background: 'transparent',
  color: '#b91c1c',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
}

const errorBannerStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: '13px 16px',
  borderRadius: 12,
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#b91c1c',
  fontSize: 14,
}

const successBannerStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: '13px 16px',
  borderRadius: 12,
  border: '1px solid #bbf7d0',
  background: '#f0fdf4',
  color: '#166534',
  fontSize: 14,
}
