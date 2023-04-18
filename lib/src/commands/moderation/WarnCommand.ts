import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from '../../util/constants/Embeds';
import Server from "../../mongo/model/Server";
import {canExecute} from "../../util/Actions";
import {LogType} from "../../mongo/schema/Log";
import {IPunishment, toEmbedField} from "../../mongo/schema/Punishment";

const warnCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user using Auxdibot.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('User that will be warned.')
            .setRequired(true))
        .addStringOption(builder => builder.setName('reason')
            .setDescription('Reason for warn (Optional)')
            .setRequired(false)),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/warn",
            description: "Warns a user, giving them a DM warning (if they have DMs enabled) and adding a warn to their record on the server.",
            usageExample: "/warn (user) [reason]"
        },
        permission: "moderation.warn"
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild || !interaction.member) return;
        const user = interaction.options.getUser('user'), reason = interaction.options.getString('reason') || "No reason specified.";

        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        let member = interaction.guild.members.resolve(user.id)
        if (!member) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is not on the server!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        if (!await canExecute(interaction.guild, interaction.member as GuildMember, member)) {
            let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = "⛔ No Permission!"
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
            return await interaction.reply({ embeds: [noPermissionEmbed] });
        }
        let server = await Server.findOrCreateServer(interaction.guild.id);
        let warnData = <IPunishment>{
            moderator_id: interaction.user.id,
            user_id: user.id,
            reason,
            date_unix: Date.now(),
            dmed: false,
            expires_date_unix: undefined,
            expired: true,
            type: 'warn',
            punishment_id: await server.getPunishmentID()
        };
        let dmEmbed = Embeds.PUNISHED_EMBED.toJSON();
        dmEmbed.title = "⚠ Warn";
        dmEmbed.description = `You were warned on ${interaction.guild ? interaction.guild.name : "Server"}.`
        dmEmbed.fields = [toEmbedField(warnData)]
        warnData.dmed = await user.send({embeds: [dmEmbed]}).then(() => true).catch(() => false);

        server.punish(warnData).then(async (embed) => {
            if (!embed || !interaction.guild) return;

            await server.log({
                user_id: interaction.user.id,
                description: "A user was warned.",
                date_unix: Date.now(),
                type: LogType.WARN,
                punishment: warnData
            }, interaction.guild)
            return await interaction.reply({embeds: [embed]});
        });
    },

}
module.exports = warnCommand;