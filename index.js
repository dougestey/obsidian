require('dotenv-safe').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const Seat = require('./seat');

client.on('ready', () => {
  console.log(`AUTHBOT logged in as ${client.user.tag}!`);
});

client.on('message', async(msg) => {
  // Ignore messages from bots, including authbot.
  // Ignore messages not invoking commands.
  if (msg.author.bot || !msg.content.startsWith('!')) {
    return;
  }

  let command = msg.content.split(' ')[0];
  let commands = ['!auth', '!deauth', '!roles', '!sync'];

  if (!commands.includes(command)) {
    return msg.reply('Valid commands: `!auth`, `!deauth`, `!roles`, `!sync`');
  }

  if (command.includes('auth')) {
    let segments = msg.content.split(`${command} `);

    if (segments.length === 1) {
      return msg.reply('Did not understand that command. Try this: `' + command + ' Rocket X for Command,Members`');
    }

    let [ character, roleString ] = segments[1].split(' for ');
    let roles = roleString.split(',');

    if (!character || !roles.length) {
      return msg.reply('Did not understand that command. Try this: `' + command + ' Rocket X for Command,Members`');
    }

    msg.reply(`Okay, I will update ${character}'s ${roleString} roles.`);

    let result;

    try {
      result = await Seat.process(command, character, roles, msg);
    } catch (e) {
      console.error(e);
      msg.reply('Error issuing command.');
    }
  } else {
    try {
      await Seat.process(command, null, null, msg);
    } catch (e) {
      msg.reply('Error running that command.');

      return console.error(e);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
