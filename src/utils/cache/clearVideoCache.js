import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

//FUNCIÓN PARA BORRAR TODA LA CARPETA.

const CACHE_DIR = `${RNFS.CachesDirectoryPath}/videos`;

export const clearVideoCache = async () => {
  try {
    let deletedCount = 0;

    const exists = await RNFS.exists(CACHE_DIR);
    if (exists) {
      const files = await RNFS.readDir(CACHE_DIR);
      deletedCount = files.length;

      await RNFS.unlink(CACHE_DIR);      // Borra toda la carpeta
      await RNFS.mkdir(CACHE_DIR);       // La vuelve a crear vacía
    }

    await AsyncStorage.removeItem('cachedVideos'); // Limpia el registro de caché

    console.log(`✅ Caché eliminada: ${deletedCount} archivos`);
    return { success: true, deletedCount };
  } catch (err) {
    console.error('❌ Error al borrar caché de videos:', err);
    return { success: false, deletedCount: 0 };
  }
};
export const logCachedVideos = async () => {
  try {
    const files = await RNFS.readDir(CACHE_DIR);
    console.log('📁 Archivos en caché:', files.map(f => f.name));
    return files.length;
  } catch (err) {
    console.error('❌ Error leyendo la caché de videos:', err);
    return 0;
  }
};