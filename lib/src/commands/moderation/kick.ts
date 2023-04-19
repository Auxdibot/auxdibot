import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from "../../util/constants/Embeds";
import Server from "../../mongo/model/Server";
import canExecute from "../../util/functions/canExecute";
import {LogType} from "../../mongo/schema/Log";
import {IPunishment} from "../../mongo/schema/Punishment";

const kickCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user using Auxdibot.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('User that will be kicked.')
            .setRequired(true))
        .addStringOption(builder => builder.setName('reason')
            .setDescription('Reason for kick (Optional)')
            .setRequired(false)),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/kick",
            description: "Kicks a user, removing them from the server and adding a kick to their record on the server.",
            usageExample: "/kick (user) [reason]"
        },
        permission: "moderation.kick",
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild || !interaction.member) return;
        const user = interaction.options.getUser('user'), reason = interaction.options.getString('reason') || "No reason specified.";
        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        let server = await Server.findOrCreateServer(interaction.guild.id);
        let member = interaction.guild.members.resolve(user.id);
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
        interaction.guild.members.kick(user, reason).then(async () => {
            if (!interaction.guild) return;
            let kickData = <IPunishment>{
                type: "kick",
                reason,
                date_unix: Date.now(),
                dmed: false,
                expired: true,
                expires_date_unix: undefined,
                user_id: user.id,
                moderator_id: interaction.user.id,
                punishment_id: await server.getPunishmentID(),
            };
            server.punish(kickData).then(async (embed) => {
                if (!embed || !interaction.guild) return;
                await server.log({
                    user_id: interaction.user.id,
                    description: "A user was kicked.",
                    date_unix: Date.now(),
                    type: LogType.KICK,
                    punishment: kickData
                }, interaction.guild)
                return await interaction.reply({ embeds: [embed] });
            });
        }).catch(async () => {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't kick that user.";
            return await interaction.reply({ embeds: [errorEmbed] });
        })
    },

}
module.exports = kickCommand;