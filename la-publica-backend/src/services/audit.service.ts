import RoleAuditLog, { AuditAction, IAuditChanges } from '../roleAuditLog.model';
import mongoose from 'mongoose';

/**
 * Servicio de auditoría para el sistema RBAC
 */
export class AuditService {
  /**
   * Registra una acción de auditoría
   */
  async log(params: {
    action: AuditAction;
    roleId?: mongoose.Types.ObjectId | string;
    roleName?: string;
    performedBy: mongoose.Types.ObjectId | string;
    changes: IAuditChanges;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await RoleAuditLog.create({
        action: params.action,
        roleId: params.roleId,
        roleName: params.roleName,
        performedBy: params.performedBy,
        changes: params.changes,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error registrant log d\'auditoria:', error);
      // No lanzamos el error para no interrumpir la operación principal
    }
  }

  /**
   * Obtiene los logs de auditoría de un rol específico
   */
  async getRoleLogs(
    roleId: string,
    options?: {
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const query: any = { roleId };

    if (options?.startDate || options?.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }

    const logs = await RoleAuditLog.find(query)
      .populate('performedBy', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(options?.limit || 50)
      .skip(options?.skip || 0)
      .lean();

    const total = await RoleAuditLog.countDocuments(query);

    return {
      logs,
      total,
      page: Math.floor((options?.skip || 0) / (options?.limit || 50)) + 1,
      pages: Math.ceil(total / (options?.limit || 50)),
    };
  }

  /**
   * Obtiene los logs de auditoría de un usuario específico
   */
  async getUserLogs(
    userId: string,
    options?: {
      limit?: number;
      skip?: number;
      actions?: AuditAction[];
    }
  ) {
    const query: any = { performedBy: userId };

    if (options?.actions && options.actions.length > 0) {
      query.action = { $in: options.actions };
    }

    const logs = await RoleAuditLog.find(query)
      .populate('roleId', 'name slug')
      .sort({ timestamp: -1 })
      .limit(options?.limit || 50)
      .skip(options?.skip || 0)
      .lean();

    const total = await RoleAuditLog.countDocuments(query);

    return {
      logs,
      total,
      page: Math.floor((options?.skip || 0) / (options?.limit || 50)) + 1,
      pages: Math.ceil(total / (options?.limit || 50)),
    };
  }

  /**
   * Obtiene todos los logs de auditoría con filtros
   */
  async getAllLogs(options?: {
    limit?: number;
    skip?: number;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query: any = {};

    if (options?.action) {
      query.action = options.action;
    }

    if (options?.startDate || options?.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }

    const logs = await RoleAuditLog.find(query)
      .populate('performedBy', 'firstName lastName email')
      .populate('roleId', 'name slug')
      .sort({ timestamp: -1 })
      .limit(options?.limit || 50)
      .skip(options?.skip || 0)
      .lean();

    const total = await RoleAuditLog.countDocuments(query);

    return {
      logs,
      total,
      page: Math.floor((options?.skip || 0) / (options?.limit || 50)) + 1,
      pages: Math.ceil(total / (options?.limit || 50)),
    };
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  async getStats(options?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const matchStage: any = {};

    if (options?.startDate || options?.endDate) {
      matchStage.timestamp = {};
      if (options.startDate) {
        matchStage.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        matchStage.timestamp.$lte = options.endDate;
      }
    }

    const pipeline: any[] = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    });

    const actionStats = await RoleAuditLog.aggregate(pipeline);

    // Total de logs
    const total = await RoleAuditLog.countDocuments(matchStage);

    // Usuarios más activos
    const topUsersPipeline: any[] = [];
    if (Object.keys(matchStage).length > 0) {
      topUsersPipeline.push({ $match: matchStage });
    }

    topUsersPipeline.push(
      {
        $group: {
          _id: '$performedBy',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          count: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.email': 1,
        },
      }
    );

    const topUsers = await RoleAuditLog.aggregate(topUsersPipeline);

    return {
      total,
      byAction: actionStats,
      topUsers,
    };
  }

  /**
   * Elimina logs antiguos (cleanup)
   */
  async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await RoleAuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }
}

export default new AuditService();
