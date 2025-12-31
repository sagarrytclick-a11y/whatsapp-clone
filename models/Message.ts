import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Prevent re-compilation of model in development
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
