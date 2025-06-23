import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio uploads si no existe
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';

    // Organizar por tipo
    if (file.fieldname === 'avatar') folder = 'avatars';
    if (file.fieldname === 'companyLogo') folder = 'companies';
    if (file.fieldname === 'offerImages') folder = 'offers';
    if (file.fieldname === 'postImages') folder = 'posts';

    const fullPath = path.join(uploadDir, folder);

    // Crear subdirectorio si no existe
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtros de archivo
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Tipos permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configuración principal
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});

// Configuraciones específicas
export const uploadAvatar = upload.single('avatar');
export const uploadCompanyLogo = upload.single('companyLogo');
export const uploadOfferImages = upload.array('offerImages', 5);
export const uploadPostImages = upload.array('postImages', 10);

// Utilidad para eliminar archivos
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error eliminando archivo:', error);
  }
};

// Utilidad para obtener URL pública
export const getFileUrl = (filename: string, folder: string = 'general'): string => {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${folder}/${filename}`;
};
