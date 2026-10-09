const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const link = message.content.trim();
  
  if (!link.startsWith('http')) return;

  const processando = await message.reply('🔍 **Processando link...** Aguarde um instante!');

  try {
    const resposta = await fetch(link, { redirect: 'follow', follow: 20 });
    const linkFinal = resposta.url;

    if (linkFinal === link) {
      return processando.edit('🔗 Esse link não é encurtado!');
    }

    const embed = new EmbedBuilder()
      .setColor('#9933ff')
      .setTitle('✅ Link Desencurtado!')
      .setDescription(`🔗 **Link Original:**\n||${linkFinal}||\n\n⚠️ **Só você pode ver** — clique em "Abrir Link" abaixo`)
      .setFooter({ text: 'WESLLEY XIT — Projeto Oficial' })
      .setTimestamp();

    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`link_${message.author.id}_${encodeURIComponent(linkFinal)}`)
        .setLabel('🔑 Pegar Key / Abrir Link')
        .setStyle(ButtonStyle.Primary)
    );

    await processando.edit({ content: `${message.author}`, embeds: [embed], components: [botao] });

  } catch (erro) {
    processando.edit('❌ Não consegui desencurtar esse link!');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  
  const partes = interaction.customId.split('_');
  if (partes[0] !== 'link') return;
  
  const autorId = partes[1];
  const linkFinal = decodeURIComponent(partes.slice(2).join('_'));

  if (interaction.user.id !== autorId) {
    return interaction.reply({ 
      content: '❌ **Só a pessoa que pediu pode pegar a key!**', 
      ephemeral: true 
    });
  }

  await interaction.reply({
    content: `✅ **Aqui está!**\n🔗 ${linkFinal}`,
    ephemeral: true
  });
});

module.exports = { client };
