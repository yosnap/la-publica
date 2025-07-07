import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para un miembro del grupo
export interface IGroupMember extends Document {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
}

// Interfaz para el documento de Group
export interface IGroup extends Document {
  name: string;
  description: string;
  category: mongoose.Types.ObjectId;
  privacy: 'public' | 'private';
  image?: string;
  coverImage?: string;
  creator: mongoose.Types.ObjectId;
  members: IGroupMember[];
  memberCount: number;
  postCount: number;
  tags: string[];
  rules?: string[];
  location?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para un miembro del grupo
const GroupMemberSchema = new Schema<IGroupMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Esquema para un Grupo
const GroupSchema = new Schema<IGroup>(
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
      ref: 'GroupCategory',
      required: true
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    image: {
      type: String,
      required: false
    },
    coverImage: {
      type: String,
      required: false
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [GroupMemberSchema],
    memberCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    rules: [{
      type: String,
      trim: true,
      maxlength: 200
    }],
    location: {
      type: String,
      trim: true,
      maxlength: 100
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Middleware para actualizar memberCount automáticamente
GroupSchema.pre('save', function(this: IGroup) {
  this.memberCount = this.members.length;
});

// Índices para búsqueda
GroupSchema.index({ name: 'text', description: 'text', tags: 'text' });
GroupSchema.index({ category: 1 });
GroupSchema.index({ privacy: 1 });
GroupSchema.index({ isActive: 1 });

// Exportar el modelo
const Group = mongoose.model<IGroup>('Group', GroupSchema);

export default Group;