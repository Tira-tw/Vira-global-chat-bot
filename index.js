const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const db = require("quick.db");

client.on("ready", () => {
  console.log(`Bot已上線`);
  
  // Set the client user's activity
client.user.setActivity('v!global', { type: 'WATCHING' })
  .then(presence => console.log(`Bot 添加伺服器人數 : ${presence.activities[0].name}`))
  .catch(console.error);
  
  client.user.setActivity(`v!global | ${client.guilds.cache.size} servers`, { type: "WATCHING"})
        .then(presense => console.log (`Bot 添加伺服器人數 : ${presense.activities[0].name}`))
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
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`你錯過了 **MANAGE GUILD** 允許!`)
    if (!channel)
      return message.channel.send(
        "頻道無效，請提供正確的頻道!!，如果你覺得這個是錯誤的，請回報https://discord.gg/u4t5D7MpAx"
      );
    db.set(`g_${message.guild.id}`, `${channel.id}`);
    message.channel.send(`跨群頻道設定在 ${channel}!`);
  }
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) return;
  let set = db.fetch(`g_${message.guild.id}`);
  if (message.channel.id === set) {
    const embed = new Discord.MessageEmbed()
      .setTitle("用戶名稱: " + message.author.tag)
      .addField("訊息:", message.content)
      .setFooter(`伺服器: ${message.guild.name} || 伺服器人數: ${message.guild.memberCount}`)
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