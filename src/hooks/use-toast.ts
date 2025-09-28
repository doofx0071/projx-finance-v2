import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const toast = {
  success: (props: ToastProps) => {
    return sonnerToast.success(props.title, {
      description: props.description,
      action: props.action ? {
        label: props.action.label,
        onClick: props.action.onClick,
      } : undefined,
    })
  },

  error: (props: ToastProps) => {
    return sonnerToast.error(props.title, {
      description: props.description,
      action: props.action ? {
        label: props.action.label,
        onClick: props.action.onClick,
      } : undefined,
    })
  },

  info: (props: ToastProps) => {
    return sonnerToast.info(props.title, {
      description: props.description,
      action: props.action ? {
        label: props.action.label,
        onClick: props.action.onClick,
      } : undefined,
    })
  },

  warning: (props: ToastProps) => {
    return sonnerToast.warning(props.title, {
      description: props.description,
      action: props.action ? {
        label: props.action.label,
        onClick: props.action.onClick,
      } : undefined,
    })
  },

  loading: (message: string) => {
    return sonnerToast.loading(message)
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}