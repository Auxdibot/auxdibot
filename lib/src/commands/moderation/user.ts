import {
    ActionRowBuilder, ButtonBuilder,
    ChatInputCommandInteraction,
    ButtonStyle,
    GuildMemberManager,
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import Server from "../../mongo/model/Server";
import {PunishmentNames} from "../../mongo/schema/Punishment";

const userCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription("View and edit a user's data.")
        .addUserOption(builder => builder.setName('user')
            .setDescription('The user to view.')),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/user",
            description: "Displays an easy to use embed where you can view and edit a user's data, including punishments on their record.",
            usageExample: "/user [user]"
        },
        permission: "moderation.user"
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild || !interaction.channel) return;
        const user = interaction.options.getUser('user') || interaction.user;
        let member = (interaction.guild.members as GuildMemberManager).resolve(user.id);
        let server = await Server.findOrCreateServer(interaction.guild.id);
        let record = server.userRecord(user.id),
            overrides = server.getPermissionOverride(undefined, undefined, user.id),
            banned = server.getPunishment(user.id, 'ban'),
            muted = server.getPunishment(user.id, 'mute');

        let embed = Embeds.INFO_EMBED.toJSON();
        if (member) {
            for (let role of member.roles.cache.values()) {
                overrides = overrides.concat(server.getPermissionOverride(undefined, role.id));
            }
        }
        embed.title = `🧍 ${user.tag}`;
        embed.thumbnail = {
            url: user.avatarURL({ size: 128 }) || "",
            width: 128,
            height: 128
        };

        embed.fields = [member ? {
            name: "Member Data",
            value: `👋 Join Date: <t:${Math.round((member.joinedTimestamp || Date.now()) / 1000)}>\n📗 Highest Role: <@&${member.roles.highest.id}>\n${member.id == interaction.guild.ownerId ? "👑 Owner" : ""}`,
        } : { name: "Member Data Not Found", value: "User is not in this server!" }, {
            name: "Latest Punishments",
            value: record.slice(0,10).reduce((str, punishment) => {
                let type = PunishmentNames[punishment.type]
                return str + `\n**${type.name}** - PID: ${punishment.punishment_id} - <t:${Math.round(punishment.date_unix / 1000)}>`
            }, "\u2800"),
        }, {
            name: "Permission Overrides",
            value: overrides.reduce((accumulator, permissionOverride) => accumulator + `\n${permissionOverride.allowed ? "✅" : "❎"} \`${permissionOverride.permission}\` - ${permissionOverride.role_id ? `<@&${permissionOverride.role_id}>` : permissionOverride.user_id ? `<@${permissionOverride.user_id}>` : ""}`, "\u2800") + "\n\u2800",
        }]
        const row_info = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder()
            .setCustomId(`record-${user.id}`)
            .setEmoji("📜")
            .setStyle(1)
            .setLabel("Record")).toJSON();
        const row_punishments = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`unban-${user.id}`)
                .setEmoji("📥")
                .setStyle(4)
                .setLabel("Unban")
                .setDisabled(!banned),
            new ButtonBuilder()
                .setCustomId(`unmute-${user.id}`)
                .setEmoji("🔊")
                .setStyle(4)
                .setLabel("Unmute")
                .setDisabled(!muted),
            new ButtonBuilder()
                .setCustomId(`mute-${user.id}`)
                .setEmoji("🔇")
                .setStyle(2)
                .setLabel("Mute")
                .setDisabled(muted != null || member == null),
            new ButtonBuilder()
                .setCustomId(`ban-${user.id}`)
                .setEmoji("🔨")
                .setStyle(2)
                .setLabel("Ban")
                .setDisabled(banned != null || member == null),
            new ButtonBuilder()
                .setCustomId(`kick-${user.id}`)
                .setEmoji("🚷")
                .setStyle(2)
                .setLabel("Kick")
                .setDisabled(member == null),
        ).toJSON();



        return await interaction.reply({ embeds: [embed], components: [row_info, row_punishments] });
    },

}
module.exports = userCommand;