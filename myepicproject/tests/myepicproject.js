const anchor = require('@project-serum/anchor')
const { SystemProgram } = anchor.web3

const main = async () => {
  console.log('🚀 Starting test...')

  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Myepicproject
  const baseAccount = anchor.web3.Keypair.generate()

  console.log('test: ', {
    baseAccount: baseAccount.publicKey,
    user: provider.wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  let tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  })
  console.log('📝 Your transaction signature', tx)

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey)
  console.log('👀 GIF Count', account.totalGifs.toString())

  // You'll need to now pass a GIF link to the function! You'll also need to pass in the user submitting the GIF!
  await program.rpc.addGif(
    'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
    {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    }
  )

  const testGifLink =
    'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif'
  await program.rpc.addGif(testGifLink, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  })

  // Call the account.
  account = await program.account.baseAccount.fetch(baseAccount.publicKey)
  console.log('👀 GIF Count', account.totalGifs.toString())

  // Access gif_list on the account!
  console.log('👀 GIF List', account.gifList)

  // upvote a gif
  await program.rpc.upvote(testGifLink, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  })
  account = await program.account.baseAccount.fetch(baseAccount.publicKey)
  let item = account.gifList.find(({ gifLink }) => gifLink === testGifLink)

  console.log('item: ', item)

  const value = new anchor.BN(1)
  const result = await program.rpc.sendSol(value, testGifLink, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      donator: provider.wallet.publicKey,
      gifOwner: item.userAddress,
      systemProgram: SystemProgram.programId,
    },
  })

  console.log('result: ', result)
  account = await program.account.baseAccount.fetch(baseAccount.publicKey)
  item = account.gifList.find(({ gifLink }) => gifLink === testGifLink)
  console.log('item: ', item)
}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

runMain()
