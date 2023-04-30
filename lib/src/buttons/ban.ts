import AuxdibotButton from "../util/types/AuxdibotButton";
import {
    GuildMember,
    MessageComponentInteraction
} from "discord.js";
import canExecute from "../util/functions/canExecute";
import Embeds from "../util/constants/Embeds";
import {IPunishment} from "../mongo/schema/PunishmentSchema";
import Server from "../mongo/model/Server";
import {LogType} from "../util/types/Log";

module.exports = <AuxdibotButton>{
    name: "ban",
    permission: "moderation.ban",
    async execute(interaction: MessageComponentInteraction) {
        if (!interaction.guild || !interaction.user || !interaction.channel) return;
        let [name, user_id] = interaction.customId.split("-");
        let member = interaction.guild.members.resolve(user_id);
        if (!member) {
            let embed = Embeds.ERROR_EMBED.toJSON();
            embed.description = "This user is not in the server!";
            return await interaction.reply({ embeds: [embed] });
        }


        if (!await canExecute(interaction.guild, interaction.member as GuildMember, member)) {
            let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = "⛔ No Permission!"
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
            return await interaction.reply({ embeds: [noPermissionEmbed] });
        }
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (server.getPunishment(user_id, 'ban')) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is already banned!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }

        interaction.guild.members.ban(member, {
            reason: "No reason given."
        }).then(async () => {
            if (!interaction.guild) return;
            let banData = <IPunishment>{
                type: "ban",
                reason: "No reason given.",
                date_unix: Date.now(),
                dmed: false,
                expired: false,
                expires_date_unix: undefined,
                user_id: user_id,
                moderator_id: interaction.user.id,
                punishment_id: await server.getPunishmentID(),
            };
            server.punish(banData).then(async (embed) => {
                if (!embed || !interaction.guild) return;
                await server.log({
                    user_id: user_id,
                    description: "A user was banned.",
                    date_unix: Date.now(),
                    type: LogType.BAN,
                    punishment: banData
                }, interaction.guild);
                return await interaction.reply({embeds: [embed]});
            });
        }).catch(async (reason) => {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't ban that user. Check and see if they have a higher role than Auxdibot.";
            return await interaction.reply({ embeds: [errorEmbed] });
        })
        return;
    }
}