import { Request, Response } from 'express';
import User from './user.model';
import Post from './post.model';
import Company from './company.model';
import Group from './group.model';
import GroupPost from './groupPost.model';
import Forum from './forum.model';
import ForumPost from './forumPost.model';
import JobOffer from './jobOffer.model';
import Announcement from './announcement.model';
import Advisory from './advisory.model';
import Blog from './blog.model';
import Category from './category.model';
import GroupCategory from './groupCategory.model';
import ForumCategory from './forumCategory.model';

// Helper function to check admin permissions
const checkAdminPermission = (userRole: string, res: Response): boolean => {
  if (userRole !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Només els administradors poden realitzar aquesta acció'
    });
    return false;
  }
  return true;
};

// Get all data with pagination and filters
const getDataWithPagination = async (Model: any, options: any = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    category = '',
    author = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    populate = []
  } = options;

  const skip = (page - 1) * limit;
  const query: any = {};

  // Apply search filter
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    if (Model.modelName === 'User') {
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    } else if (Model.modelName === 'Company') {
      query.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    } else {
      query.$or = [
        { title: searchRegex },
        { name: searchRegex },
        { description: searchRegex }
      ];
    }
  }

  // Apply category filter
  if (category) {
    query.category = category;
  }

  // Apply author filter (only for models that have author field)
  if (author) {
    if (Model.modelName === 'JobOffer' || Model.modelName === 'Advisory') {
      // These models use company, not author - skip author filter
    } else if (Model.modelName === 'Company') {
      query.owner = author;
    } else if (Model.modelName === 'Group' || Model.modelName === 'Forum') {
      query.creator = author;
    } else {
      query.author = author;
    }
  }

  // Apply status filter
  if (status) {
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
  }

  let queryBuilder = Model.find(query);

  // Apply population
  if (populate.length > 0) {
    populate.forEach((pop: any) => {
      if (typeof pop === 'string') {
        queryBuilder = queryBuilder.populate(pop);
      } else {
        queryBuilder = queryBuilder.populate(pop.path, pop.select);
      }
    });
  }

  // Apply sorting
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  queryBuilder = queryBuilder.sort(sortOptions);

  // Apply pagination
  queryBuilder = queryBuilder.skip(skip).limit(limit);

  const [data, total] = await Promise.all([
    queryBuilder.exec(),
    Model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      limit,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// Users Management
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(User, {
      ...req.query,
      populate: []
    });

    // Remove sensitive data
    result.data = result.data.map((user: any) => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir usuaris',
      error: error.message
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { userId } = req.params;
    const updateData = req.body;

    // Don't allow password updates through this endpoint
    delete updateData.password;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    return res.json({
      success: true,
      data: user,
      message: 'Usuari actualitzat correctament'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualitzar usuari',
      error: error.message
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { userId } = req.params;
    const { permanent = false } = req.body;

    if (permanent) {
      await User.findByIdAndDelete(userId);
    } else {
      await User.findByIdAndUpdate(userId, { isActive: false });
    }

    return res.json({
      success: true,
      message: permanent ? 'Usuari eliminat permanentment' : 'Usuari desactivat'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar usuari',
      error: error.message
    });
  }
};

// Posts Management
export const getPosts = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(Post, {
      ...req.query,
      populate: [
        { path: 'author', select: 'firstName lastName email' },
        { path: 'comments.author', select: 'firstName lastName' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir posts',
      error: error.message
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { postId } = req.params;
    const updateData = req.body;

    const post = await Post.findByIdAndUpdate(postId, updateData, { new: true })
      .populate('author', 'firstName lastName email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no trobat'
      });
    }

    return res.json({
      success: true,
      data: post,
      message: 'Post actualitzat correctament'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualitzar post',
      error: error.message
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { postId } = req.params;
    const { permanent = false } = req.body;

    if (permanent) {
      await Post.findByIdAndDelete(postId);
    } else {
      await Post.findByIdAndUpdate(postId, { isActive: false });
    }

    return res.json({
      success: true,
      message: permanent ? 'Post eliminat permanentment' : 'Post desactivat'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar post',
      error: error.message
    });
  }
};

// Companies Management
export const getCompanies = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(Company, {
      ...req.query,
      populate: [
        { path: 'owner', select: 'firstName lastName email' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir empreses',
      error: error.message
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { companyId } = req.params;
    const updateData = req.body;

    const company = await Company.findByIdAndUpdate(companyId, updateData, { new: true })
      .populate('owner', 'firstName lastName email');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no trobada'
      });
    }

    return res.json({
      success: true,
      data: company,
      message: 'Empresa actualitzada correctament'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualitzar empresa',
      error: error.message
    });
  }
};

// Groups Management
export const getGroups = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(Group, {
      ...req.query,
      populate: [
        { path: 'creator', select: 'firstName lastName email' },
        { path: 'category', select: 'name color' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir grups',
      error: error.message
    });
  }
};

// Forums Management
export const getForums = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(Forum, {
      ...req.query,
      populate: [
        { path: 'creator', select: 'firstName lastName email' },
        { path: 'category', select: 'name color' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir fòrums',
      error: error.message
    });
  }
};

// Job Offers Management
export const getJobOffers = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(JobOffer, {
      ...req.query,
      populate: [
        { path: 'company', select: 'name' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir ofertes de treball',
      error: error.message
    });
  }
};

// Announcements Management
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(Announcement, {
      ...req.query,
      populate: [
        { path: 'author', select: 'firstName lastName email' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir anuncis',
      error: error.message
    });
  }
};

// Advisories Management
export const getAdvisories = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const result = await getDataWithPagination(Advisory, {
      ...req.query,
      populate: [
        { path: 'company', select: 'name' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir assessoraments',
      error: error.message
    });
  }
};

// Bulk operations
export const bulkUpdateItems = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { model, itemIds, updateData } = req.body;
    
    let Model;
    switch (model) {
      case 'User': Model = User; break;
      case 'Post': Model = Post; break;
      case 'Company': Model = Company; break;
      case 'Group': Model = Group; break;
      case 'Forum': Model = Forum; break;
      case 'JobOffer': Model = JobOffer; break;
      case 'Announcement': Model = Announcement; break;
      case 'Advisory': Model = Advisory; break;
      case 'Blog': Model = Blog; break;
      case 'ForumPost': Model = ForumPost; break;
      case 'GroupPost': Model = GroupPost; break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Model no vàlid'
        });
    }

    const result = await Model.updateMany(
      { _id: { $in: itemIds } },
      updateData
    );

    return res.json({
      success: true,
      data: result,
      message: `${result.modifiedCount} elements actualitzats`
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error en l\'operació massiva',
      error: error.message
    });
  }
};

