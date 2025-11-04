import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

function sanitizePost(post) {
  if (!post) return null;
  return {
    id: post._id,
    user: post.user,
    content: post.content,
    imageUrl: post.imageUrl ?? null,
    likes: post.likes,
    comments: post.comments,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    createdAt: post.createdAt,
  };
}

export async function createPost(req, res, next) {
  try {
    const { content, imageUrl } = req.body || {};
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (content.trim().length > 500) {
      return res.status(400).json({ message: 'Content must be 500 characters or fewer' });
    }

    const created = await Post.create({
      user: req.userId,
      content: content.trim(),
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : undefined,
    });

    const post = await Post.findById(created._id)
      .populate('user', 'name profilePictureUrl')
      .populate({ path: 'comments', select: '_id' });

    return res.status(201).json({ message: 'Post created successfully', post: sanitizePost(post) });
  } catch (error) {
    return next(error);
  }
}

export async function getAllPosts(req, res, next) {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePictureUrl');

    return res.status(200).json({ message: 'Posts fetched successfully', posts: posts.map(sanitizePost) });
  } catch (error) {
    return next(error);
  }
}

export async function getPostById(req, res, next) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('user', 'name profilePictureUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json({ message: 'Post fetched successfully', post: sanitizePost(post) });
  } catch (error) {
    return next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.user) !== String(req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Comment.deleteMany({ post: id });
    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function toggleKindness(req, res, next) {
  try {
    const { id } = req.params;

    const exists = await Post.exists({ _id: id });
    if (!exists) return res.status(404).json({ message: 'Post not found' });

    const hasLiked = await Post.exists({ _id: id, likes: req.userId });
    const update = hasLiked ? { $pull: { likes: req.userId } } : { $addToSet: { likes: req.userId } };

    const updated = await Post.findByIdAndUpdate(id, update, { new: true }).populate('user', 'name profilePictureUrl');

    return res.status(200).json({
      message: hasLiked ? 'Kindness removed' : 'Kindness added',
      post: sanitizePost(updated),
    });
  } catch (error) {
    return next(error);
  }
}

// Backward-compatible export name
export const toggleLike = toggleKindness;

export async function addComment(req, res, next) {
  try {
    const { id } = req.params; // post id
    const { text } = req.body || {};

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }
    if (text.trim().length > 300) {
      return res.status(400).json({ message: 'Text must be 300 characters or fewer' });
    }

    const comment = await Comment.create({ user: req.userId, post: id, text: text.trim() });
    await Post.findByIdAndUpdate(id, { $push: { comments: comment._id } });

    const populated = await Comment.findById(comment._id).populate('user', 'name profilePictureUrl');

    return res.status(201).json({ message: 'Comment added successfully', comment: {
      id: populated._id,
      user: populated.user,
      post: populated.post,
      text: populated.text,
      createdAt: populated.createdAt,
    }});
  } catch (error) {
    return next(error);
  }
}

export async function getCommentsForPost(req, res, next) {
  try {
    const { id } = req.params; // post id
    const post = await Post.findById(id).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: id })
      .sort({ createdAt: 1 })
      .populate('user', 'name profilePictureUrl');

    return res.status(200).json({ message: 'Comments fetched successfully', comments: comments.map((c) => ({
      id: c._id,
      user: c.user,
      post: c.post,
      text: c.text,
      createdAt: c.createdAt,
    })) });
  } catch (error) {
    return next(error);
  }
}


