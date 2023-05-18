import mongoose from 'mongoose';

export interface IPermissionOverride {
   role_id?: string;
   user_id?: string;
   permission: string;
   allowed: boolean;
}

const PermissionOverrideSchema = new mongoose.Schema<IPermissionOverride>(
   {
      role_id: { type: String },
      user_id: { type: String },
      permission: { type: String, required: true },
      allowed: { type: Boolean, default: true },
   },
   { _id: false },
);
export default PermissionOverrideSchema;
