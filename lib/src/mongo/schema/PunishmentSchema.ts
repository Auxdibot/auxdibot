import mongoose from 'mongoose';
import { APIEmbed, EmbedField } from 'discord.js';
export const PunishmentNames = {
   warn: {
      name: '⚠ Warn',
      action: 'warned',
   },
   mute: {
      name: '🔇 Mute',
      action: 'muted',
   },
   kick: {
      name: '🚷 Kick',
      action: 'kicked',
   },
   ban: {
      name: '🔨 Ban',
      action: 'banned',
   },
};
export interface IPunishment {
   _id?: mongoose.ObjectId;
   type: 'warn' | 'mute' | 'kick' | 'ban';
   expired: boolean;
   date_unix: number;
   expires_date_unix: number | undefined;
   reason: string;
   dmed: boolean;
   user_id: string;
   moderator_id: string | undefined;
   punishment_id: number;
}

export const punishmentSchema = new mongoose.Schema<IPunishment>(
   {
      type: { type: String, required: true },
      date_unix: { type: Number, default: Math.round(Date.now() / 1000) },
      expires_date_unix: { type: Number },
      expired: { type: Boolean, default: false },
      reason: { type: String, default: 'No reason given.' },
      dmed: { type: Boolean, default: false },
      moderator_id: { type: String },
      punishment_id: { type: Number, required: true },
      user_id: { type: String, required: true },
   },
   { _id: false },
);
export function toEmbedField(punishment: IPunishment): EmbedField {
   return <EmbedField>{
      name: 'Punishment Info',
      value: `🕰️ Date: <t:${Math.round(punishment.date_unix / 1000)}>\n${
         punishment.expired
            ? '📅 Expired'
            : `📅 Expires: ${
                 !punishment.expires_date_unix ? 'Never' : `<t:${Math.round(punishment.expires_date_unix / 1000)}>`
              }`
      }\n💬 Reason: ${punishment.reason}\n⛓️ User: <@${punishment.user_id}>\n🧍 Moderator: ${
         punishment.moderator_id ? `<@${punishment.moderator_id}>` : 'None'
      }`,
   };
}
export default punishmentSchema;
