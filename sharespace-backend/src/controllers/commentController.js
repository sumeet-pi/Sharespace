import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (String(comment.user) !== String(req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Comment.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return next(error);
  }
}


