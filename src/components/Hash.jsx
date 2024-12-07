import { useState, useEffect } from 'react'
import SHA256 from 'crypto-js/sha256'

const Hash = () => {
  const [input, setInput] = useState('')
  const [hash, setHash] = useState('')

  useEffect(() => {
    if (input) {
      const hashValue = SHA256(input).toString()
      setHash(hashValue)
    } else {
      setHash('')
    }
  }, [input])

  return (
    <div className="section">
      <div className="section-header">
        <h2>Hash Demo</h2>
        <p className="description">
          A hash function converts data of any size into a fixed-size output. 
          The same input will always produce the same hash, but changing even one character 
          will result in a completely different hash.
        </p>
      </div>

      <div className="card">
        <div className="input-group">
          <label>
            <span>Data</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something to hash..."
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            <span>Hash (SHA256)</span>
            <div className="hash-output">
              {hash || 'Hash will appear here...'}
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

export default Hash
