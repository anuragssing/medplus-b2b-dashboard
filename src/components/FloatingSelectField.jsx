import { useState } from 'react'
import { Form } from 'react-bootstrap'

const MANDATORY_MSG = 'This field is mandatory'

/**
 * Floating label select; no asterisk; blur validation with "This field is mandatory" (CRM style).
 */
export default function FloatingSelectField({
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  readOnly = false,
  disabled = false,
  error,
  setError,
  children,
  className,
  ...rest
}) {
  const [touched, setTouched] = useState(false)
  const isEmpty = value == null || String(value).trim() === ''
  const showError = error !== undefined ? !!error : touched && required && isEmpty

  const handleBlur = (e) => {
    setTouched(true)
    if (required && isEmpty) setError?.(MANDATORY_MSG)
    else setError?.(null)
    onBlur?.(e)
  }

  const handleChange = (e) => {
    onChange?.(e)
    if (touched && required && e.target.value.trim() !== '') setError?.(null)
  }

  const displayError = showError ? (typeof error === 'string' ? error : MANDATORY_MSG) : null
  const hasValue = !isEmpty

  return (
    <div className={`bd-floating-field ${displayError ? 'bd-floating-field--error' : ''} ${hasValue ? 'bd-floating-field--has-value' : ''} ${className || ''}`}>
      <Form.FloatingLabel controlId={id || name} label={label}>
        <Form.Select
          name={name}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          isInvalid={!!displayError}
          aria-invalid={!!displayError}
          {...rest}
        >
          {children}
        </Form.Select>
      </Form.FloatingLabel>
      {displayError && (
        <div className="bd-field-error-msg" role="alert">
          <span className="bd-field-error-icon" aria-hidden>!</span>
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}
