import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiResponse } from '../types';

// Utilidades para contraseñas
export class PasswordService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateTempPassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Utilidades para respuestas de API
export class ResponseService {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  static successWithPagination<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      message,
      pagination: {
        ...pagination,
        pages: Math.ceil(pagination.total / pagination.limit)
      }
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error
    };
  }
}

// Utilidades para paginación
export class PaginationService {
  static calculatePagination(query: any) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static generateSortObject(sort?: string, order: 'asc' | 'desc' = 'desc') {
    if (!sort) return { createdAt: -1 };

    return { [sort]: order === 'asc' ? 1 : -1 };
  }

  static createSearchFilter(query: any) {
    const filter: any = {};

    if (query.q) {
      filter.$or = [
        { title: { $regex: query.q, $options: 'i' } },
        { description: { $regex: query.q, $options: 'i' } }
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.location) {
      filter.$or = [
        { 'location.city': { $regex: query.location, $options: 'i' } },
        { 'location.country': { $regex: query.location, $options: 'i' } }
      ];
    }

    if (query.priceMin || query.priceMax) {
      filter['price.amount'] = {};
      if (query.priceMin) filter['price.amount'].$gte = Number(query.priceMin);
      if (query.priceMax) filter['price.amount'].$lte = Number(query.priceMax);
    }

    if (query.tags) {
      const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
      filter.tags = { $in: tags };
    }

    return filter;
  }
}

// Utilidades para fechas
export class DateService {
  static formatDate(date: Date, locale: string = 'es-ES'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static timeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return this.formatDate(date);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

// Utilidades para archivos
export class FileService {
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Utilidades para validación
export class ValidationService {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[<>&"']/g, (match) => {
        const htmlEntities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return htmlEntities[match] || match;
      });
  }
}
