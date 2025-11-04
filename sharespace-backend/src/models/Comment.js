import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Text is required'],
      maxlength: [300, 'Text must be less than or equal to 300 characters'],
      trim: true,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;


