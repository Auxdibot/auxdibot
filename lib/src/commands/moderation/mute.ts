import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from "../../util/constants/Embeds";
import timestampToDuration from "../../util/functions/timestampToDuration";
import Server from "../../mongo/model/Server";
import canExecute from "../../util/functions/canExecute";
import {LogType} from "../../mongo/schema/Log";
import {IPunishment, toEmbedField} from "../../mongo/schema/Punishment";

const muteCommand = <Command>{
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
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild || !interaction.member) return;
        const user = interaction.options.getUser('user'),
            reason = interaction.options.getString('reason') || "No reason specified.",
            durationOption = interaction.options.getString('duration') || "permanent";
        let server = await Server.findOrCreateServer(interaction.guild.id);





        if (!server.settings.mute_role || !interaction.guild.roles.resolve(server.settings.mute_role)) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        if (server.getPunishment(user.id, 'mute')) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is already muted!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
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
        let duration = timestampToDuration(durationOption);

        if (!duration) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "The timestamp provided is invalid! (ex. \"1m\" for 1 minute, \"5d\" for 5 days.)"
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        member.roles.add(interaction.guild.roles.resolve(server.settings.mute_role) || "").then(async () => {
            if (!interaction.guild) return;
            let server = await Server.findOrCreateServer(interaction.guild.id);
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
                punishment_id: await server.getPunishmentID()
            };
            let dmEmbed = Embeds.PUNISHED_EMBED.toJSON();
            dmEmbed.title = "🔇 Mute";
            dmEmbed.description = `You were muted on ${interaction.guild ? interaction.guild.name : "Server"}.`
            dmEmbed.fields = [toEmbedField(muteData)]
            muteData.dmed = await user.send({embeds: [dmEmbed]}).then(() => true).catch(() => false);
            server.punish(muteData).then(async (embed) => {
                if (!embed || !interaction.guild) return;
                await server.log({
                    user_id: interaction.user.id,
                    description: "A user was muted.",
                    date_unix: Date.now(),
                    type: LogType.MUTE,
                    punishment: muteData
                }, interaction.guild)
                return await interaction.reply({embeds: [embed]});
            });
        }).catch(async () => {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = `Could not mute this user! Check and see if Auxdibot has the Manage Roles permission${server.settings.mute_role ? `, or if the <@&${server.settings.mute_role}> role is above Auxdibot in the role hierarchy` : ""}.`
            return await interaction.reply({ embeds: [errorEmbed] });
        });

    },
}
module.exports = muteCommand;