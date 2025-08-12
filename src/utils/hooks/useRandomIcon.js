// hooks/useRandomIcon.js
import { useMemo } from 'react';

export function useRandomIcon(iconList = null) {
    const defaultIcons = [
        'paw',
        'cube',
        'pricetag',
        'gift',
        'bag-handle',
        'rocket',
        'american',
        'attach',
        'balloon',
        'barbell',
        'baseball',
        'basketball',
        'bed',
        'beer',
        'bonfire',
        'bowling-ball',
        'brush',
        'build',
        'bulb',
        'cafe',
        'calculator',
        'color-wand',
        'color-fill',
        'dice',
        'fast-food',
        'flashlight',
        'flask',
        'football',
        'footsteps',
        'game-controller',
        'glasses',
        'headset',
        'ice-cream', 'pizza',
        'prism',
        'pulse',
        'restaurant',
        'rose',
        'shapes',
        'telescope',
        'umbrella',
        'wine',
        'watch'
    ];

    return useMemo(() => {
        const icons = iconList || defaultIcons;
        const index = Math.floor(Math.random() * icons.length);
        return icons[index];
    }, []);
}
