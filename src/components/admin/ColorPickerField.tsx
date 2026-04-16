'use client'

import React from 'react'
import { useField, TextInput, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

export default function ColorPickerField(props: TextFieldClientProps) {
  const { field, path } = props
  const { value = '', setValue } = useField<string>({ path: path || field.name })

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === '') {
      setValue(v)
    }
  }

  return (
    <div className="field-type text" style={{ marginBottom: 20 }}>
      <FieldLabel label={field.label || field.name} path={path || field.name} />
      {field.admin?.description && (
        <div className="field-description" style={{ marginBottom: 8 }}>
          {typeof field.admin.description === 'string' ? field.admin.description : null}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={handleColorChange}
          style={{
            width: 44,
            height: 44,
            padding: 2,
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 8,
            cursor: 'pointer',
            background: 'var(--theme-input-bg)',
          }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={handleTextChange}
          placeholder="#000000"
          style={{
            flex: 1,
            maxWidth: 140,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            fontSize: '0.95rem',
            fontFamily: 'monospace',
          }}
        />
        {value && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: value,
              border: '1px solid var(--theme-elevation-200)',
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </div>
  )
}
