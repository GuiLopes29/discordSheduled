import { config } from "dotenv";
config();
import { ChannelType, Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import schedule from "node-schedule";

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
        .addIntegerOption((option) =>
            option
                .setName('tempo')
                .setDescription('Quando a mensagem deve ser enviada')
                .setChoices(
                    { name: 'Das 08 as 18', value: 8-18 },
                    { name: 'Das 09 as 18', value: 9-18 },
                    { name: 'Das 10 as 18', value: 10-18 },
                    { name: 'Das 11 as 18', value: 11-18 },
                    { name: 'Das 12 as 18', value: 12-18 },
                    { name: 'Das 13 as 18', value: 13-18 },
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
            const time = interaction.options.getInteger('tempo');
            const channel = interaction.options.getChannel('canal');

            interaction.reply({
                content: 'Lembrete programado para todos os dias úteis no canal: ' + channel.toString() + ' com a mensagem: ' + message,
            });

            console.log(message)

            schedule.scheduleJob(`0 0 ${time} * * 1-5`, () => { //seconds, minutes, hours, day of month, month, day of week || 0-7 = all days of the week || 1-5 = all days of the week except saturday and sunday
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