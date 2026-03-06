'use client'

import React, { useState } from 'react'
import { useField, TextInput, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

const MaskedTextField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path: path || field.name })
  const [visible, setVisible] = useState(false)

  return (
    <div className="field-type text" style={{ marginBottom: '1.5rem' }}>
      <FieldLabel label={field.label || field.name} path={path || field.name} />
      {field.admin?.description && (
        <div className="field-description" style={{ marginBottom: 8 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)' }}>
            {typeof field.admin.description === 'string' ? field.admin.description : null}
          </p>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <TextInput
          path={path || field.name}
          value={value || ''}
          onChange={(e) => setValue(typeof e === 'string' ? e : (e?.target as HTMLInputElement)?.value || '')}
          showError={false}
          label=""
          name={field.name}
          style={{
            WebkitTextSecurity: visible ? 'none' : 'disc',
          } as React.CSSProperties}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '0.8rem',
            color: 'var(--theme-elevation-400)',
            fontFamily: 'inherit',
          }}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default MaskedTextField
