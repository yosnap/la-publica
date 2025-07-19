import { Request, Response } from 'express';
import User, { IUser } from './user.model';
import Post, { IPost } from './post.model';

export const searchAll = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const type = req.query.type as string; // 'users', 'posts' or undefined

  if (!query) {
    return res.status(400).json({ success: false, message: 'Es requereix un terme de cerca (?q=...)' });
  }

  try {
    let users: IUser[] = [];
    let posts: IPost[] = [];

    const searchFilter = { $text: { $search: query } };
    const userProjection = {
        _id: 1,
        firstName: 1,
        lastName: 1,
        username: 1
    };

    if (!type || type === 'users') {
      users = await User.find(searchFilter).select(userProjection);
    }

    if (!type || type === 'posts') {
      posts = await Post.find(searchFilter).populate('author', 'username firstName lastName');
    }

    return res.status(200).json({
      success: true,
      data: {
        users,
        posts
      }
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error en realitzar la cerca', error: error.message });
  }
}; 