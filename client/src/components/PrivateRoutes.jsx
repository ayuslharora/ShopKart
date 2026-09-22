import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import Loading from './Loading'

function PrivateRoutes({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <Loading />
    }

    if (!user) {
        return <Navigate to='/login' replace />
    }

    return children
}

export default PrivateRoutes