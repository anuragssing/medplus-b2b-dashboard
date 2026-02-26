import { useState } from 'react'
import { Form } from 'react-bootstrap'

const MANDATORY_MSG = 'This field is mandatory'

/**
 * CRM/Finance ERP style: floating label, no asterisk, blur validation.
 * When required and user leaves field empty on blur, shows red border + icon + "This field is mandatory".
 * Uses react-bootstrap Form (from react common components stack).
 */
export default function FloatingFormField({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  readOnly = false,
  disabled = false,
  error,
  setError,
  maxLength,
  inputMode,
  autoComplete,
  className,
  ...rest
}) {
  const [touched, setTouched] = useState(false)
  const showError = error !== undefined ? !!error : touched && required && !(value != null && String(value).trim() !== '')

  const handleBlur = (e) => {
    setTouched(true)
    if (required && !(value != null && String(value).trim() !== '')) {
      setError?.(MANDATORY_MSG)
    } else {
      setError?.(null)
    }
    onBlur?.(e)
  }

  const handleChange = (e) => {
    const v = e.target.value
    onChange?.(e)
    if (touched && required && v.trim() !== '') setError?.(null)
  }

  const displayError = showError ? (typeof error === 'string' ? error : MANDATORY_MSG) : null
  const hasValue = value != null && String(value).trim() !== ''

  return (
    <div className={`bd-floating-field ${displayError ? 'bd-floating-field--error' : ''} ${hasValue ? 'bd-floating-field--has-value' : ''} ${className || ''}`}>
      <Form.FloatingLabel controlId={id || name} label={label}>
        <Form.Control
          name={name}
          type={type}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=" "
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete ?? 'off'}
          isInvalid={!!displayError}
          aria-invalid={!!displayError}
          {...rest}
        />
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
