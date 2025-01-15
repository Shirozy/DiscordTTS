require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const gTTS = require('google-tts-api');
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const players = new Map();

const wordTranslations = {
  uwu: 'ooo woo',
  owo: 'oh woah',
  
};
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  if (commandName === 'joinvc') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply('You need to be in a voice channel to use this command.');
      return;
    }
    console.log(`Received joinvc command from ${interaction.user.tag} in ${interaction.guild.name}`);
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    connection.subscribe(player);
    players.set(interaction.guild.id, player);
    const textChannel = interaction.channel;
    if (!textChannel) {
      await interaction.reply('No associated text channel found!');
      return;
    }
    console.log(`Joined ${voiceChannel.name} and listening to messages in ${textChannel.name}.`);
    await interaction.reply(`Joined ${voiceChannel.name} and listening to messages in ${textChannel.name}.`);
    const collector = textChannel.createMessageCollector();
    collector.on('collect', async message => {
      if (message.author.bot) return;
      const ttsPath = `./tts_output_${interaction.guild.id}_${Date.now()}.wav`;
      let cleanText = message.content
        .replace(/https?:\/\/[\w\.-]+(\/\S*)?/g, '') // Remove URLs
        .replace(/<:[\w]+:[0-9]+>/g, '') // Remove Discord custom emojis
        .replace(/:[\w]+:/g, '') // Remove text-based emojis like :smile:
        .trim();
      
      for (const [word, translation] of Object.entries(wordTranslations)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, translation);
      }
      if (!cleanText) return;
      const ttsText = `${message.author.displayName} said... ${cleanText}`;
      console.log(`Received message: "${message.content}"`);
      console.log(`Cleaned text for TTS: "${ttsText}"`);
      const player = players.get(interaction.guild.id);
      if (player && player.state.status !== 'playing') {
        try {
          console.log(`Processing TTS for: "${ttsText}"`);
          await generateTTS(ttsText, ttsPath);
          const resource = createAudioResource(ttsPath);
          player.play(resource);
          player.once('stateChange', (oldState, newState) => {
            console.log(`AudioPlayer state changed: ${oldState.status} -> ${newState.status}`);
            if (oldState.status === 'playing' && newState.status === 'idle') {
              console.log('Finished playing audio.');
              fs.unlink(ttsPath, (err) => {
                if (err) console.error(`Failed to delete temporary file: ${ttsPath}`, err);
              });
            }
          });
        } catch (err) {
          console.error('Error processing TTS:', err);
        }
      }
    });
    collector.on('end', () => {
      console.log(`Stopped collecting messages in ${textChannel.name}`);
    });
  }
  if (commandName === 'skip') {
    const guildId = interaction.guild.id;
    const player = players.get(guildId);
    if (player) {
      player.stop();
      await interaction.reply('Skipped the current message!');
    } else {
      await interaction.reply('There is no audio playing right now.');
    }
  }
});
async function generateTTS(text, outputPath) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('Invalid text input for TTS generation');
  }
  try {
    console.log('Generating TTS using google-tts-api');
    const url = gTTS.getAudioUrl(text, { lang: 'en', slow: false });
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch TTS audio: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log('TTS generation successful');
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw error;
  }
}
client.login(process.env.DISCORD_TOKEN);  
