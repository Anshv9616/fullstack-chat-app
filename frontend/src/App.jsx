import React, { use, useEffect } from 'react'
import Navbar from './components/Navbar'
import {Navigate, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import Login from './pages/Login'
import {useAuthStore} from './store/useAuthStore.js'
import {Loader} from 'lucide-react'
import { Toaster } from 'react-hot-toast'
const App = () => {
   const{authUser,checkAuth,isCheckingAuth,onlineUsers}=useAuthStore();
   console.log("online users",onlineUsers)
   useEffect(()=>{
      checkAuth();
   },[checkAuth]);

    if(isCheckingAuth && !authUser )  {
      return <div className='flex justify-center items-center h-screen '>
        <Loader className='animate-spin size-11'/>
      </div> }
  return (
    <div className="">
       <Navbar/>

        <Routes>
          <Route path='/' element={authUser ?<Home/>:<Navigate to="/login"/>}/>
          <Route path='/login' element={!authUser?<Login/>:<Navigate to="/"/>}/>
          <Route path='/signup' element={!authUser?<SignUp/>:<Navigate to="/"/>}/>
          <Route path='/profile' element={authUser?<Profile/>:<Navigate to="/login"/>}/>
        
        </Routes>
        <Toaster/>
    </div>
  )
}

export default App