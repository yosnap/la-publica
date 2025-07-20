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
import mongoose from 'mongoose';

interface BackupOptions {
  includeUsers?: boolean;
  includePosts?: boolean;
  includeCompanies?: boolean;
  includeGroups?: boolean;
  includeGroupPosts?: boolean;
  includeForums?: boolean;
  includeForumPosts?: boolean;
  includeJobOffers?: boolean;
  includeAnnouncements?: boolean;
  includeAdvisories?: boolean;
  includeBlogs?: boolean;
  includeCategories?: boolean;
  includeGroupCategories?: boolean;
  includeForumCategories?: boolean;
  
  // Date range options
  dateFrom?: string;
  dateTo?: string;
  
  // Author filter
  authorId?: string;
  
  // Category filter
  categoryFilter?: string[];
  
  // Limit options
  maxRecords?: number;
}

interface BackupData {
  version: string;
  exportDate: string;
  platform: string;
  options: BackupOptions;
  statistics: Record<string, number>;
  data: Record<string, any[]>;
}

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

// Helper function to apply date filters
const applyDateFilter = (query: any, options: BackupOptions) => {
  if (options.dateFrom || options.dateTo) {
    const dateFilter: any = {};
    if (options.dateFrom) {
      dateFilter.$gte = new Date(options.dateFrom);
    }
    if (options.dateTo) {
      dateFilter.$lte = new Date(options.dateTo);
    }
    query.createdAt = dateFilter;
  }
  return query;
};

// Helper function to apply author filter (for models that have an author field)
const applyAuthorFilter = (query: any, options: BackupOptions) => {
  if (options.authorId) {
    query.author = options.authorId;
  }
  return query;
};

// Helper function to apply company owner filter (for models that use company field)
const applyCompanyOwnerFilter = async (query: any, options: BackupOptions) => {
  if (options.authorId) {
    // Find companies owned by this author
    const companies = await Company.find({ owner: options.authorId }).select('_id');
    const companyIds = companies.map(c => c._id).filter(id => id != null);
    query.company = { $in: companyIds };
  }
  return query;
};

