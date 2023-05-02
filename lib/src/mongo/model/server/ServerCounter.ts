import mongoose from "mongoose";

export interface IServerCounter {
    _id: string;
    server_id: mongoose.ObjectId;
    punishment_id: number;
}
export interface IServerCounterMethods {
    incrementPunishmentID(): number;
}
export interface IServerCounterModel extends mongoose.Model<IServerCounter, {}, IServerCounterMethods> {

}

let ServerCounterSchema = new mongoose.Schema<IServerCounter, IServerCounterModel>({
    punishment_id: { type: Number, default: 0 },
    server_id: { type: mongoose.Schema.Types.ObjectId, ref: "server", required: true }
});
ServerCounterSchema.method('incrementPunishmentID', function() {
    this.punishment_id++;
    this.save();
    return this.punishment_id;
});
let ServerCounter = mongoose.model<IServerCounter, IServerCounterModel>('server_counter', ServerCounterSchema);

export default ServerCounter;