import { useState, useEffect, useRef } from 'react'
import SHA256 from 'crypto-js/sha256'

const BlockchainDemo = () => {
  const [blocks, setBlocks] = useState([
    {
      blockNumber: 1,
      timestamp: new Date().toISOString(),
      transactions: '',
      nonce: 0,
      previousHash: '0'.repeat(64),
      difficulty: 1,
      hash: ''
    }
  ])
  const [miningStatus, setMiningStatus] = useState({
    isMinning: false,
    blockIndex: null,
    currentNonce: 0
  })

  const stopMiningRef = useRef(false)

  const calculateHash = (block) => {
    const { blockNumber, timestamp, transactions, nonce, previousHash } = block
    const blockString = `${blockNumber}${timestamp}${transactions}${nonce}${previousHash}`
    return SHA256(blockString).toString()
  }

  const stopMining = () => {
    stopMiningRef.current = true
  }

  const mineBlock = async (index) => {
    if (miningStatus.isMinning) {
      stopMining()
      return
    }

    stopMiningRef.current = false
    setMiningStatus({
      isMinning: true,
      blockIndex: index,
      currentNonce: blocks[index].nonce
    })

    const updatedBlocks = [...blocks]
    const block = { ...updatedBlocks[index] }
    let nonce = block.nonce
    let hash = ''
    const target = '0'.repeat(block.difficulty)

    const mine = async () => {
      while (!hash.startsWith(target)) {
        if (stopMiningRef.current) {
          // Keep current nonce when stopping
          block.nonce = nonce
          block.hash = calculateHash(block)
          updatedBlocks[index] = block

          setBlocks(updatedBlocks)
          setMiningStatus({
            isMinning: false,
            blockIndex: null,
            currentNonce: nonce
          })
          return
        }

        nonce++
        block.nonce = nonce
        hash = calculateHash(block)
        
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

      block.nonce = nonce
      block.hash = hash
      updatedBlocks[index] = block

      // Update all subsequent blocks
      for (let i = index + 1; i < updatedBlocks.length; i++) {
        updatedBlocks[i] = {
          ...updatedBlocks[i],
          previousHash: updatedBlocks[i - 1].hash
        }
        updatedBlocks[i].hash = calculateHash(updatedBlocks[i])
      }

      setBlocks(updatedBlocks)
      setMiningStatus({
        isMinning: false,
        blockIndex: null,
        currentNonce: 0
      })
    }

    try {
      await mine()
    } catch (error) {
      console.error('Mining error:', error)
      setMiningStatus({
        isMinning: false,
        blockIndex: null,
        currentNonce: nonce
      })
    }
  }

  useEffect(() => {
    const genesisBlock = blocks[0]
    const hash = calculateHash(genesisBlock)
    setBlocks([{ ...genesisBlock, hash }])
  }, [])

  const addBlock = () => {
    const previousBlock = blocks[blocks.length - 1]
    const newBlock = {
      blockNumber: previousBlock.blockNumber + 1,
      timestamp: new Date().toISOString(),
      transactions: '',
      nonce: 0,
      previousHash: previousBlock.hash || calculateHash(previousBlock),
      difficulty: 1,
      hash: ''
    }
    newBlock.hash = calculateHash(newBlock)
    setBlocks([...blocks, newBlock])
  }

  const updateBlockData = (index, field, value) => {
    if (field === 'timestamp') return // Prevent timestamp updates
    
    const updatedBlocks = [...blocks]
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      [field]: value
    }

    // Update hash for the current block and all subsequent blocks
    for (let i = index; i < updatedBlocks.length; i++) {
      updatedBlocks[i].hash = calculateHash(updatedBlocks[i])
      if (i < updatedBlocks.length - 1) {
        updatedBlocks[i + 1].previousHash = updatedBlocks[i].hash
      }
    }

    setBlocks(updatedBlocks)
  }

  const isBlockValid = (block, index) => {
    if (index === 0) {
      return block.hash.startsWith('0'.repeat(block.difficulty))
    }

    const previousBlock = blocks[index - 1]
    const hashIsValid = block.hash.startsWith('0'.repeat(block.difficulty))
    const previousHashIsValid = block.previousHash === previousBlock.hash
    const calculatedHashIsValid = block.hash === calculateHash(block)

    return hashIsValid && previousHashIsValid && calculatedHashIsValid
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Blockchain Demo</h2>
        <p className="description">
          A blockchain is a chain of blocks where each block contains data and a reference to the 
          previous block's hash. Each block must be mined (finding a nonce that gives a hash starting 
          with the required number of zeros) and any change to a block invalidates it and all subsequent blocks.
        </p>
        <button onClick={addBlock} className="add-block-btn">
          Add Block
        </button>
      </div>

      <div className="blockchain">
        {blocks.map((block, index) => (
          <div key={index} className={`card blockchain-block ${!isBlockValid(block, index) ? 'invalid' : ''}`}>
            <div className="block-header">
              <span className="block-index">Block #{block.blockNumber}</span>
              <span className={`block-status ${isBlockValid(block, index) ? 'valid' : 'invalid'}`}>
                {isBlockValid(block, index) ? '✅ Valid' : '❌ Invalid'}
              </span>
            </div>

            <div className="block-content">
              <div className="input-group">
                <label>
                  <span>Block Number</span>
                  <input
                    type="number"
                    value={block.blockNumber}
                    readOnly
                    className="mono"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span>Timestamp</span>
                  <input
                    type="text"
                    value={block.timestamp}
                    readOnly
                    className="mono"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span>Transactions</span>
                  <textarea
                    value={block.transactions}
                    onChange={(e) => updateBlockData(index, 'transactions', e.target.value)}
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
                    value={miningStatus.isMinning && miningStatus.blockIndex === index 
                      ? miningStatus.currentNonce 
                      : block.nonce}
                    readOnly
                    className={`mono ${miningStatus.isMinning && miningStatus.blockIndex === index ? 'mining' : ''}`}
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span>Previous Hash</span>
                  <input
                    type="text"
                    value={block.previousHash}
                    readOnly
                    className="mono"
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span>Difficulty</span>
                  <input
                    type="number"
                    value={block.difficulty}
                    onChange={(e) => updateBlockData(index, 'difficulty', Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={6}
                    disabled={miningStatus.isMinning && miningStatus.blockIndex === index}
                    className={miningStatus.isMinning && miningStatus.blockIndex === index ? 'mining' : ''}
                  />
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span>Hash</span>
                  <div className="hash-output mono">
                    {block.hash}
                  </div>
                </label>
              </div>

              <div className="input-group">
                <button 
                  onClick={() => mineBlock(index)}
                  className={`btn primary ${miningStatus.isMinning && miningStatus.blockIndex === index ? 'mining' : ''}`}
                >
                  {miningStatus.isMinning && miningStatus.blockIndex === index ? (
                    <>
                      <span className="spinner"></span>
                      Stop Mining
                    </>
                  ) : 'Mine Block'}
                </button>
                <div className="valid-indicator">
                  {block.hash.startsWith('0'.repeat(block.difficulty)) 
                    ? '✅ Valid Block (meets difficulty)' 
                    : '❌ Invalid Block (does not meet difficulty)'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlockchainDemo
