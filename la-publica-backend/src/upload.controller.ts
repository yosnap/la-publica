import { Request, Response } from 'express';
import path from 'path';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
  }

  // Construimos la ruta de acceso público para el frontend
  const publicPath = path.join('/uploads/images', req.file.filename).replace(/\\/g, '/');

  return res.status(201).json({ 
    message: 'Imagen subida correctamente.',
    imageUrl: publicPath
  });
}; 