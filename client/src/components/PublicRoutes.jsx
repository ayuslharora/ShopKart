import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import Loading from './Loading'

function PublicRoutes({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <Loading />
    }

    if (user) {
        return <Navigate to="/home" replace />
    }

    return children
}

export default PublicRoutes