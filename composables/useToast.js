import { h } from 'vue'
import { toast } from 'vue-sonner'
import CustomToastCard from '~/components/Commons/CustomToastCard.vue'
import { useSound } from './useSound'

export const useToast = () => {
  const { playNotificationSound } = useSound()
  const success = (title) => {
    playNotificationSound('success')
    return toast.custom(
      (t) => h(CustomToastCard, {
        type: 'success',
        title,
        toastId: t
      }),
      {
        duration: 2000
      }
    )
  }

  const error = (title) => {
    playNotificationSound('error')
    return toast.custom(
      (t) => h(CustomToastCard, {
        type: 'error',
        title,
        toastId: t
      }),
      {
        duration: 2000
      }
    )
  }

  const info = (title) => {
    playNotificationSound('info')
    return toast.custom(
      (t) => h(CustomToastCard, {
        type: 'info',
        title,
        toastId: t
      }),
      {
        duration: 2000
      }
    )
  }

  const warning = (title) => {
    playNotificationSound('warning')
    return toast.custom(
      (t) => h(CustomToastCard, {
        type: 'warning',
        title,
        toastId: t
      }),
      {
        duration: 2000
      }
    )
  }

  const loading = (title) => {
    playNotificationSound('loading')
    return toast.custom(
      (t) => h(CustomToastCard, {
        type: 'loading',
        title,
        toastId: t
      }),
      {
        duration: 0 // Loading toasts no se auto-cierran
      }
    )
  }

  const dismiss = (id) => {
    return toast.dismiss(id)
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss
  }
}