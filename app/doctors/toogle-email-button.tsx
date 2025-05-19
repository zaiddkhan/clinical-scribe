'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { toggleDoctorEmailStatus } from '@/app/actions/doctor'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ToggleEmailButtonProps {
  doctorId: string
  emailSent: boolean
  onSuccess?: (newStatus: boolean) => void
}

/**
 * Button component that toggles a doctor's contacted status
 */
const ToggleEmailButton: React.FC<ToggleEmailButtonProps> = ({
  doctorId,
  emailSent,
  onSuccess
}) => {
  const { toast } = useToast()
  const [isPending, setIsPending] = React.useState(false)
  const [currentStatus, setCurrentStatus] = React.useState(emailSent)

  // Handle the toggle action
  const handleToggle = async () => {
    setIsPending(true)
    
    try {
      const result = await toggleDoctorEmailStatus(doctorId)
      
      if (result.success && result.data) {
        setCurrentStatus(result.data.email_sent)
        
        toast({
          title: 'Contact Status Updated',
          description: result.message,
        })
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.data.email_sent)
        }
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update contact status',
        variant: 'destructive'
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant={currentStatus ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-1"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : currentStatus ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      <span>{currentStatus ? 'Mark as not contacted' : 'Mark as contacted'}</span>
    </Button>
  )
}

export default ToggleEmailButton