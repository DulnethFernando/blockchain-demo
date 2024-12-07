import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">Blockchain Demo</h1>
        <div className="navbar-links">
          <button
            className={`nav-button ${isActive('/hash') || isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/hash')}
          >
            Hash
          </button>
          <button
            className={`nav-button ${isActive('/block') ? 'active' : ''}`}
            onClick={() => navigate('/block')}
          >
            Block
          </button>
          <button
            className={`nav-button ${isActive('/blockchain') ? 'active' : ''}`}
            onClick={() => navigate('/blockchain')}
          >
            Blockchain
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
