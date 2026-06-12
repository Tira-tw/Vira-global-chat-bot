const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const db = require("quick.db");

client.on("ready", () => {
  console.log(`Bot is online`);
  
  // Set the client user's activity
  client.user.setActivity('v!global', { type: 'WATCHING' })
    .then(presence => console.log(`Bot server count activity set to: ${presence.activities[0].name}`))
    .catch(console.error);
  
  client.user.setActivity(`v!global | ${client.guilds.cache.size} servers`, { type: "WATCHING"})
    .then(presence => console.log(`Bot server count activity set to: ${presence.activities[0].name}`))
    .catch(console.error);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  //usage G!global <#channel>
  
  if (command === "global") {
    const channel = message.mentions.channels.first();
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`You are missing the **MANAGE GUILD** permission!`)
    if (!channel)
      return message.channel.send(
        "Invalid channel. Please provide a valid channel! If you think this is an error, please report it here: ross_tira"
      );
    db.set(`g_${message.guild.id}`, `${channel.id}`);
    message.channel.send(`Global channel has been set to ${channel}!`);
  }
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) return;
  let set = db.fetch(`g_${message.guild.id}`);
  if (message.channel.id === set) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Username: " + message.author.tag)
      .addField("Message:", message.content)
      .setFooter(`Server: ${message.guild.name} || Members: ${message.guild.memberCount}`)
    message.delete();
    client.guilds.cache.forEach(g => {
      try {
        client.channels.cache.get(db.fetch(`g_${g.id}`)).send(embed);
      } catch (e) {
        return;
      }
    });
  }
});

const config = require("./config.json");
client.login(config.token);