export const bulkDeleteItems = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { model, itemIds, permanent = false } = req.body;
    
    let result: any;
    
    switch (model) {
      case 'User':
        if (permanent) {
          result = await User.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await User.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Post':
        if (permanent) {
          result = await Post.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Post.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Company':
        if (permanent) {
          result = await Company.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Company.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Group':
        if (permanent) {
          result = await Group.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Group.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Forum':
        if (permanent) {
          result = await Forum.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Forum.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'JobOffer':
        if (permanent) {
          result = await JobOffer.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await JobOffer.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Announcement':
        if (permanent) {
          result = await Announcement.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Announcement.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Advisory':
        if (permanent) {
          result = await Advisory.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Advisory.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'Blog':
        if (permanent) {
          result = await Blog.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await Blog.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'ForumPost':
        if (permanent) {
          result = await ForumPost.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await ForumPost.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      case 'GroupPost':
        if (permanent) {
          result = await GroupPost.deleteMany({ _id: { $in: itemIds } });
        } else {
          result = await GroupPost.updateMany({ _id: { $in: itemIds } }, { isActive: false });
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Model no vàlid'
        });
    }

    return res.json({
      success: true,
      data: result,
      message: permanent 
        ? `${result.deletedCount || result.modifiedCount} elements eliminats permanentment`
        : `${result.modifiedCount} elements desactivats`
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error en l\'operació massiva',
      error: error.message
    });
  }
};

// Assign author to content
export const assignAuthor = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { model, itemId, authorId } = req.body;
    
    // Verify author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Autor no trobat'
      });
    }

    let item: any;
    
    switch (model) {
      case 'Post':
        item = await Post.findByIdAndUpdate(
          itemId,
          { author: authorId },
          { new: true }
        ).populate('author', 'firstName lastName email');
        break;
      case 'Company':
        item = await Company.findByIdAndUpdate(
          itemId,
          { owner: authorId }, // Company uses 'owner' not 'author'
          { new: true }
        ).populate('owner', 'firstName lastName email');
        break;
      case 'Group':
        item = await Group.findByIdAndUpdate(
          itemId,
          { creator: authorId }, // Group uses 'creator' not 'author'
          { new: true }
        ).populate('creator', 'firstName lastName email');
        break;
      case 'Forum':
        item = await Forum.findByIdAndUpdate(
          itemId,
          { creator: authorId }, // Forum uses 'creator' not 'author'
          { new: true }
        ).populate('creator', 'firstName lastName email');
        break;
      case 'Announcement':
        item = await Announcement.findByIdAndUpdate(
          itemId,
          { author: authorId },
          { new: true }
        ).populate('author', 'firstName lastName email');
        break;
      case 'Blog':
        item = await Blog.findByIdAndUpdate(
          itemId,
          { author: authorId },
          { new: true }
        ).populate('author', 'firstName lastName email');
        break;
      case 'ForumPost':
        item = await ForumPost.findByIdAndUpdate(
          itemId,
          { author: authorId },
          { new: true }
        ).populate('author', 'firstName lastName email');
        break;
      case 'GroupPost':
        item = await GroupPost.findByIdAndUpdate(
          itemId,
          { author: authorId },
          { new: true }
        ).populate('author', 'firstName lastName email');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Model no vàlid o no suporta assignació d\'autor'
        });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Element no trobat'
      });
    }

    return res.json({
      success: true,
      data: item,
      message: 'Autor assignat correctament'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al assignar autor',
      error: error.message
    });
  }
};

// Assign category to content
export const assignCategory = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const { model, itemId, categoryId } = req.body;
    
    let item: any;
    
    switch (model) {
      case 'Company':
        item = await Company.findByIdAndUpdate(
          itemId,
          { category: categoryId },
          { new: true }
        ).populate('category', 'name');
        break;
      case 'Group':
        item = await Group.findByIdAndUpdate(
          itemId,
          { category: categoryId },
          { new: true }
        ).populate('category', 'name');
        break;
      case 'Forum':
        item = await Forum.findByIdAndUpdate(
          itemId,
          { category: categoryId },
          { new: true }
        ).populate('category', 'name');
        break;
      case 'JobOffer':
        item = await JobOffer.findByIdAndUpdate(
          itemId,
          { category: categoryId },
          { new: true }
        );
        break;
      case 'Announcement':
        item = await Announcement.findByIdAndUpdate(
          itemId,
          { category: categoryId },
          { new: true }
        );
        break;
      case 'Advisory':
        item = await Advisory.findByIdAndUpdate(
          itemId,
          { category: categoryId },
          { new: true }
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Model no vàlid'
        });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Element no trobat'
      });
    }

    return res.json({
      success: true,
      data: item,
      message: 'Categoria assignada correctament'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al assignar categoria',
      error: error.message
    });
  }
};