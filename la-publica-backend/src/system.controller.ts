import { Request, Response } from 'express';
import SystemInfo from './systemInfo.model';
import Log from './log.model';
import User from './user.model';
import Post from './post.model';
import Company from './company.model';
import JobOffer from './jobOffer.model';
import Announcement from './announcement.model';
import Advisory from './advisory.model';
import mongoose from 'mongoose';
import os from 'os';
import { execSync } from 'child_process';

// Obtener información del sistema
export const getSystemInfo = async (req: Request, res: Response) => {
  try {
    // Obtener o crear información del sistema
    let systemInfo = await SystemInfo.findOne();
    if (!systemInfo) {
      systemInfo = await SystemInfo.create({ version: '1.0.0' });
    }

    // Estadísticas de la base de datos
    const [
      usersCount,
      companiesCount,
      postsCount,
      jobOffersCount,
      announcementsCount,
      advisoriesCount
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Post.countDocuments(),
      JobOffer.countDocuments(),
      Announcement.countDocuments(),
      Advisory.countDocuments()
    ]);

    // Información del servidor
    const serverInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      cpu: {
        model: os.cpus()[0].model,
        cores: os.cpus().length,
        usage: os.loadavg()
      }
    };

    // Información de MongoDB
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const dbStats = await db.stats();
    const mongoInfo = {
      version: await getMongoVersion(),
      database: mongoose.connection.name,
      collections: dbStats.collections,
      dataSize: formatBytes(dbStats.dataSize),
      storageSize: formatBytes(dbStats.storageSize),
      indexes: dbStats.indexes,
      indexSize: formatBytes(dbStats.indexSize)
    };

    // Dependencias principales
    const packageJson = require('../package.json');
    const dependencies = {
      express: packageJson.dependencies.express,
      mongoose: packageJson.dependencies.mongoose,
      typescript: packageJson.devDependencies.typescript,
      node: process.version
    };

    return res.json({
      success: true,
      data: {
        system: {
          version: systemInfo.version,
          lastUpdated: systemInfo.lastUpdated,
          environment: process.env.NODE_ENV || 'development',
          settings: systemInfo.settings
        },
        statistics: {
          users: usersCount,
          companies: companiesCount,
          posts: postsCount,
          jobOffers: jobOffersCount,
          announcements: announcementsCount,
          advisories: advisoriesCount,
          totalContent: postsCount + jobOffersCount + announcementsCount + advisoriesCount
        },
        server: serverInfo,
        database: mongoInfo,
        dependencies,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    await createLog('error', 'Error al obtener información del sistema', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener información del sistema', 
      error: error.message 
    });
  }
};

// Obtener logs del sistema
export const getLogs = async (req: Request, res: Response) => {
  try {
    const { 
      level, 
      startDate, 
      endDate, 
      source,
      page = 1, 
      limit = 50 
    } = req.query;

    const query: any = {};
    
    if (level) {
      query.level = level;
    }
    
    if (source) {
      query.source = source;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      Log.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Log.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener logs', 
      error: error.message 
    });
  }
};

// Obtener un log específico
export const getLogById = async (req: Request, res: Response) => {
  try {
    const log = await Log.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!log) {
      return res.status(404).json({ 
        success: false, 
        message: 'Log no encontrado' 
      });
    }

    return res.json({
      success: true,
      data: log
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el log', 
      error: error.message 
    });
  }
};

// Eliminar logs
export const deleteLogs = async (req: Request, res: Response) => {
  try {
    const { ids, olderThan } = req.body;

    let result;
    
    if (ids && Array.isArray(ids)) {
      // Eliminar logs específicos
      result = await Log.deleteMany({ _id: { $in: ids } });
    } else if (olderThan) {
      // Eliminar logs más antiguos que la fecha especificada
      const date = new Date(olderThan);
      result = await Log.deleteMany({ timestamp: { $lt: date } });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Debe proporcionar IDs o fecha límite' 
      });
    }

    await createLog('info', `Logs eliminados: ${result.deletedCount}`, { 
      deletedBy: (req as any).user?.userId 
    });

    return res.json({
      success: true,
      message: `${result.deletedCount} logs eliminados`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar logs', 
      error: error.message 
    });
  }
};

// Actualizar versión del sistema
export const updateSystemVersion = async (req: Request, res: Response) => {
  try {
    const { version } = req.body;

    if (!version) {
      return res.status(400).json({ 
        success: false, 
        message: 'La versión es requerida' 
      });
    }

    let systemInfo = await SystemInfo.findOne();
    if (!systemInfo) {
      systemInfo = await SystemInfo.create({ version });
    } else {
      systemInfo.version = version;
      systemInfo.lastUpdated = new Date();
      await systemInfo.save();
    }

    await createLog('info', `Versión del sistema actualizada a ${version}`, { 
      updatedBy: (req as any).user?.userId 
    });

    return res.json({
      success: true,
      message: 'Versión actualizada correctamente',
      data: systemInfo
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar la versión', 
      error: error.message 
    });
  }
};

// Función auxiliar para crear logs
export const createLog = async (
  level: 'info' | 'warning' | 'error' | 'debug',
  message: string,
  details?: any,
  userId?: string
) => {
  try {
    await Log.create({
      level,
      message,
      details,
      userId,
      source: 'system'
    });
  } catch (error) {
    console.error('Error al crear log:', error);
  }
};

// Función auxiliar para formatear bytes
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Función auxiliar para obtener versión de MongoDB
const getMongoVersion = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return 'Unknown';
    }
    const admin = db.admin();
    const info = await admin.serverInfo();
    return info.version;
  } catch (error) {
    return 'Unknown';
  }
};