import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [500, 'Content must be less than or equal to 500 characters'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
      trim: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.virtual('likeCount').get(function likeCount() {
  return Array.isArray(this.likes) ? this.likes.length : 0;
});

postSchema.virtual('commentCount').get(function commentCount() {
  return Array.isArray(this.comments) ? this.comments.length : 0;
});

const Post = mongoose.model('Post', postSchema);
export default Post;

export { postSchema };


