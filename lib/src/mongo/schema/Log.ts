import {IPunishment, punishmentSchema} from "./Punishment";
import mongoose from "mongoose";
import PermissionOverrideSchema, {IPermissionOverride} from "./PermissionOverride";

export enum LogType {
    "LOG_CHANNEL_CHANGED",
    "MUTE_ROLE_CHANGED",
    "WARN",
    "KICK",
    "MUTE",
    "BAN",
    "UNMUTE",
    "UNBAN",
    "MEMBER_JOIN",
    "MEMBER_LEAVE",
    "PUNISHMENT_EXPIRED",
    "PUNISHMENT_DELETED",
    "PERMISSION_CREATED",
    "PERMISSION_DELETED",
    "MESSAGE_EDITED",
    "MESSAGE_DELETED"

}
// such a stupid, stupid way to do something so stupidly, stupidly simple.
export const LogNames = {
    0: "🗒️ Log Channel Changed",
    1: "🎤 Mute Role Changed",
    2: "⚠ Warn",
    3: "🚷 Kick",
    4: "🔇 Mute",
    5: "🔨 Ban",
    6: "🔊 Unmute",
    7: "📥 Unban",
    8: "👋 Member Join",
    9: "🚶 Member Leave",
    10: "🗓️ Punishment Expired",
    11: "🗑️ Punishment Deleted",
    12: "✋ Permission Created",
    13: "🗑️ Permission Deleted",
    14: "🖊️ Message Edited",
    15: "🗙 Message Deleted",
}

export interface IChangeSchema { former: string | undefined, now: string }
const ChangeSchema = new mongoose.Schema<IChangeSchema>({
    former: { type: String },
    now: { type: String, required: true }
}, { _id: false });

export interface ILog {
    _id?: mongoose.ObjectId;
    type: LogType;
    punishment?: IPunishment;
    user_id?: string;
    date_unix: number;
    description: string;
    mute_role?: IChangeSchema;
    log_channel?: IChangeSchema;
    message_edit?: IChangeSchema;
    permission_override?: IPermissionOverride;
}

const LogSchema = new mongoose.Schema<ILog>({
    type: { type: Number, default: 0 },
    user_id: { type: String },
    mute_role: { type: ChangeSchema },
    log_channel: { type: ChangeSchema },
    message_edit: { type: ChangeSchema },
    punishment: { type: punishmentSchema },
    permission_override: { type: PermissionOverrideSchema },
    date_unix: { type: Number, required: true },
    description: { type: String, required: true }
});

export default LogSchema;