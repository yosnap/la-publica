import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento de ForumPost
export interface IForumPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  forum: mongoose.Types.ObjectId;
  parentPost?: mongoose.Types.ObjectId; // Para respuestas/comentarios
  isActive: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatedBy?: mongoose.Types.ObjectId;
  moderationReason?: string;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  replyCount: number;
  viewCount: number;
  lastActivity: Date;
  tags?: string[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    filename: string;
  }[];
  reports: {
    _id?: mongoose.Types.ObjectId;
    reportedBy: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    resolvedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  editHistory: {
    editedBy: mongoose.Types.ObjectId;
    previousContent: string;
    reason?: string;
    editedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para una Publicación de Foro
const ForumPostSchema = new Schema<IForumPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10000
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    forum: {
      type: Schema.Types.ObjectId,
      ref: 'Forum',
      required: true
    },
    parentPost: {
      type: Schema.Types.ObjectId,
      ref: 'ForumPost'
    },
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
    isApproved: {
      type: Boolean,
      default: true // Auto-aprobado por defecto, se puede cambiar según configuración
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved'
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    moderationReason: String,
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    dislikes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    replyCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    tags: [String],
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'file'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      }
    }],
    reports: [{
      reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: {
        type: String,
        required: true,
        enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'copyright', 'other']
      },
      description: String,
      status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending'
      },
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    editHistory: [{
      editedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      previousContent: {
        type: String,
        required: true
      },
      reason: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Índices
ForumPostSchema.index({ forum: 1, createdAt: -1 });
ForumPostSchema.index({ author: 1 });
ForumPostSchema.index({ parentPost: 1 });
ForumPostSchema.index({ isActive: 1, isApproved: 1 });
ForumPostSchema.index({ isPinned: -1, lastActivity: -1 });
ForumPostSchema.index({ moderationStatus: 1 });
ForumPostSchema.index({ 'reports.status': 1 });
ForumPostSchema.index({ title: 'text', content: 'text' });

// Middleware para actualizar contadores
ForumPostSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Actualizar contador de respuestas del post padre
    if (this.parentPost) {
      await mongoose.model('ForumPost').findByIdAndUpdate(this.parentPost, {
        $inc: { replyCount: 1 },
        lastActivity: new Date()
      });
    }
    
    // Actualizar contadores del foro
    const Forum = mongoose.model('Forum');
    await Forum.findByIdAndUpdate(this.forum, {
      $inc: { postCount: 1 }
    });
  }
  next();
});

// Middleware para actualizar estadísticas al eliminar
ForumPostSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  if (update.isActive === false) {
    const post = await this.model.findOne(this.getQuery());
    if (post) {
      // Actualizar contadores
      if (post.parentPost) {
        await mongoose.model('ForumPost').findByIdAndUpdate(post.parentPost, {
          $inc: { replyCount: -1 }
        });
      }
      
      const Forum = mongoose.model('Forum');
      await Forum.findByIdAndUpdate(post.forum, {
        $inc: { postCount: -1 }
      });
    }
  }
  next();
});

// Métodos de instancia
ForumPostSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  await this.save();
};

ForumPostSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  await this.save();
};

// Exportar el modelo
const ForumPost = mongoose.model<IForumPost>('ForumPost', ForumPostSchema);

export default ForumPost;