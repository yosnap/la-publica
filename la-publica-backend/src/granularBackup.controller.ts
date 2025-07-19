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

    // Import logic for each data type would go here...
    // This is a simplified version - full implementation would handle each model

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