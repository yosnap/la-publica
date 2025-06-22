import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para un comentario
export interface IComment extends Document {
  author: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

// Interfaz para el documento de Post
export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para un comentario
const CommentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Esquema para un Post
const PostSchema = new Schema<IPost>(
  {
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
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [CommentSchema]
  },
  {
    timestamps: true
  }
);

// Add a text index to the content field for searching
PostSchema.index({ content: 'text' });

// Exportar el modelo
const Post = mongoose.model<IPost>('Post', PostSchema);

export default Post; 