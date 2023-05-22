import { IPunishment, PunishmentSchema } from './PunishmentSchema';
import mongoose from 'mongoose';
import PermissionOverrideSchema, { IPermissionOverride } from './PermissionOverrideSchema';
import { ChangeSchema, IChange } from './ChangeSchema';
import { LogType } from '@util/types/enums/Log';

export interface ILog {
   _id?: mongoose.ObjectId;
   type: LogType;
   punishment?: IPunishment;
   user_id?: string;
   date_unix: number;
   description: string;
   mute_role?: IChange;
   channel?: IChange;
   message_edit?: IChange;
   permission_override?: IPermissionOverride;
}

const LogSchema = new mongoose.Schema<ILog>(
   {
      type: { type: Number, default: 0 },
      user_id: { type: String },
      mute_role: { type: ChangeSchema },
      channel: { type: ChangeSchema },
      message_edit: { type: ChangeSchema },
      punishment: { type: PunishmentSchema },
      permission_override: { type: PermissionOverrideSchema },
      date_unix: { type: Number, required: true },
      description: { type: String, required: true },
   },
   { _id: false },
);

export default LogSchema;
