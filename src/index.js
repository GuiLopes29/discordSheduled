const { config } = require("dotenv")
config();

const { ChannelType, Client, Routes, SlashCommandBuilder } = require("discord.js")
const { REST } = require("@discordjs/rest")
const schedule = require("node-schedule")

const express = require('express');
const app = express();
app.get('/', (req, res) => {
    const ping = new Date();
    ping.setHours(ping.getHours() - 3);
    console.log(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}`);
    res.sendStatus(200);
});
app.listen(process.env.PORT);
const TZ = process.env.TZ;
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [] });
const rest = new REST({ version: "10" }).setToken(TOKEN);


const commands = [
    new SlashCommandBuilder()
        .setName('lembrete')
        .setDescription('Programa uma mensagem para ser enviada em um determinado horário nos dias úteis.')
        .addStringOption((option) =>
            option
                .setName('mensagem')
                .setDescription('Mensagem a ser enviada')
                .setMinLength(5)
                .setMaxLength(1000)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('tempo')
                .setDescription('Quando a mensagem deve ser enviada')
                .setChoices(
                    { name: 'Das 08 as 18', value: '8-18' },
                    { name: 'Das 09 as 18', value: '9-18' },
                    { name: 'Das 10 as 18', value: '10-18' },
                    { name: 'Das 11 as 18', value: '11-18' },
                    { name: 'Das 12 as 18', value: '12-18' },
                    { name: 'Das 13 as 18', value: '13-18' },
                ).
                setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName('canal')
                .setDescription('Canal onde a mensagem deve ser enviada')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .toJSON(),
]

client.on('ready', () => console.log('Bot is ready!'));

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'lembrete') {
            const message = interaction.options.getString('mensagem');
            const time = interaction.options.getString('tempo');
            const channel = interaction.options.getChannel('canal');

            interaction.reply({
                content: 'Lembrete programado para todos os dias úteis no canal: ' + channel.toString() + ' com a mensagem: ' + message,
            });
            schedule.scheduleJob({ rule: `* * ${time} * * 1-5`, TZ }, () => { //seconds, minutes, hours, day of month, month, day of week || 0-7 = all days of the week || 1-5 = all days of the week except saturday and sunday
                channel.send({ content: message });
            });
        }
    }
});

async function main() {
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
        client.login(TOKEN);
    } catch (error) {
        console.error(error);
    }
}

main()