also run rust and solona under wsl
https://buildspace.so/p/build-solana-web3-app
https://buildspace.so/p/build-solana-web3-app/lessons/finishing-touches-web-app-and-program

uninstall rust
rustup self uninstall

To install Rust just use this command -
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

anchor idl upgrade -f target/idl/myepicproject.json `solana address -k target/deploy/myepicproject-keypair.json`
anchor idl init -f target/idl/myepicproject.json `solana address -k target/deploy/myepicproject-keypair.json`

solana-keygen new -o target/deploy/myepicproject-keypair.json

https://github.com/buildspace/buildspace-projects/blob/main/Solana_And_Web3/en/Section_2/Resources/windows_setup.md

solana airdrop 2 8D8WDeq8dMSz8mBdP1yxEoqZeu1CfRNxtHGcvFSQwioD --url devnet

I can not deploy the program to dev net with anchor
https://stackoverflow.com/questions/68849313/i-can-not-deploy-the-program-to-dev-net-with-anchor

https://solanacookbook.com/references/programs.html#how-to-create-a-pda

Ab5fkNoG4Y847SZN5B5UBy3vNYYCbu1egeckwJM5d8B8

search discord: donate_gif

Anchor.toml
lib.rs
App.jsx

re setup wallet

- "anchor clean" or delete the target folder
- delete /home/aldrenterante/.config/solana/id.json and target/deploy/myepicproject-keypair.json
- create new wallet:
  - solana-keygen new -> /home/aldrenterante/.config/solana/id.json
  - solana-keygen new -o target/deploy/myepicproject-keypair.json -> target/deploy/myepicproject-keypair.json
- import wallet to phatom wallet
- make sure to add balance
- run "anchor build"
- run "solana address -k target/deploy/myepicproject-keypair.json" and get the program id
- run "solana config set --url devnet"
- run "solana config get"
- update Anchor.toml and lib.rs w/ new program id.
- make sure Anchor.toml is on devnet.
- run "anchor build" again
