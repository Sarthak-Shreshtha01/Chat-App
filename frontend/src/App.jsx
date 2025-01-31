import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import {Loader} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'
const App = () => {

  const {authUser, checkAuth , isCheckingAuth , onlineUsers } = useAuthStore()
  const {theme, setTheme} = useThemeStore()
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({authUser})
  console.log({onlineUsers})
  if(isCheckingAuth && !authUser){
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader className='animate-spin text-blue-500' />
      </div>
    )
  }
  
  return (
    <div data-theme={theme} >
      
      <Navbar />

      <Routes>
        <Route path='/' element={ authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path='/signup' element={ !authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/login' element={ !authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={ authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>

      <Toaster />

    </div>
  )
}

export default App
