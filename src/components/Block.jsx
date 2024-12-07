import { useState, useEffect, useRef } from 'react'
import SHA256 from 'crypto-js/sha256'

const Block = () => {
  const [blockData, setBlockData] = useState({
    blockNumber: 1,
    timestamp: new Date().toISOString(),
    transactions: '',
    nonce: 0,
    previousHash: '0'.repeat(64),
    difficulty: 1
  })
  const [hash, setHash] = useState('')
  const [miningStatus, setMiningStatus] = useState({
    isMinning: false,
    currentNonce: 0
  })
  const stopMiningRef = useRef(false)

  const calculateHash = (data) => {
    const { blockNumber, timestamp, transactions, nonce, previousHash } = data
    const blockString = `${blockNumber}${timestamp}${transactions}${nonce}${previousHash}`
    return SHA256(blockString).toString()
  }

  const stopMining = () => {
    stopMiningRef.current = true
  }

  const mine = async () => {
    if (miningStatus.isMinning) {
      stopMining()
      return
    }

    stopMiningRef.current = false
    setMiningStatus({
      isMinning: true,
      currentNonce: blockData.nonce
    })

    let nonce = blockData.nonce
    let currentHash = ''
    const target = '0'.repeat(blockData.difficulty)

    const mineBlock = async () => {
      while (!currentHash.startsWith(target)) {
        if (stopMiningRef.current) {
          // Update block data with current nonce when stopping
          setBlockData(prev => ({ ...prev, nonce }))
          setMiningStatus({
            isMinning: false,
            currentNonce: nonce
          })
          return
        }

        nonce++
        const tempBlock = { ...blockData, nonce }
        currentHash = calculateHash(tempBlock)
        
        // Update mining status every 100 iterations
        if (nonce % 100 === 0) {
          setMiningStatus(prev => ({
            ...prev,
            currentNonce: nonce
          }))
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }

      setBlockData(prev => ({ ...prev, nonce }))
      setHash(currentHash)
      setMiningStatus({
        isMinning: false,
        currentNonce: nonce
      })
    }

    mineBlock()
  }

  const updateBlockData = (field, value) => {
    if (field === 'timestamp') return
    setBlockData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const newHash = calculateHash(blockData)
    setHash(newHash)
  }, [blockData])

  return (
    <div className="section">
      <div className="section-header">
        <h2>Block Demo</h2>
        <p className="description">
          A block in a blockchain contains data and must be mined by finding a nonce that gives a hash 
          starting with the required number of zeros (difficulty). Try changing the data or difficulty 
          and watch how it affects the hash.
        </p>
      </div>

      <div className="card">
        <div className="grid">
          <div className="input-group">
            <label>
              <span>Block Number</span>
              <input
                type="number"
                value={blockData.blockNumber}
                onChange={(e) => updateBlockData('blockNumber', parseInt(e.target.value) || 0)}
                min={0}
                className="mono"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <span>Timestamp</span>
              <input
                type="text"
                value={blockData.timestamp}
                readOnly
                className="mono"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <span>Transactions</span>
              <textarea
                value={blockData.transactions}
                onChange={(e) => updateBlockData('transactions', e.target.value)}
                placeholder="Enter transaction data..."
                className="transactions-input mono"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <span>Nonce</span>
              <input
                type="number"
                value={miningStatus.isMinning ? miningStatus.currentNonce : blockData.nonce}
                readOnly
                className={`mono ${miningStatus.isMinning ? 'mining' : ''}`}
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <span>Previous Hash</span>
              <input
                type="text"
                value={blockData.previousHash}
                readOnly
                className="mono"
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <span>Difficulty (number of leading zeros)</span>
              <input
                type="number"
                value={blockData.difficulty}
                onChange={(e) => updateBlockData('difficulty', Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={6}
                disabled={miningStatus.isMinning}
                className={miningStatus.isMinning ? 'mining' : ''}
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              <span>Block Hash</span>
              <div className="hash-output mono">
                {hash || calculateHash(blockData)}
              </div>
            </label>
          </div>

          <div className="input-group">
            <button 
              onClick={mine}
              className={`btn primary ${miningStatus.isMinning ? 'mining' : ''}`}
            >
              {miningStatus.isMinning ? (
                <>
                  <span className="spinner"></span>
                  Stop Mining
                </>
              ) : 'Mine Block'}
            </button>
            <div className="valid-indicator">
              {hash.startsWith('0'.repeat(blockData.difficulty)) 
                ? '✅ Valid Block (meets difficulty)' 
                : '❌ Invalid Block (does not meet difficulty)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Block
