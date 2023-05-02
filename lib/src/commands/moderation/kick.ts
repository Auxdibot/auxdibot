import {SlashCommandBuilder} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from "../../util/constants/Embeds";
import canExecute from "../../util/functions/canExecute";
import {IPunishment} from "../../mongo/schema/PunishmentSchema";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import {LogType} from "../../util/types/Log";

const kickCommand = <AuxdibotCommand>{
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
    async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData> ) {
        if (!interaction.data) return;
        const user = interaction.options.getUser('user'), reason = interaction.options.getString('reason') || "No reason specified.";
        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        let counter = await interaction.data.guildData.fetchCounter()
        let member = interaction.data.guild.members.resolve(user.id);
        if (!member) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is not on the server!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
            let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = "⛔ No Permission!"
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
            return await interaction.reply({ embeds: [noPermissionEmbed] });
        }
        interaction.data.guild.members.kick(user, reason).then(async () => {
            if (!interaction.data) return;
            let kickData = <IPunishment>{
                type: "kick",
                reason,
                date_unix: Date.now(),
                dmed: false,
                expired: true,
                expires_date_unix: undefined,
                user_id: user.id,
                moderator_id: interaction.user.id,
                punishment_id: counter.incrementPunishmentID(),
            };
            interaction.data.guildData.punish(kickData).then(async (embed) => {
                if (!embed || !interaction.data) return;
                await interaction.data.guildData.log({
                    user_id: interaction.user.id,
                    description: "A user was kicked.",
                    date_unix: Date.now(),
                    type: LogType.KICK,
                    punishment: kickData
                })
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