import React from 'react'
import AppLayout from '@/components/Layouts/AppLayout'
import { useAuth } from '@/hooks/auth'

const profile = () => {

  const { user } = useAuth({ middleware: 'auth' }) 

  return (
    <AppLayout>
      
    </AppLayout>
  )
}

export default profile