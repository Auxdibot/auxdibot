import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import {
    IAuxdibot
} from "../../util/templates/IAuxdibot";
import HelpCommandInfo from "../../util/types/HelpCommandInfo";
import dotenv from "dotenv";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import BaseAuxdibotCommandData from "../../util/types/commandData/BaseAuxdibotCommandData";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
import calcXP from "../../util/functions/calcXP";
dotenv.config();
const helpCommand = < AuxdibotCommand > {
    data: new SlashCommandBuilder()
        .setName('mylevel')
        .setDescription('View your level on this server.'),
    info: {
        help: {
            commandCategory: "Levels",
            name: "/mylevel",
            description: "View your level on this server.",
            usageExample: "/mylevel"
        },
        allowedDefault: true,
        permission: "levels.mylevel"
    },
    async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
        if (!interaction.data) return;
        let embed = Embeds.LEVELS_EMBED.toJSON();
        embed.title = "Your Level";
        
        let data = await interaction.data.guildData.findOrCreateMember(interaction.data.member.id);
        if (!data) return;
        let levelXP = calcXP(data.level);
        console.log(levelXP);
        let percent = Math.round(((data.xpTill/levelXP) || 0) * 10);
        if (!isFinite(percent)) percent=0;
        let avatar = interaction.user.avatarURL({ size: 128 });

        if (avatar) embed.thumbnail = { url: avatar };
        embed.description = `🏅 Experience: \`${data.xp} XP\`\n🏆 Level: \`Level ${data.level}\``;
        embed.fields = [{
            name: "Level Progress",
            value: `\`Level ${data.level}\` [${new Array(percent + 1).join("🟩") + new Array((10-percent)).join("⬛")}] \`Level ${data.level+1}\`\n(\`${data.xpTill}\ XP\`/\`${levelXP}\ XP\`)`
        }]
        
        return await interaction.reply({ embeds: [embed] })
    }
}
module.exports = helpCommand;