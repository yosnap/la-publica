import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento de Forum
export interface IForum extends Document {
  name: string;
  description: string;
  category: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  isActive: boolean;
  isPinned: boolean;
  isLocked: boolean;
  topicCount: number;
  postCount: number;
  lastPost?: {
    postId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    authorName: string;
    title: string;
    createdAt: Date;
  };
  rules?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para un Foro
const ForumSchema = new Schema<IForum>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ForumCategory',
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    moderators: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    topicCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    },
    lastPost: {
      postId: {
        type: Schema.Types.ObjectId,
        ref: 'ForumPost'
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      authorName: String,
      title: String,
      createdAt: Date
    },
    rules: [String]
  },
  {
    timestamps: true
  }
);

// Índices
ForumSchema.index({ category: 1 });
ForumSchema.index({ creator: 1 });
ForumSchema.index({ isActive: 1 });
ForumSchema.index({ isPinned: -1, updatedAt: -1 });
ForumSchema.index({ name: 'text', description: 'text' });

// Middleware para actualizar contadores
ForumSchema.methods.updateStats = async function() {
  // Usar mongoose.models para evitar problemas de referencia circular
  const ForumPost = mongoose.models.ForumPost || mongoose.model('ForumPost');

  const stats = await ForumPost.aggregate([
    { $match: { forum: this._id, isActive: true } },
    { 
      $group: { 
        _id: null, 
        totalPosts: { $sum: 1 },
        lastPost: { $max: { createdAt: "$createdAt", postId: "$_id", author: "$author", title: "$title" } }
      } 
    }
  ]);

  if (stats.length > 0) {
    this.postCount = stats[0].totalPosts;
    if (stats[0].lastPost) {
      this.lastPost = stats[0].lastPost;
    }
  } else {
    this.postCount = 0;
    this.lastPost = undefined;
  }

  await this.save();
};

// Exportar el modelo
const Forum = mongoose.model<IForum>('Forum', ForumSchema);

export default Forum;