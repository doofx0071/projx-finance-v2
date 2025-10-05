"use client"

import * as React from "react"
import { useScreenReaderAnnounce } from "@/hooks/use-accessibility"

/**
 * AccessibleForm Component
 * 
 * Wrapper component that adds accessibility features to forms:
 * - Screen reader announcements for form submission
 * - Loading state management with aria-busy
 * - Error announcements
 * - Success announcements
 * 
 * @example
 * ```tsx
 * <AccessibleForm
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 *   submitSuccess={submitSuccess}
 *   submitError={submitError}
 *   successMessage="Form submitted successfully"
 *   errorMessage="Failed to submit form"
 * >
 *   <form>...</form>
 * </AccessibleForm>
 * ```
 */

interface AccessibleFormProps {
  children: React.ReactNode
  isSubmitting?: boolean
  submitSuccess?: boolean
  submitError?: boolean
  successMessage?: string
  errorMessage?: string
  formLabel?: string
}

export function AccessibleForm({
  children,
  isSubmitting = false,
  submitSuccess = false,
  submitError = false,
  successMessage = "Form submitted successfully",
  errorMessage = "Failed to submit form",
  formLabel,
}: AccessibleFormProps) {
  const announce = useScreenReaderAnnounce()
  const previousSubmitting = React.useRef(isSubmitting)

  // Announce when form submission starts
  React.useEffect(() => {
    if (isSubmitting && !previousSubmitting.current) {
      announce("Submitting form...", "polite")
    }
    previousSubmitting.current = isSubmitting
  }, [isSubmitting, announce])

  // Announce success
  React.useEffect(() => {
    if (submitSuccess) {
      announce(successMessage, "polite")
    }
  }, [submitSuccess, successMessage, announce])

  // Announce error
  React.useEffect(() => {
    if (submitError) {
      announce(errorMessage, "assertive")
    }
  }, [submitError, errorMessage, announce])

  return (
    <div
      aria-busy={isSubmitting}
      aria-label={formLabel}
      role="region"
    >
      {children}
    </div>
  )
}

/**
 * FormFieldset Component
 * 
 * Accessible fieldset component for grouping related form fields
 * 
 * @example
 * ```tsx
 * <FormFieldset legend="Personal Information">
 *   <FormField>...</FormField>
 *   <FormField>...</FormField>
 * </FormFieldset>
 * ```
 */

interface FormFieldsetProps {
  legend: string
  children: React.ReactNode
  className?: string
}

export function FormFieldset({ legend, children, className }: FormFieldsetProps) {
  return (
    <fieldset className={className}>
      <legend className="text-lg font-semibold mb-4">{legend}</legend>
      {children}
    </fieldset>
  )
}

/**
 * FormStatus Component
 * 
 * Displays form status messages with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <FormStatus
 *   type="error"
 *   message="Please fill in all required fields"
 * />
 * ```
 */

interface FormStatusProps {
  type: "success" | "error" | "info" | "warning"
  message: string
  className?: string
}

export function FormStatus({ type, message, className }: FormStatusProps) {
  const roleMap = {
    success: "status",
    error: "alert",
    info: "status",
    warning: "alert",
  }

  const ariaLiveMap = {
    success: "polite" as const,
    error: "assertive" as const,
    info: "polite" as const,
    warning: "assertive" as const,
  }

  const colorMap = {
    success: "text-green-600 bg-green-50 border-green-200",
    error: "text-red-600 bg-red-50 border-red-200",
    info: "text-blue-600 bg-blue-50 border-blue-200",
    warning: "text-amber-600 bg-amber-50 border-amber-200",
  }

  return (
    <div
      role={roleMap[type]}
      aria-live={ariaLiveMap[type]}
      className={`p-3 rounded-md border ${colorMap[type]} ${className || ""}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

/**
 * RequiredFieldIndicator Component
 * 
 * Accessible indicator for required form fields
 * 
 * @example
 * ```tsx
 * <FormLabel>
 *   Name <RequiredFieldIndicator />
 * </FormLabel>
 * ```
 */

export function RequiredFieldIndicator() {
  return (
    <span
      aria-label="required"
      className="text-destructive"
      role="presentation"
    >
      *
    </span>
  )
}

/**
 * FormInstructions Component
 * 
 * Provides instructions for form completion with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <FormInstructions id="form-instructions">
 *   Please fill in all required fields marked with an asterisk (*)
 * </FormInstructions>
 * ```
 */

interface FormInstructionsProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function FormInstructions({ id, children, className }: FormInstructionsProps) {
  return (
    <div
      id={id}
      className={`text-sm text-muted-foreground mb-4 ${className || ""}`}
      role="region"
      aria-label="Form instructions"
    >
      {children}
    </div>
  )
}

