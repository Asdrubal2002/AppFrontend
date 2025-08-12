import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CACHE_LIMIT_MB = 500;
const CACHE_DIR = `${RNFS.CachesDirectoryPath}/videos`;

const getCacheSize = async () => {
    try {
        const files = await RNFS.readDir(CACHE_DIR);
        const sizes = await Promise.all(files.map(file => RNFS.stat(file.path).then(stat => stat.size)));
        return sizes.reduce((acc, size) => acc + size, 0);
    } catch {
        return 0;
    }
};
//Elimina TODAS las cachés cuyo nombre no sea CACHE_NAME.
const clearOldCache = async () => {
    const files = await RNFS.readDir(CACHE_DIR);
    if (files.length === 0) return;

    const totalSize = await getCacheSize();
    if (totalSize < CACHE_LIMIT_MB * 1024 * 1024) return;

    const sorted = files.sort((a, b) => a.mtime - b.mtime);
    for (const file of sorted) {
        await RNFS.unlink(file.path);
        const newSize = await getCacheSize();
        if (newSize < CACHE_LIMIT_MB * 1024 * 1024) break;
    }
};

const downloadInProgress = {};

const CachedVideo = ({ uri, paused, style, onLoad, ...props }) => {
    const [localPath, setLocalPath] = useState(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPaused, setIsPaused] = useState(paused);
    const videoRef = useRef(null);

    useEffect(() => {
        const prepare = async () => {
            try {
                if (!uri) {
                    console.warn('Invalid video URI:', uri);
                    return;
                }

                if (uri.startsWith('/data') || uri.startsWith('file://')) {
                    setLocalPath(uri.startsWith('file://') ? uri : `file://${uri}`);
                    return;
                }

                if (!uri.startsWith('http')) {
                    console.warn('Invalid video URI:', uri);
                    return;
                }

                await RNFS.mkdir(CACHE_DIR);
                const name = uri.split('/').pop();
                const path = `${CACHE_DIR}/${name}`;

                const cachedVideos = JSON.parse(await AsyncStorage.getItem('cachedVideos') || '{}');

                if (await RNFS.exists(path)) {
                    setLocalPath(path);
                } else if (downloadInProgress[uri]) {
                    console.log('🟡 Esperando descarga en curso para:', uri);
                    await downloadInProgress[uri];
                    if (await RNFS.exists(path)) {
                        setLocalPath(`file://${path}`);
                    }
                } else {
                    console.log('⬇️ Descargando:', uri);
                    const downloadPromise = RNFS.downloadFile({
                        fromUrl: uri,
                        toFile: path
                    }).promise;

                    downloadInProgress[uri] = downloadPromise;

                    const result = await downloadPromise;
                    delete downloadInProgress[uri];

                    if (result.statusCode === 200) {
                        setLocalPath(`file://${path}`);
                        cachedVideos[uri] = path;
                        await AsyncStorage.setItem('cachedVideos', JSON.stringify(cachedVideos));
                        await clearOldCache();
                    } else {
                        console.warn('Video download failed:', result.statusCode);
                    }
                }
            } catch (err) {
                console.error('Error caching video:', err, uri);
            }
        };

        prepare();
    }, [uri]);

    // Sincronizar pausa externa
    useEffect(() => {
        setIsPaused(paused);
    }, [paused]);

    const handleSeek = (seekTime) => {
        videoRef.current?.seek(seekTime);
    };

    const togglePlayPause = () => {
        setIsPaused(!isPaused);
    };

    if (!localPath) {
        return <ActivityIndicator color="white" style={style} />;
    }

    return (
        <View style={style}>
            <Video
                ref={videoRef}
                source={{ uri: localPath }}
                paused={isPaused}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                repeat
                onLoad={(e) => {
                    setDuration(e.duration);
                    onLoad?.(e);
                }}
                onProgress={({ currentTime }) => setProgress(currentTime)}
                controls={false}
                {...props}
            />
            {/* Overlay de controles */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={togglePlayPause}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
            </TouchableOpacity>
            {/* Barra de progreso (siempre visible) */}
            <Slider
                value={progress}
                minimumValue={0}
                maximumValue={duration}
                onSlidingComplete={handleSeek}
                thumbTintColor="#FFF"
                minimumTrackTintColor="#005dcc"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    alignSelf: 'center',
                }}
            />
        </View>
    );
};


export default CachedVideo;
