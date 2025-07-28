import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import TodoApp from './components/Todo-App'
import PasswordReset from './components/PasswordReset'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/signup' element={<SignUp />}/>
      <Route path='/todoApp' element={<TodoApp />} />
      <Route path='/passwordreset' element={<PasswordReset />} />
    </Routes>
  )
}

export default App