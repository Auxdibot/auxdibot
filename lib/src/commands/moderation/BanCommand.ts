import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from "../../util/constants/Embeds";
import Duration from "../../util/Duration";
import Server from "../../mongo/model/Server";
import {canExecute} from "../../util/Actions";
import {LogType} from "../../mongo/schema/Log";
import {IPunishment} from "../../mongo/schema/Punishment";

const banCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user using Auxdibot.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('User that will be banned.')
            .setRequired(true))
        .addStringOption(builder => builder.setName('reason')
            .setDescription('Reason for ban (Optional)')
            .setRequired(false))
        .addStringOption(builder => builder.setName('duration')
            .setDescription('Duration as a timestamp (Optional)')
            .setRequired(false))
        .addNumberOption(builder => builder.setName('delete_message_days')
            .setDescription('How many days back the user\'s messages should be deleted. (Optional)')
            .setRequired(false)),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/ban",
            description: "Bans a user, removing them from the server and adding a ban to their record on the server. Default duration is permanent.",
            usageExample: "/ban (user) [reason] [duration]"
        },
        permission: "moderation.ban",
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild || !interaction.member) return;
        const user = interaction.options.getUser('user'),
            reason = interaction.options.getString('reason') || "No reason specified.",
            durationOption = interaction.options.getString('duration') || "permanent",
            deleteMessageDays = interaction.options.getNumber('delete_message_days') || 0;
        let server = await Server.findOrCreateServer(interaction.guild.id);
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
        if (server.getPunishment(user.id, 'ban')) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is already banned!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }

        let duration = Duration(durationOption);

        if (!duration) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "The timestamp provided is invalid! (ex. \"1m\" for 1 minute, \"5d\" for 5 days.)"
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        let expires = duration == "permanent" ? "permanent" : duration + Date.now();
        interaction.guild.members.ban(user, {
            reason,
            deleteMessageDays
        }).then(async () => {
            if (!interaction.guild) return;
            let banData = <IPunishment>{
                type: "ban",
                reason,
                date_unix: Date.now(),
                dmed: false,
                expired: false,
                expires_date_unix: expires && typeof expires != "string" ? expires : undefined,
                user_id: user.id,
                moderator_id: interaction.user.id,
                punishment_id: await server.getPunishmentID(),
            };
            server.punish(banData).then(async (embed) => {
                if (!embed || !interaction.guild) return;
                await server.log({
                    user_id: interaction.user.id,
                    description: "A user was banned.",
                    date_unix: Date.now(),
                    type: LogType.BAN,
                    punishment: banData
                }, interaction.guild);
                return await interaction.reply({embeds: [embed]});
            });
        }).catch(async () => {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't ban that user. Check and see if they have a higher role than Auxdibot.";
            return await interaction.reply({ embeds: [errorEmbed] });
        })
    },
}
module.exports = banCommand;