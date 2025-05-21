
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useState, useEffect } from "react"

export function Toaster() {
  const { toasts } = useToast()
  const [visibleToasts, setVisibleToasts] = useState<any[]>([])
  const [hiddenCount, setHiddenCount] = useState(0)
  const maxVisibleToasts = 2;
  
  useEffect(() => {
    // Show only first 2 toasts, count the rest
    if (toasts.length > maxVisibleToasts) {
      setVisibleToasts(toasts.slice(0, maxVisibleToasts))
      setHiddenCount(toasts.length - maxVisibleToasts)
    } else {
      setVisibleToasts(toasts)
      setHiddenCount(0)
    }
  }, [toasts])

  return (
    <ToastProvider>
      {visibleToasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      
      {hiddenCount > 0 && (
        <div 
          className="fixed bottom-0 right-0 mb-20 mr-4 bg-background border border-border rounded-md px-3 py-1 text-xs font-medium shadow-md cursor-pointer z-50"
          onClick={() => {
            // Show all toasts when clicked
            setVisibleToasts(toasts);
            setHiddenCount(0);
          }}
        >
          +{hiddenCount} more notifications
        </div>
      )}
      
      <ToastViewport />
    </ToastProvider>
  )
}