// Export granular data
export const exportGranularData = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (!checkAdminPermission(userRole, res)) return;

    const options: BackupOptions = {
      includeUsers: req.body.includeUsers || false,
      includePosts: req.body.includePosts || false,
      includeCompanies: req.body.includeCompanies || false,
      includeGroups: req.body.includeGroups || false,
      includeGroupPosts: req.body.includeGroupPosts || false,
      includeForums: req.body.includeForums || false,
      includeForumPosts: req.body.includeForumPosts || false,
      includeJobOffers: req.body.includeJobOffers || false,
      includeAnnouncements: req.body.includeAnnouncements || false,
      includeAdvisories: req.body.includeAdvisories || false,
      includeBlogs: req.body.includeBlogs || false,
      includeCategories: req.body.includeCategories || false,
      includeGroupCategories: req.body.includeGroupCategories || false,
      includeForumCategories: req.body.includeForumCategories || false,
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      authorId: req.body.authorId,
      categoryFilter: req.body.categoryFilter,
      maxRecords: req.body.maxRecords || 1000
    };

    const backupData: BackupData = {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      platform: 'La Pública - Backup Granular',
      options,
      statistics: {
        users: 0,
        posts: 0,
        companies: 0,
        groups: 0,
        groupPosts: 0,
        forums: 0,
        forumPosts: 0,
        jobOffers: 0,
        announcements: 0,
        advisories: 0,
        blogs: 0,
        categories: 0,
        groupCategories: 0,
        forumCategories: 0
      },
      data: {}
    };

    // Export Users
    if (options.includeUsers) {
      let query = applyDateFilter({}, options);
      const users = await User.find(query)
        .select('-password -__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.users = users.map(user => ({
        ...user,
        _id: user._id ? user._id.toString() : null
      }));
      backupData.statistics.users = users.length;
    }

    // Export Posts
    if (options.includePosts) {
      try {
        console.log('Exporting posts...');
        let query = applyDateFilter({}, options);
        query = applyAuthorFilter(query, options);
        
        const posts = await Post.find(query)
          .populate('author', 'firstName lastName email')
          .populate('comments.author', 'firstName lastName')
          .select('-__v')
          .limit(options.maxRecords!)
          .lean();
        
        backupData.data.posts = posts.map(post => {
          const postData: any = {
            ...post,
            _id: post._id ? post._id.toString() : null
          };
          
          // Handle author
          if (typeof post.author === 'object' && post.author._id) {
            postData.author = { ...post.author, _id: post.author._id.toString() };
          } else {
            postData.author = post.author;
          }
          
          // Handle comments array
          if (post.comments && Array.isArray(post.comments)) {
            postData.comments = post.comments.map((comment: any) => {
              const commentData: any = {
                ...comment,
                _id: comment._id ? comment._id.toString() : null
              };
              
              // Handle comment author
              if (typeof comment.author === 'object' && comment.author._id) {
                commentData.author = { ...comment.author, _id: comment.author._id.toString() };
              } else {
                commentData.author = comment.author;
              }
              
              return commentData;
            });
          } else {
            postData.comments = post.comments || [];
          }
          
          return postData;
        });
        backupData.statistics.posts = posts.length;
        console.log(`Exported ${posts.length} posts successfully`);
      } catch (postsError) {
        console.error('Error exporting posts:', postsError);
        backupData.data.posts = [];
        backupData.statistics.posts = 0;
      }
    }

    // Export Companies
    if (options.includeCompanies) {
      try {
        console.log('Exporting companies...');
        let query = applyDateFilter({}, options);
        
        if (options.categoryFilter && options.categoryFilter.length > 0) {
          query.category = { $in: options.categoryFilter };
        }
        
        const companies = await Company.find(query)
          .populate('owner', 'firstName lastName email')
          .select('-__v')
          .limit(options.maxRecords!)
          .lean();
        
        backupData.data.companies = companies.map(company => ({
          ...company,
          _id: company._id ? company._id.toString() : null,
          owner: typeof company.owner === 'object' && company.owner._id ? { ...company.owner, _id: company.owner._id.toString() } : company.owner
        }));
        backupData.statistics.companies = companies.length;
        console.log(`Exported ${companies.length} companies successfully`);
      } catch (companiesError) {
        console.error('Error exporting companies:', companiesError);
        backupData.data.companies = [];
        backupData.statistics.companies = 0;
      }
    }

    // Export Groups
    if (options.includeGroups) {
      let query = applyDateFilter({}, options);
      
      const groups = await Group.find(query)
        .populate('creator', 'firstName lastName email')
        .populate('category', 'name')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.groups = groups.map(group => ({
        ...group,
        _id: group._id ? group._id.toString() : null,
        creator: typeof group.creator === 'object' && group.creator._id ? { ...group.creator, _id: group.creator._id.toString() } : group.creator,
        category: typeof group.category === 'object' && group.category._id ? { ...group.category, _id: group.category._id.toString() } : group.category
      }));
      backupData.statistics.groups = groups.length;
    }

    // Export Group Posts
    if (options.includeGroupPosts) {
      let query = applyDateFilter({}, options);
      query = applyAuthorFilter(query, options);
      
      const groupPosts = await GroupPost.find(query)
        .populate('author', 'firstName lastName email')
        .populate('group', 'name')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.groupPosts = groupPosts.map(post => ({
        ...post,
        _id: post._id ? post._id.toString() : null,
        author: typeof post.author === 'object' && post.author._id ? { ...post.author, _id: post.author._id.toString() } : post.author,
        group: typeof post.group === 'object' && post.group._id ? { ...post.group, _id: post.group._id.toString() } : post.group
      }));
      backupData.statistics.groupPosts = groupPosts.length;
    }

    // Export Forums
    if (options.includeForums) {
      let query = applyDateFilter({}, options);
      
      const forums = await Forum.find(query)
        .populate('creator', 'firstName lastName email')
        .populate('category', 'name')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.forums = forums.map(forum => ({
        ...forum,
        _id: forum._id ? forum._id.toString() : null,
        creator: typeof forum.creator === 'object' && forum.creator._id ? { ...forum.creator, _id: forum.creator._id.toString() } : forum.creator,
        category: typeof forum.category === 'object' && forum.category._id ? { ...forum.category, _id: forum.category._id.toString() } : forum.category
      }));
      backupData.statistics.forums = forums.length;
    }

    // Export Forum Posts
    if (options.includeForumPosts) {
      let query = applyDateFilter({}, options);
      query = applyAuthorFilter(query, options);
      
      const forumPosts = await ForumPost.find(query)
        .populate('author', 'firstName lastName email')
        .populate('forum', 'name')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.forumPosts = forumPosts.map(post => ({
        ...post,
        _id: post._id ? post._id.toString() : null,
        author: typeof post.author === 'object' && post.author._id ? { ...post.author, _id: post.author._id.toString() } : post.author,
        forum: typeof post.forum === 'object' && post.forum._id ? { ...post.forum, _id: post.forum._id.toString() } : post.forum
      }));
      backupData.statistics.forumPosts = forumPosts.length;
    }

    // Export Job Offers
    if (options.includeJobOffers) {
      let query = applyDateFilter({}, options);
      query = await applyCompanyOwnerFilter(query, options);
      
      if (options.categoryFilter && options.categoryFilter.length > 0) {
        query.category = { $in: options.categoryFilter };
      }
      
      const jobOffers = await JobOffer.find(query)
        .populate('company', 'name')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.jobOffers = jobOffers.map(offer => ({
        ...offer,
        _id: offer._id ? offer._id.toString() : null,
        company: typeof offer.company === 'object' && offer.company._id ? { ...offer.company, _id: offer.company._id.toString() } : offer.company
      }));
      backupData.statistics.jobOffers = jobOffers.length;
    }

    // Export Announcements
    if (options.includeAnnouncements) {
      let query = applyDateFilter({}, options);
      query = applyAuthorFilter(query, options);
      
      if (options.categoryFilter && options.categoryFilter.length > 0) {
        query.category = { $in: options.categoryFilter };
      }
      
      const announcements = await Announcement.find(query)
        .populate('author', 'firstName lastName email')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.announcements = announcements.map(announcement => ({
        ...announcement,
        _id: announcement._id ? announcement._id.toString() : null,
        author: typeof announcement.author === 'object' && announcement.author._id ? { ...announcement.author, _id: announcement.author._id.toString() } : announcement.author
      }));
      backupData.statistics.announcements = announcements.length;
    }

    // Export Advisories
    if (options.includeAdvisories) {
      let query = applyDateFilter({}, options);
      query = await applyCompanyOwnerFilter(query, options);
      
      if (options.categoryFilter && options.categoryFilter.length > 0) {
        query.category = { $in: options.categoryFilter };
      }
      
      const advisories = await Advisory.find(query)
        .populate('company', 'name')
        .select('-__v')
        .limit(options.maxRecords!)
        .lean();
      
      backupData.data.advisories = advisories.map(advisory => ({
        ...advisory,
        _id: advisory._id ? advisory._id.toString() : null,
        company: typeof advisory.company === 'object' && advisory.company._id ? { ...advisory.company, _id: advisory.company._id.toString() } : advisory.company
      }));
      backupData.statistics.advisories = advisories.length;
    }

    // Export Blogs
    if (options.includeBlogs) {
      try {
        let query = applyDateFilter({}, options);
        query = applyAuthorFilter(query, options);
        
        if (options.categoryFilter && options.categoryFilter.length > 0) {
          query.category = { $in: options.categoryFilter };
        }
        
        const blogs = await Blog.find(query)
          .populate('author', 'firstName lastName email')
          .populate('category', 'name color')
          .select('-__v')
          .limit(options.maxRecords!)
          .lean();
        
        backupData.data.blogs = blogs.map(blog => {
          const blogData: any = {
            ...blog,
            _id: blog._id ? blog._id.toString() : null
          };
          
          // Handle author
          if (blog.author && typeof blog.author === 'object' && blog.author._id) {
            blogData.author = {
              ...blog.author,
              _id: blog.author._id.toString()
            };
          } else {
            blogData.author = blog.author;
          }
          
          // Handle category
          if (blog.category && typeof blog.category === 'object' && blog.category._id) {
            blogData.category = {
              ...blog.category,
              _id: blog.category._id.toString()
            };
          } else {
            blogData.category = blog.category;
          }
          
          return blogData;
        });
        backupData.statistics.blogs = blogs.length;
      } catch (blogError) {
        console.error('Error exporting blogs:', blogError);
        if (blogError instanceof Error) {
          console.error('Blog error stack:', blogError.stack);
        }
        backupData.data.blogs = [];
        backupData.statistics.blogs = 0;
      }
    }

    // Export Categories
    if (options.includeCategories) {
      const categories = await Category.find({ isActive: true })
        .select('-__v')
        .lean();
      
      backupData.data.categories = categories.map(category => ({
        ...category,
        _id: category._id ? category._id.toString() : null
      }));
      backupData.statistics.categories = categories.length;
    }

    // Export Group Categories
    if (options.includeGroupCategories) {
      const groupCategories = await GroupCategory.find({ isActive: true })
        .select('-__v')
        .lean();
      
      backupData.data.groupCategories = groupCategories.map(category => ({
        ...category,
        _id: category._id ? category._id.toString() : null
      }));
      backupData.statistics.groupCategories = groupCategories.length;
    }

    // Export Forum Categories
    if (options.includeForumCategories) {
      const forumCategories = await ForumCategory.find({ isActive: true })
        .select('-__v')
        .lean();
      
      backupData.data.forumCategories = forumCategories.map(category => ({
        ...category,
        _id: category._id ? category._id.toString() : null
      }));
      backupData.statistics.forumCategories = forumCategories.length;
    }

    // Configure headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="la-publica-backup-${new Date().toISOString().split('T')[0]}.json"`);

    return res.json(backupData);
  } catch (error: any) {
    console.error('Granular backup export error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error al exportar les dades',
      error: error.message
    });
  }
};

