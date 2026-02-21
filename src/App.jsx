import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from 'antd';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Button type="primary">Primary Button</Button>
    </>
  )
}

export default App
