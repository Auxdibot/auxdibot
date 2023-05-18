import mongoose from 'mongoose';

export interface IUser {
   discord_id: string;
}
const userSchema = new mongoose.Schema<IUser>({
   discord_id: { type: String, required: true },
});

const User = mongoose.model<IUser>('user', userSchema);

export default User;
