const config = require("./config.json");
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
  intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]
});

var userAfkStorage = [];

client.on("ready", () => {
  console.log("I am ready!");
});
  
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (oldState.member.user.bot) return;

  if(newState.channelId === config.AFK_CHANNEL_ID) {
      userAfkStorage.push({
        userId: newState.id,
        currentTimestamp: Date.now()
      });
  }

  if(oldState.channelId === config.AFK_CHANNEL_ID) {
    const userAfkStorageEntry = userAfkStorage.find(entry => entry.userId === oldState.id);
    const indexOfUserAfkStorageEntry = userAfkStorage.findIndex(entry => entry.userId === oldState.id);
    userAfkStorage.splice(indexOfUserAfkStorageEntry, 1);

    const afkSinceSeconds = Date.now() - userAfkStorageEntry.currentTimestamp + config.AFK_DELAY_MILLISECONDS;
    const user = await client.users.fetch(userAfkStorageEntry.userId);
    
    client.channels.fetch(config.PUBLISH_MESSAGE_CHANNEL_ID)
      .then(channel => { 
        const timingText = new Date(afkSinceSeconds).toISOString().substring(11, 19);
        const textToSend = `${user.username} kam nach ${timingText} wieder zurück.`;
        channel.send(textToSend);
      });
  }
});

client.login(config.BOT_TOKEN);