const { Connection, PublicKey } = require('@solana/web3.js');
const { Client, Intents, GatewayIntentBits, Partials } = require('discord.js');

const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const walletPublicKey = new PublicKey(WALLET_ADDRESS);
const RPC_URL = process.env.RPC_URL;
const connection = new Connection(RPC_URL, 'confirmed');

// Discord bot setup
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
  
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
    ],
  });
let previousLamports = 0;

client.once('ready', () => {
  console.log('Discord bot is ready!');
  listenForTransactions();
});

async function listenForTransactions() {
  console.log(`Listening for transactions to wallet: ${WALLET_ADDRESS}`);

  const initialAccountInfo = await connection.getAccountInfo(walletPublicKey);
  previousLamports = initialAccountInfo.lamports;

  const subscriptionId = connection.onAccountChange(walletPublicKey, async (accountInfo, context) => {
    const currentLamports = accountInfo.lamports;
    const lamportsReceived = currentLamports - previousLamports;
    if (lamportsReceived > 0) {
      const message = `Received ${lamportsReceived / 1e9} SOL`;
      console.log(message);
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      channel.send(message);
    }
    previousLamports = currentLamports;
  });
}

client.login(DISCORD_BOT_TOKEN);