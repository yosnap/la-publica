import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupPost extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  images?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions?: mongoose.Types.ObjectId[];
  mood?: {
    emoji: string;
    label: string;
  };
  likes: mongoose.Types.ObjectId[];
  comments: Array<{
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: mongoose.Types.ObjectId[];
  }>;
  isPinned: boolean;
  isApproved: boolean; // Para grupos con moderación
  commentsDisabled: boolean;
  privacy: 'public' | 'members_only';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  editHistory?: Array<{
    content: string;
    editedAt: Date;
    editedBy: mongoose.Types.ObjectId;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Métodos del esquema
  canUserView(userId: string, userGroupRole?: string): boolean;
  canUserEdit(userId: string, userGroupRole?: string): boolean;
  canUserModerate(userId: string, userGroupRole?: string): boolean;
}

const groupPostSchema = new Schema<IGroupPost>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'URL de imagen inválida'
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL de archivo inválida'
      }
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      max: 50 * 1024 * 1024 // 50MB max
    }
  }],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  mood: {
    emoji: {
      type: String,
      maxlength: 2
    },
    label: {
      type: String,
      maxlength: 50
    }
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true // Por defecto aprobado, cambia según configuración del grupo
  },
  commentsDisabled: {
    type: Boolean,
    default: false
  },
  privacy: {
    type: String,
    enum: ['public', 'members_only'],
    default: 'members_only'
  },
  moderationNote: {
    type: String,
    maxlength: 500
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  editHistory: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar performance
groupPostSchema.index({ group: 1, createdAt: -1 });
groupPostSchema.index({ author: 1, createdAt: -1 });
groupPostSchema.index({ group: 1, isPinned: -1, createdAt: -1 });
groupPostSchema.index({ group: 1, isApproved: 1, isActive: 1, createdAt: -1 });
groupPostSchema.index({ 'comments.author': 1 });
groupPostSchema.index({ likes: 1 });
groupPostSchema.index({ mentions: 1 });

// Virtual para contar likes
groupPostSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual para contar comentarios
groupPostSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Middleware para actualizar el contador de posts del grupo
groupPostSchema.post('save', async function() {
  try {
    // Usar mongoose.models para evitar problemas de referencia circular
    const Group = mongoose.models.Group || mongoose.model('Group');
    await Group.updateOne(
      { _id: this.group },
      { $inc: { postCount: 1 } }
    );
  } catch (error) {
    console.error('Error updating group post count:', error);
  }
});

// Middleware para decrementar contador cuando se elimina
groupPostSchema.post('deleteOne', { document: true, query: false }, async function(this: IGroupPost) {
  try {
    // Usar mongoose.models para evitar problemas de referencia circular
    const Group = mongoose.models.Group || mongoose.model('Group');
    await Group.updateOne(
      { _id: this.group },
      { $inc: { postCount: -1 } }
    );
  } catch (error) {
    console.error('Error decrementing group post count:', error);
  }
});

// Método para verificar si un usuario puede ver el post
groupPostSchema.methods.canUserView = function(userId: string, userGroupRole?: string) {
  // Si el post no está activo, solo el autor y admins/moderadores pueden verlo
  if (!this.isActive) {
    return this.author.toString() === userId || ['admin', 'moderator'].includes(userGroupRole || '');
  }

  // Si el post no está aprobado, solo el autor y admins/moderadores pueden verlo
  if (!this.isApproved) {
    return this.author.toString() === userId || ['admin', 'moderator'].includes(userGroupRole || '');
  }

  return true;
};

// Método para verificar si un usuario puede editar el post
groupPostSchema.methods.canUserEdit = function(userId: string, userGroupRole?: string) {
  // El autor siempre puede editar (dentro de un tiempo límite)
  if (this.author.toString() === userId) {
    // Permitir edición dentro de las primeras 24 horas
    const hoursSinceCreation = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  }

  // Admins y moderadores siempre pueden editar
  return ['admin', 'moderator'].includes(userGroupRole || '');
};

// Método para verificir si un usuario puede moderar el post
groupPostSchema.methods.canUserModerate = function(userId: string, userGroupRole?: string) {
  // Solo admins y moderadores pueden moderar posts de otros
  if (this.author.toString() !== userId) {
    return ['admin', 'moderator'].includes(userGroupRole || '');
  }
  return false;
};

const GroupPost = mongoose.model<IGroupPost>('GroupPost', groupPostSchema);

export default GroupPost;