require('dotenv').config(); // Load environment variables from .env file
const { Client, Intents, MessageEmbed } = require("discord.js");
const db = require("quick.db");

// Retrieve configuration from environment variables
const prefix = process.env.PREFIX || "v!";
const token = process.env.TOKEN;

// Initialize Discord Client with proper Gateway Intents
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT // Required to read messages for global chat routing
  ]
});

client.on("ready", () => {
  console.log(`[READY] Bot is online as ${client.user.tag}`);
  
  // Set initial status activity
  client.user.setActivity(`${prefix}global | ${client.guilds.cache.size} servers`, { type: "WATCHING" });
  console.log(`[STATUS] Activity status set up successfully.`);
});

client.on("messageCreate", async message => {
  // Ignore bot messages
  if (message.author.bot) return;

  // CASE A: Command Handling (Starts with prefix)
  if (message.content.startsWith(prefix)) {
    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g);
    const command = args.shift().toLowerCase();

    // Command: v!global <#channel>
    if (command === "global") {
      const channel = message.mentions.channels.first();
      
      // Permission check (v13 syntax)
      if (!message.member.permissions.has('MANAGE_GUILD')) {
        return message.channel.send(`❌ You are missing the **MANAGE GUILD** permission!`);
      }
      
      if (!channel) {
        return message.channel.send(
          "❌ Invalid channel. Please provide a valid channel! If you think this is an error, contact: ross_tira"
        );
      }
      
      // Save global channel ID for the server
      db.set(`g_${message.guild.id}`, `${channel.id}`);
      return message.channel.send(`✅ Global channel has been successfully set to ${channel}!`);
    }
    return;
  }

  // CASE B: Global Chat Broadcasting (Does not start with prefix)
  let globalChannelId = db.fetch(`g_${message.guild.id}`);
  
  if (message.channel.id === globalChannelId) {
    // Construct the global chat embed layout
    const embed = new MessageEmbed()
      .setTitle("User: " + message.author.tag)
      .setDescription(message.content)
      .setFooter({ text: `Server: ${message.guild.name} || Members: ${message.guild.memberCount}` })
      .setTimestamp();
    
    // Delete user's original message to keep chat synced
    message.delete().catch(() => {}); 

    // Broadcast message to all connected servers
    client.guilds.cache.forEach(guild => {
      try {
        const targetChannelId = db.fetch(`g_${guild.id}`);
        if (!targetChannelId) return;
        
        const targetChannel = client.channels.cache.get(targetChannelId);
        if (targetChannel) {
          targetChannel.send({ embeds: [embed] }); // Send as modern embed object
        }
      } catch (err) {
        // Silently catch exceptions for guilds where the bot lacks permissions
      }
    });
  }
});

// Guard clause to prevent crashing on missing configuration tokens
if (!token) {
  console.error("❌ ERROR: TOKEN is missing in your environment variables (.env)!");
  process.exit(1);
}

client.login(token);
