import RNFS from 'react-native-fs';

export const CACHE_DIR = `${RNFS.CachesDirectoryPath}/videos_cache`;
const MAX_CACHE_SIZE_MB = 200;
//Elimina elementos viejos (más de 1 día) dentro de la caché actual (CACHE_NAME).
export const cleanCache = async (videoPaths) => {
  try {
    const exists = await RNFS.exists(CACHE_DIR);

    if (!exists) {
      //console.warn('Cache folder does not exist:', CACHE_DIR); //Se puede eliminar esta linea o comentarla. esto es solo para debug.
      await RNFS.mkdir(CACHE_DIR);  // 👈 CREA el folder
      return; // ❗ importante salir, porque aún no hay archivos que limpiar
    }

    const files = await RNFS.readDir(CACHE_DIR);
    let totalSize = 0;

    const sortedFiles = files
      .map(f => ({ ...f, mtime: f.mtime ? new Date(f.mtime).getTime() : 0 }))
      .sort((a, b) => a.mtime - b.mtime);

    for (const file of sortedFiles) totalSize += file.size;

    if (totalSize / (1024 * 1024) > MAX_CACHE_SIZE_MB) {
      for (const file of sortedFiles) {
        await RNFS.unlink(file.path);
        totalSize -= file.size;
        if (totalSize / (1024 * 1024) <= MAX_CACHE_SIZE_MB) break;
      }
    }
  } catch (err) {
    console.error('Error cleaning cache:', err);
  }
};