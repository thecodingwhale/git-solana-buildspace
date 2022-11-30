use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

declare_id!("h6W5YTiih4u9QBqeYJKUvXaRAqxSBYGEawn2eL6NqYR");

#[program]
pub mod myepicproject {
  use super::*;
  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_gifs = 0;
    Ok(())
  }

  // The function now accepts a gif_link param from the user. We also reference the user from the Context
  pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;

	// Build the struct.
    let item = ItemStruct {
      gif_link: gif_link.to_string(),
      user_address: *user.to_account_info().key,
      votes: 0,
      donated: 0,
    };
		
	// Add it to the gif_list vector.
    base_account.gif_list.push(item);
    base_account.total_gifs += 1;
    Ok(())
  }

  pub fn upvote(ctx: Context<Upvote>, gif_link: String) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let index = base_account.gif_list.iter().position(|r| r.gif_link == gif_link).unwrap();
    base_account.gif_list[index].votes += 1;

    Ok(())
  }

  pub fn send_sol(ctx: Context<SendSol>, amount: u64, gif_link: String) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let gif_owner = &mut ctx.accounts.gif_owner;

    invoke(
      &transfer(
        ctx.accounts.donator.to_account_info().key,
        gif_owner.to_account_info().key,
        amount,
      ),
      &[
        ctx.accounts.donator.to_account_info(),
        gif_owner.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
      ],
    )?;

    for gif in &mut base_account.gif_list {
      if gif.gif_link == gif_link {
        gif.donated += amount;
      }
    }
    Ok(())
  } 
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
  #[account(init, payer = user, space = 9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program <'info, System>,
}

// Add the signer who calls the AddGif method to the struct so that we can save it
#[derive(Accounts)]
pub struct AddGif<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Upvote<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct SendSol<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub donator: Signer<'info>,
  #[account(mut)]
  /// CHECK: This is not dangerous because we don't read or write from this account
  pub gif_owner: AccountInfo<'info>,
  pub system_program: Program<'info, System>,
} 

// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub votes: u32,
    pub donated: u64,
    pub gif_link: String,
    pub user_address: Pubkey,
}


#[account]
pub struct BaseAccount {
    pub total_gifs: u32,
	// Attach a Vector of type ItemStruct to the account.
    pub gif_list: Vec<ItemStruct>,
}