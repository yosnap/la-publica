import { Request, Response } from 'express';
import User from './user.model';
import { PasswordService } from './utils/helpers';
import SystemInfo from './systemInfo.model';

interface InstallationStatus {
  isInstalled: boolean;
  hasAdminUser: boolean;
  systemVersion: string;
}

// Verificar si el sistema ya está instalado
export const checkInstallationStatus = async (req: Request, res: Response) => {
  try {
    const adminExists = await User.countDocuments({ role: 'admin' }) > 0;
    const systemInfo = await SystemInfo.findOne();

    const status: InstallationStatus = {
      isInstalled: adminExists,
      hasAdminUser: adminExists,
      systemVersion: systemInfo?.version || '1.0.4'
    };

    return res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error checking installation status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verificando el estado de instalación'
    });
  }
};

// Instalar el sistema (crear admin y configuración inicial)
export const installSystem = async (req: Request, res: Response) => {
  try {
    // Verificar si ya está instalado
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'El sistema ya está instalado. Esta ruta está deshabilitada.'
      });
    }

    const {
      email = 'admin@lapublica.cat',
      password = 'Admin123!',
      firstName = 'Administrador',
      lastName = 'Sistema',
      username = 'admin'
    } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar que no existan usuarios con ese email o username
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con ese email o username'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await PasswordService.hashPassword(password);

    // Crear usuario administrador
    const adminUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      username: username.toLowerCase(),
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      bio: 'Administrador del sistema La Pública'
    });

    await adminUser.save();

    // Crear o actualizar información del sistema
    let systemInfo = await SystemInfo.findOne();

    if (!systemInfo) {
      systemInfo = new SystemInfo({
        version: '1.0.4',
        lastUpdated: new Date(),
        settings: {
          maintenanceMode: false,
          registrationEnabled: true,
          installationCompleted: true,
          installationDate: new Date()
        }
      });
    } else {
      systemInfo.settings.installationCompleted = true;
      systemInfo.settings.installationDate = new Date();
      systemInfo.lastUpdated = new Date();
    }

    await systemInfo.save();

    // Crear categorías por defecto
    await createDefaultCategories();

    console.log(`✅ Sistema instalado exitosamente`);
    console.log(`   Admin Email: ${adminUser.email}`);
    console.log(`   Admin Username: ${adminUser.username}`);
    console.log(`   Fecha de instalación: ${new Date().toISOString()}`);

    return res.status(201).json({
      success: true,
      message: 'Sistema instalado exitosamente',
      data: {
        adminUser: {
          id: adminUser._id,
          email: adminUser.email,
          username: adminUser.username,
          role: adminUser.role
        },
        installationDate: new Date(),
        nextSteps: [
          'Inicia sesión en el panel de administración',
          'Cambia la contraseña por defecto',
          'Configura las opciones del sistema',
          'La ruta de instalación ha sido deshabilitada automáticamente'
        ]
      }
    });

  } catch (error) {
    console.error('Error during installation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error durante la instalación del sistema'
    });
  }
};

// Función auxiliar para crear categorías por defecto
async function createDefaultCategories() {
  try {
    const Category = require('./category.model').default;

    const defaultCategories = [
      {
        name: 'General',
        description: 'Temas generales y discusiones diversas',
        color: '#3B82F6',
        isActive: true
      },
      {
        name: 'Política',
        description: 'Discusiones sobre política local y nacional',
        color: '#EF4444',
        isActive: true
      },
      {
        name: 'Economía',
        description: 'Temas económicos y financieros',
        color: '#10B981',
        isActive: true
      },
      {
        name: 'Cultura',
        description: 'Arte, música, literatura y eventos culturales',
        color: '#8B5CF6',
        isActive: true
      },
      {
        name: 'Tecnología',
        description: 'Innovación, tech y transformación digital',
        color: '#F59E0B',
        isActive: true
      },
      {
        name: 'Medioambiente',
        description: 'Sostenibilidad y temas ambientales',
        color: '#059669',
        isActive: true
      }
    ];

    // Solo crear categorías si no existen
    const existingCategories = await Category.countDocuments();

    if (existingCategories === 0) {
      await Category.insertMany(defaultCategories);
      console.log(`✅ ${defaultCategories.length} categorías por defecto creadas`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.log('⚠️ No se pudieron crear las categorías por defecto:', errorMessage);
  }
}

// Middleware para proteger la ruta de instalación
export const protectInstallRoute = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount > 0) {
      res.status(403).json({
        success: false,
        message: 'Esta ruta está deshabilitada. El sistema ya está instalado.',
        hint: 'Si necesitas crear otro administrador, hazlo desde el panel de administración.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando el estado de instalación'
    });
    return;
  }
};
