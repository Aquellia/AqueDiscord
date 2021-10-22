import { AqueClient } from '../../structures/AqueClient';
import { ApplicationCommandData, CommandInteraction, Message, MessageEmbed } from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';

export const data: ApplicationCommandData = {
    name: 'ping',
    description: 'Displays current latency and API ping',
    type: ApplicationCommandTypes.CHAT_INPUT
};

export const options = {};

export async function execute(client: AqueClient, interaction: CommandInteraction): Promise<void> {
    const message = await interaction.reply({ content: 'Checking Ping!', ephemeral: true, fetchReply: true });

    const createdAt = (message instanceof Message) ? message.createdAt.valueOf() : Date.parse(message.timestamp);

    const embed = new MessageEmbed();
    embed.setTitle('Ping Test');
    embed.addField('Latency',`${Math.floor(createdAt - interaction.createdAt.valueOf())}ms` , true);
    embed.addField('API Latency', `${Math.round(client.ws.ping)}ms`, true);

    await interaction.editReply({ embeds: [embed] });
}
