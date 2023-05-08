import {GuildMember, SlashCommandBuilder} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from "../../util/constants/Embeds";
import timestampToDuration from "../../util/functions/timestampToDuration";
import Server from "../../mongo/model/server/Server";
import canExecute from "../../util/functions/canExecute";
import {IPunishment, toEmbedField} from "../../mongo/schema/PunishmentSchema";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import {LogType} from "../../util/types/Log";

const muteCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user using Auxdibot.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('User that will be muted.')
            .setRequired(true))
        .addStringOption(builder => builder.setName('reason')
            .setDescription('Reason for muted (Optional)')
            .setRequired(false))
        .addStringOption(builder => builder.setName('duration')
            .setDescription('Duration as a timestamp (Optional)')
            .setRequired(false)),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/mute",
            description: "Mutes a user, making them unable to talk in the server and adding a mute to their record on the server. Default duration is permanent.",
            usageExample: "/mute (user) [reason] [duration]"
        },
        permission: "moderation.mute",
    },
    async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
        if (!interaction.data) return;
        const user = interaction.options.getUser('user'),
            reason = interaction.options.getString('reason') || "No reason specified.",
            durationOption = interaction.options.getString('duration') || "permanent";
        let data = await interaction.data.guildData.fetchData(), settings = await interaction.data.guildData.fetchSettings(), counter = await interaction.data.guildData.fetchCounter();
        if (!settings.mute_role || !interaction.data.guild.roles.resolve(settings.mute_role)) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        if (data.getPunishment(user.id, 'mute')) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is already muted!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        let member = interaction.data.guild.members.resolve(user.id);
        if (!member) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is not on the server!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        if (!canExecute(interaction.data.guild, interaction.member as GuildMember, member)) {
            let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = "⛔ No Permission!"
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
            return await interaction.reply({ embeds: [noPermissionEmbed] });
        }
        let duration = timestampToDuration(durationOption);

        if (!duration) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "The timestamp provided is invalid! (ex. \"1m\" for 1 minute, \"5d\" for 5 days.)"
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        member.roles.add(interaction.data.guild.roles.resolve(settings.mute_role) || "").then(async () => {
            if (!interaction.data) return;
            let expires = duration == "permanent" || !duration ? "permanent" : duration + Date.now();
            let muteData = <IPunishment>{
                type: "mute",
                reason,
                date_unix: Date.now(),
                dmed: false,
                expired: false,
                expires_date_unix: expires && typeof expires != "string" ? expires : undefined,
                user_id: user.id,
                moderator_id: interaction.user.id,
                punishment_id: counter.incrementPunishmentID()
            };
            let dmEmbed = Embeds.PUNISHED_EMBED.toJSON();
            dmEmbed.title = "🔇 Mute";
            dmEmbed.description = `You were muted on ${interaction.data.guild ? interaction.data.guild.name : "Server"}.`
            dmEmbed.fields = [toEmbedField(muteData)]
            muteData.dmed = await user.send({embeds: [dmEmbed]}).then(() => true).catch(() => false);
            interaction.data.guildData.punish(muteData).then(async (embed) => {
                if (!embed || !interaction.data) return;
                await interaction.data.guildData.log({
                    user_id: interaction.user.id,
                    description: "A user was muted.",
                    date_unix: Date.now(),
                    type: LogType.MUTE,
                    punishment: muteData
                }, true)
                return await interaction.reply({embeds: [embed]});
            });
        }).catch(async () => {
            if (!interaction.data) return;
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = `Could not mute this user! Check and see if Auxdibot has the Manage Roles permission${settings.mute_role ? `, or if the <@&${settings.mute_role}> role is above Auxdibot in the role hierarchy` : ""}.`
            return await interaction.reply({ embeds: [errorEmbed] });
        });

    },
}
module.exports = muteCommand;