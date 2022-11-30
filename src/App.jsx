import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import React, { useEffect, useState } from 'react'
import kp from '../keypair.json'
import './App.css'
import twitterLogo from './assets/twitter-logo.svg'
// Other imports...
// Add this 2 new lines
import { Buffer } from 'buffer'
window.Buffer = Buffer
// Constants
const TWITTER_HANDLE = '_buildspace'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
const programID = new PublicKey('h6W5YTiih4u9QBqeYJKUvXaRAqxSBYGEawn2eL6NqYR')

// Set our network to devnet.
const network = clusterApiUrl('devnet')

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: 'processed',
}

// All your other Twitter and GIF constants you had.
const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [gifList, setGifList] = useState([])

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      console.log(window)
      const { solana } = window

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!')
          const response = await solana.connect({ onlyIfTrusted: true })
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          )

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString())
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    const { solana } = window

    if (solana) {
      const response = await solana.connect()
      console.log('Connected with Public Key:', response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No gif link given!')
      return
    }
    setInputValue('')
    console.log('Gif link:', inputValue)
    try {
      const provider = getProvider()
      const program = await getProgram()

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })
      console.log('GIF successfully sent to program', inputValue)

      await getGifList()
    } catch (error) {
      console.log('Error sending GIF:', error)
    }
  }
  const onInputChange = (event) => {
    const { value } = event.target
    setInputValue(value)
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    )
    return provider
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider()
      const program = await getProgram()

      console.log('ping')
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      })
      console.log(
        'Created a new BaseAccount w/ address:',
        baseAccount.publicKey.toString()
      )
      await getGifList()
    } catch (error) {
      console.log('Error creating BaseAccount account:', error)
    }
  }

  const onClickUpvote = async (gifLink) => {
    try {
      const provider = getProvider()
      const program = await getProgram()

      await program.rpc.upvote(gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })
      await getGifList()
    } catch (err) {
      console.log('Error creating BaseAccount account:', err)
    }
  }

  const onClickDonate = async (item) => {
    try {
      const provider = getProvider()
      const program = await getProgram()

      const value = new BN(50000000)
      await program.rpc.sendSol(value, item.gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          donator: provider.wallet.publicKey,
          gifOwner: item.userAddress,
          systemProgram: SystemProgram.programId,
        },
      })

      await getGifList()
    } catch (err) {
      console.log('Error creating BaseAccount account:', err)
    }
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    }
    // Otherwise, we're good! Account exists. User can submit GIFs.
    else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendGif()
            }}
          >
            <input
              type="text"
              placeholder="Enter gif link!"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>
          <div className="gif-grid">
            {/* We use index as the key instead, also, the src is now item.gifLink */}
            {gifList.map((item, index) => {
              return (
                <div className="gif-item" key={index}>
                  <img src={item.gifLink} />
                  <div className="git-detail">
                    <p>Uploaded By: {item.userAddress.toString()}</p>
                    <p>Votes: {item.votes}</p>
                    <p>Donated: {item.donated ? item.donated.toString() : 0}</p>
                  </div>
                  <button onClick={() => onClickUpvote(item.gifLink)}>
                    Vote
                  </button>
                  <button onClick={() => onClickDonate(item)}>Donate</button>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  const getProgram = async () => {
    // Get metadata about your solana program
    const idl = await Program.fetchIdl(programID, getProvider())
    // Create a program that you can call
    return new Program(idl, programID, getProvider())
  }

  const getGifList = async () => {
    try {
      const program = await getProgram()
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      )

      console.log('account.gifList: ', account.gifList)
      console.log('Got the account', account)
      setGifList(account.gifList)
    } catch (error) {
      console.log('Error in getGifList: ', error)
      setGifList(null)
    }
  }

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...')
      getGifList()
    }
  }, [walletAddress])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
