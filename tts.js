require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { exec } = require('child_process');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const player = createAudioPlayer();

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

    connection.subscribe(player);

    const textChannel = interaction.channel;
    if (!textChannel) {
      await interaction.reply('No associated text channel found!');
      return;
    }

    console.log(`Joined ${voiceChannel.name} and listening to messages in ${textChannel.name}.`);

    await interaction.reply(`Joined ${voiceChannel.name} and listening to messages in ${textChannel.name}.`);

    const collector = textChannel.createMessageCollector();

    collector.on('collect', async message => {
      console.log(`Received message from ${message.author.tag} in ${message.channel.name}`);
      if (message.author.bot) return;

      const ttsPath = './tts_output.wav';
      try {
        console.log(`Generating TTS for ${message.content}`);
        await generateTTS(message.content, ttsPath);
        const resource = createAudioResource(ttsPath);
        player.play(resource);
      } catch (err) {
        console.error('Error generating TTS:', err);
        message.reply('Failed to generate TTS!');
      }
    });
  }
});

async function generateTTS(text, outputPath) {
  const ttsType = process.env.TTS_TYPE || 'espeak';

  console.log(`Generating TTS using ${ttsType}`);

  if (ttsType === 'espeak') {
    return new Promise((resolve, reject) => {
      exec(`espeak-ng "${text}" -w ${outputPath}`, (err, stdout, stderr) => {
        if (err) {
          reject(stderr);
        } else {
          resolve();
        }
      });
    });

  } else if (ttsType === 'google') {
    const gTTS = require('node-gtts')('en');
    return new Promise((resolve, reject) => {
      gTTS.save(outputPath, text, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  else {
    throw new Error('Unsupported TTS type!');
  }
}

client.login(process.env.DISCORD_TOKEN);
