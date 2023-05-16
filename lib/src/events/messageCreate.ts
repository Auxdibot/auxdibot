import {APIEmbed, Message} from "discord.js";
import Server from "../mongo/model/server/Server";
import {LogType} from "../util/types/Log";
import {IReactionRole} from "../mongo/schema/ReactionRoleSchema";
import parsePlaceholders from "../util/functions/parsePlaceholder";

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message: Message) {
        if (message.author.bot || message.author.id == message.client.user.id) return;
        let sender = message.member;
        if (!sender || !message.guild) return;
        let server = await Server.findOrCreateServer(message.guild.id);
        let settings = await server.fetchSettings();
        if (settings.message_xp <= 0) return;
        let member = await server.findOrCreateMember(sender.id);
        if (!member) return;
        let level = member.level;
        let newLevel = member.addXP(settings.message_xp);
        await member.save();
        
        console.log(newLevel + level);
        if (newLevel > level) {
            try {
                if (!message.guild || !message.member) return;
                let embed = JSON.parse((await parsePlaceholders(JSON.stringify(settings.levelup_embed), message.guild, message.member)).replaceAll("%levelup%", ` \`Level ${level}\` -> \`Level ${newLevel}\` `));
                await message.reply({ embeds: [embed as APIEmbed] });
            } catch (x) { console.log(x); }
        }

    
    }
}