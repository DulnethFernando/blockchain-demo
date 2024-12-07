import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hash from './components/Hash'
import Block from './components/Block'
import Blockchain from './components/Blockchain'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Hash />} />
            <Route path="/hash" element={<Hash />} />
            <Route path="/block" element={<Block />} />
            <Route path="/blockchain" element={<Blockchain />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
