'use client'

import React, { useState } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

const MaskedTextField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path: path || field.name })
  const [visible, setVisible] = useState(false)

  return (
    <div className="field-type text masked-field">
      <FieldLabel label={field.label || field.name} path={path || field.name} />
      {field.admin?.description && (
        <div className="masked-field__description">
          <p>
            {typeof field.admin.description === 'string' ? field.admin.description : null}
          </p>
        </div>
      )}
      <div className="masked-field__input-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          className="masked-field__input"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="masked-field__toggle"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default MaskedTextField