// Get backup preview/statistics
export const getBackupPreview = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (!checkAdminPermission(userRole, res)) return;

    const options: BackupOptions = {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      authorId: req.query.authorId as string,
      categoryFilter: req.query.categoryFilter ? String(req.query.categoryFilter).split(',') : undefined
    };

    const statistics: Record<string, number> = {};

    // Count each data type with filters
    let baseQuery = {};
    if (options.dateFrom || options.dateTo) {
      baseQuery = applyDateFilter(baseQuery, options);
    }

    statistics.users = await User.countDocuments(baseQuery);
    
    let postQuery = { ...baseQuery };
    if (options.authorId) postQuery = applyAuthorFilter(postQuery, options);
    statistics.posts = await Post.countDocuments(postQuery);

    let companyQuery = { ...baseQuery };
    if (options.categoryFilter?.length) {
      companyQuery = { ...companyQuery, category: { $in: options.categoryFilter } };
    }
    statistics.companies = await Company.countDocuments(companyQuery);

    statistics.groups = await Group.countDocuments(baseQuery);
    statistics.groupPosts = await GroupPost.countDocuments(postQuery);
    statistics.forums = await Forum.countDocuments(baseQuery);
    statistics.forumPosts = await ForumPost.countDocuments(postQuery);
    
    let jobOfferQuery = { ...baseQuery };
    jobOfferQuery = await applyCompanyOwnerFilter(jobOfferQuery, options);
    if (options.categoryFilter?.length) {
      jobOfferQuery = { ...jobOfferQuery, category: { $in: options.categoryFilter } };
    }
    statistics.jobOffers = await JobOffer.countDocuments(jobOfferQuery);
    
    let announcementQuery = { ...postQuery };
    if (options.categoryFilter?.length) {
      announcementQuery = { ...announcementQuery, category: { $in: options.categoryFilter } };
    }
    statistics.announcements = await Announcement.countDocuments(announcementQuery);
    
    let advisoryQuery = { ...baseQuery };
    advisoryQuery = await applyCompanyOwnerFilter(advisoryQuery, options);
    if (options.categoryFilter?.length) {
      advisoryQuery = { ...advisoryQuery, category: { $in: options.categoryFilter } };
    }
    statistics.advisories = await Advisory.countDocuments(advisoryQuery);
    
    try {
      let blogQuery = { ...postQuery };
      if (options.categoryFilter?.length) {
        blogQuery = { ...blogQuery, category: { $in: options.categoryFilter } };
      }
      statistics.blogs = await Blog.countDocuments(blogQuery);
    } catch (blogError) {
      console.error('Error counting blogs:', blogError);
      statistics.blogs = 0;
    }

    statistics.categories = await Category.countDocuments({ isActive: true });
    statistics.groupCategories = await GroupCategory.countDocuments({ isActive: true });
    statistics.forumCategories = await ForumCategory.countDocuments({ isActive: true });

    return res.json({
      success: true,
      data: {
        statistics,
        filters: options,
        totalRecords: Object.values(statistics).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir vista prèvia del backup',
      error: error.message
    });
  }
};

