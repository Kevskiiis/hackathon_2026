import { useState } from 'react'
import LandingPage from './landing_page'
import HomePage from './home_page'

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState (false)
  
  if (isLoggedIn) {
    return <HomePage user={user} onLogout={() => setUser(null)}/>
  }

  return <LandingPage onSubmit={(values) => setUser(values)} />
}