// Import granular data
export const importGranularData = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    
    if (!checkAdminPermission(userRole, res)) return;

    const { backupData, options = {} } = req.body;
    
    if (!backupData || !backupData.data) {
      return res.status(400).json({
        success: false,
        message: 'Dades de backup invàlides'
      });
    }

    const {
      replaceExisting = false,
      importUsers = false,
      importPosts = false,
      importCompanies = false,
      importGroups = false,
      importGroupPosts = false,
      importForums = false,
      importForumPosts = false,
      importJobOffers = false,
      importAnnouncements = false,
      importAdvisories = false,
      importBlogs = false,
      importCategories = false,
      importGroupCategories = false,
      importForumCategories = false
    } = options;

    const results: Record<string, { created: number; updated: number; skipped: number; errors: number }> = {};

    // Helper function to initialize results
    const initResult = (key: string) => {
      results[key] = { created: 0, updated: 0, skipped: 0, errors: 0 };
    };

    // Helper function to handle ObjectId conversions
    const toObjectId = (id: string | mongoose.Types.ObjectId | undefined): mongoose.Types.ObjectId | undefined => {
      if (!id) return undefined;
      if (typeof id === 'string' && mongoose.isValidObjectId(id)) {
        return new mongoose.Types.ObjectId(id);
      }
      if (id instanceof mongoose.Types.ObjectId) {
        return id;
      }
      return undefined;
    };

    // Import Categories first (as they might be referenced by other entities)
    if (importCategories && backupData.data.categories) {
      initResult('categories');
      for (const categoryData of backupData.data.categories) {
        try {
          const { _id, ...data } = categoryData;
          
          if (replaceExisting && _id) {
            await Category.findByIdAndUpdate(_id, data, { upsert: true });
            results.categories.updated++;
          } else {
            const exists = await Category.findOne({ name: data.name, type: data.type });
            if (!exists) {
              await Category.create(data);
              results.categories.created++;
            } else {
              results.categories.skipped++;
            }
          }
        } catch (error) {
          results.categories.errors++;
          console.error('Error importing category:', error);
        }
      }
    }

    // Import Group Categories
    if (importGroupCategories && backupData.data.groupCategories) {
      initResult('groupCategories');
      for (const categoryData of backupData.data.groupCategories) {
        try {
          const { _id, ...data } = categoryData;
          
          if (replaceExisting && _id) {
            await GroupCategory.findByIdAndUpdate(_id, data, { upsert: true });
            results.groupCategories.updated++;
          } else {
            const exists = await GroupCategory.findOne({ name: data.name });
            if (!exists) {
              await GroupCategory.create(data);
              results.groupCategories.created++;
            } else {
              results.groupCategories.skipped++;
            }
          }
        } catch (error) {
          results.groupCategories.errors++;
          console.error('Error importing group category:', error);
        }
      }
    }

    // Import Forum Categories
    if (importForumCategories && backupData.data.forumCategories) {
      initResult('forumCategories');
      for (const categoryData of backupData.data.forumCategories) {
        try {
          const { _id, ...data } = categoryData;
          
          if (replaceExisting && _id) {
            await ForumCategory.findByIdAndUpdate(_id, data, { upsert: true });
            results.forumCategories.updated++;
          } else {
            const exists = await ForumCategory.findOne({ name: data.name });
            if (!exists) {
              await ForumCategory.create(data);
              results.forumCategories.created++;
            } else {
              results.forumCategories.skipped++;
            }
          }
        } catch (error) {
          results.forumCategories.errors++;
          console.error('Error importing forum category:', error);
        }
      }
    }

    // Import Users
    if (importUsers && backupData.data.users) {
      initResult('users');
      for (const userData of backupData.data.users) {
        try {
          const { _id, password, ...data } = userData;
          // Never import passwords
          
          if (replaceExisting && _id) {
            await User.findByIdAndUpdate(_id, data, { upsert: true });
            results.users.updated++;
          } else {
            const exists = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
            if (!exists) {
              // Generate a random password for imported users
              const newUser = new User({
                ...data,
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
              });
              await newUser.save();
              results.users.created++;
            } else {
              results.users.skipped++;
            }
          }
        } catch (error) {
          results.users.errors++;
          console.error('Error importing user:', error);
        }
      }
    }

    // Import Companies
    if (importCompanies && backupData.data.companies) {
      initResult('companies');
      for (const companyData of backupData.data.companies) {
        try {
          const { _id, owner, category, ...data } = companyData;
          
          const importData: any = { ...data };
          
          // Handle owner reference
          if (owner) {
            if (typeof owner === 'object' && owner.email) {
              const ownerUser = await User.findOne({ email: owner.email });
              if (ownerUser) {
                importData.owner = ownerUser._id;
              } else {
                // Use the current admin user as owner if original owner not found
                importData.owner = userId;
              }
            } else if (typeof owner === 'string') {
              importData.owner = toObjectId(owner) || userId;
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await Category.findOne({ name: category.name, type: 'company' });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          if (replaceExisting && _id) {
            await Company.findByIdAndUpdate(_id, importData, { upsert: true });
            results.companies.updated++;
          } else {
            const exists = await Company.findOne({ name: data.name });
            if (!exists) {
              await Company.create(importData);
              results.companies.created++;
            } else {
              results.companies.skipped++;
            }
          }
        } catch (error) {
          results.companies.errors++;
          console.error('Error importing company:', error);
        }
      }
    }

    // Import Groups
    if (importGroups && backupData.data.groups) {
      initResult('groups');
      for (const groupData of backupData.data.groups) {
        try {
          const { _id, creator, category, members, ...data } = groupData;
          
          const importData: any = { ...data };
          
          // Handle creator reference
          if (creator) {
            if (typeof creator === 'object' && creator.email) {
              const creatorUser = await User.findOne({ email: creator.email });
              if (creatorUser) {
                importData.creator = creatorUser._id;
              } else {
                importData.creator = userId;
              }
            } else if (typeof creator === 'string') {
              importData.creator = toObjectId(creator) || userId;
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await GroupCategory.findOne({ name: category.name });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          // Handle members array
          if (members && Array.isArray(members)) {
            importData.members = members.map(m => toObjectId(m)).filter(Boolean);
          }
          
          if (replaceExisting && _id) {
            await Group.findByIdAndUpdate(_id, importData, { upsert: true });
            results.groups.updated++;
          } else {
            const exists = await Group.findOne({ name: data.name });
            if (!exists) {
              await Group.create(importData);
              results.groups.created++;
            } else {
              results.groups.skipped++;
            }
          }
        } catch (error) {
          results.groups.errors++;
          console.error('Error importing group:', error);
        }
      }
    }

    // Import Forums
    if (importForums && backupData.data.forums) {
      initResult('forums');
      for (const forumData of backupData.data.forums) {
        try {
          const { _id, creator, category, moderators, ...data } = forumData;
          
          const importData: any = { ...data };
          
          // Handle creator reference
          if (creator) {
            if (typeof creator === 'object' && creator.email) {
              const creatorUser = await User.findOne({ email: creator.email });
              if (creatorUser) {
                importData.creator = creatorUser._id;
              } else {
                importData.creator = userId;
              }
            } else if (typeof creator === 'string') {
              importData.creator = toObjectId(creator) || userId;
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await ForumCategory.findOne({ name: category.name });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          // Handle moderators array
          if (moderators && Array.isArray(moderators)) {
            importData.moderators = moderators.map(m => toObjectId(m)).filter(Boolean);
          }
          
          if (replaceExisting && _id) {
            await Forum.findByIdAndUpdate(_id, importData, { upsert: true });
            results.forums.updated++;
          } else {
            const exists = await Forum.findOne({ name: data.name });
            if (!exists) {
              await Forum.create(importData);
              results.forums.created++;
            } else {
              results.forums.skipped++;
            }
          }
        } catch (error) {
          results.forums.errors++;
          console.error('Error importing forum:', error);
        }
      }
    }

    // Import Job Offers
    if (importJobOffers && backupData.data.jobOffers) {
      initResult('jobOffers');
      for (const offerData of backupData.data.jobOffers) {
        try {
          const { _id, company, category, ...data } = offerData;
          
          const importData: any = { ...data };
          
          // Handle company reference
          if (company) {
            if (typeof company === 'object' && company.name) {
              const companyDoc = await Company.findOne({ name: company.name });
              if (companyDoc) {
                importData.company = companyDoc._id;
              } else {
                continue; // Skip if company not found
              }
            } else if (typeof company === 'string') {
              const companyId = toObjectId(company);
              if (companyId) {
                importData.company = companyId;
              } else {
                continue; // Skip if invalid company ID
              }
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await Category.findOne({ name: category.name, type: 'job' });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          if (replaceExisting && _id) {
            await JobOffer.findByIdAndUpdate(_id, importData, { upsert: true });
            results.jobOffers.updated++;
          } else {
            await JobOffer.create(importData);
            results.jobOffers.created++;
          }
        } catch (error) {
          results.jobOffers.errors++;
          console.error('Error importing job offer:', error);
        }
      }
    }

    // Import Announcements
    if (importAnnouncements && backupData.data.announcements) {
      initResult('announcements');
      for (const announcementData of backupData.data.announcements) {
        try {
          const { _id, author, category, ...data } = announcementData;
          
          const importData: any = { ...data };
          
          // Handle author reference
          if (author) {
            if (typeof author === 'object' && author.email) {
              const authorUser = await User.findOne({ email: author.email });
              if (authorUser) {
                importData.author = authorUser._id;
              } else {
                importData.author = userId;
              }
            } else if (typeof author === 'string') {
              importData.author = toObjectId(author) || userId;
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await Category.findOne({ name: category.name, type: 'announcement' });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          if (replaceExisting && _id) {
            await Announcement.findByIdAndUpdate(_id, importData, { upsert: true });
            results.announcements.updated++;
          } else {
            await Announcement.create(importData);
            results.announcements.created++;
          }
        } catch (error) {
          results.announcements.errors++;
          console.error('Error importing announcement:', error);
        }
      }
    }

    // Import Advisories
    if (importAdvisories && backupData.data.advisories) {
      initResult('advisories');
      for (const advisoryData of backupData.data.advisories) {
        try {
          const { _id, company, category, ...data } = advisoryData;
          
          const importData: any = { ...data };
          
          // Handle company reference
          if (company) {
            if (typeof company === 'object' && company.name) {
              const companyDoc = await Company.findOne({ name: company.name });
              if (companyDoc) {
                importData.company = companyDoc._id;
              } else {
                continue; // Skip if company not found
              }
            } else if (typeof company === 'string') {
              const companyId = toObjectId(company);
              if (companyId) {
                importData.company = companyId;
              } else {
                continue; // Skip if invalid company ID
              }
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await Category.findOne({ name: category.name, type: 'advisory' });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          if (replaceExisting && _id) {
            await Advisory.findByIdAndUpdate(_id, importData, { upsert: true });
            results.advisories.updated++;
          } else {
            await Advisory.create(importData);
            results.advisories.created++;
          }
        } catch (error) {
          results.advisories.errors++;
          console.error('Error importing advisory:', error);
        }
      }
    }

    // Import Blogs
    if (importBlogs && backupData.data.blogs) {
      initResult('blogs');
      for (const blogData of backupData.data.blogs) {
        try {
          const { _id, author, category, tags, ...data } = blogData;
          
          const importData: any = { ...data };
          
          // Handle author reference
          if (author) {
            if (typeof author === 'object' && author.email) {
              const authorUser = await User.findOne({ email: author.email });
              if (authorUser) {
                importData.author = authorUser._id;
              } else {
                importData.author = userId;
              }
            } else if (typeof author === 'string') {
              importData.author = toObjectId(author) || userId;
            }
          }
          
          // Handle category reference
          if (category && typeof category === 'object' && category.name) {
            const categoryDoc = await Category.findOne({ name: category.name });
            if (categoryDoc) {
              importData.category = categoryDoc._id;
            }
          } else if (category && typeof category === 'string') {
            importData.category = toObjectId(category);
          }
          
          // Ensure tags is an array
          if (tags && Array.isArray(tags)) {
            importData.tags = tags;
          }
          
          if (replaceExisting && _id) {
            await Blog.findByIdAndUpdate(_id, importData, { upsert: true });
            results.blogs.updated++;
          } else {
            const exists = await Blog.findOne({ title: data.title, author: importData.author });
            if (!exists) {
              await Blog.create(importData);
              results.blogs.created++;
            } else {
              results.blogs.skipped++;
            }
          }
        } catch (error) {
          results.blogs.errors++;
          console.error('Error importing blog:', error);
        }
      }
    }

    // Import Posts (after users)
    if (importPosts && backupData.data.posts) {
      initResult('posts');
      for (const postData of backupData.data.posts) {
        try {
          const { _id, author, comments, likes, ...data } = postData;
          
          const importData: any = { ...data };
          
          // Handle author reference
          if (author) {
            if (typeof author === 'object' && author.email) {
              const authorUser = await User.findOne({ email: author.email });
              if (authorUser) {
                importData.author = authorUser._id;
              } else {
                importData.author = userId;
              }
            } else if (typeof author === 'string') {
              importData.author = toObjectId(author) || userId;
            }
          }
          
          // Handle likes array
          if (likes && Array.isArray(likes)) {
            importData.likes = likes.map(l => toObjectId(l)).filter(Boolean);
          }
          
          // Handle comments array
          if (comments && Array.isArray(comments)) {
            importData.comments = [];
            for (const comment of comments) {
              const commentData: any = {
                text: comment.text,
                createdAt: comment.createdAt || new Date()
              };
              
              if (comment.author) {
                if (typeof comment.author === 'object' && comment.author.email) {
                  const commentAuthor = await User.findOne({ email: comment.author.email });
                  if (commentAuthor) {
                    commentData.author = commentAuthor._id;
                  } else {
                    commentData.author = userId;
                  }
                } else if (typeof comment.author === 'string') {
                  commentData.author = toObjectId(comment.author) || userId;
                }
              }
              
              importData.comments.push(commentData);
            }
          }
          
          if (replaceExisting && _id) {
            await Post.findByIdAndUpdate(_id, importData, { upsert: true });
            results.posts.updated++;
          } else {
            await Post.create(importData);
            results.posts.created++;
          }
        } catch (error) {
          results.posts.errors++;
          console.error('Error importing post:', error);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Dades importades exitosament',
      data: {
        importedAt: new Date().toISOString(),
        results,
        options
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al importar les dades',
      error: error.message
    });
  }
};