import { defineStore } from 'pinia'

// 色彩推导辅助函数
const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return [r, g, b];
}

const adjustColor = (rgb, amount) => {
    return rgb.map(c => Math.max(0, Math.min(255, c + amount)));
}

const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const useThemeStore = defineStore('theme', {
    state: () => {
        return {
            // 当前主题id
            currentTheme: uni.getStorageSync('neuro_theme') || 'cyber',
            // 自定义主色调 Hex
            customColor: uni.getStorageSync('neuro_theme_custom_color') || '#00e5ff',
            // 预设主题列表
            themes: [
                {
                    id: 'cyber',
                    name: 'Cyber Neon',
                    desc: '青紫交织，基础临床协议',
                    primary: '#00e5ff',
                    primaryGradientStart: '#00C6FF',
                    primaryGradientEnd: '#0072FF',
                    secondary: '#8b5cf6',
                    bgHighlight: 'rgba(0, 229, 255, 0.05)',
                    shadowPrimary: 'rgba(0, 229, 255, 0.4)'
                },
                {
                    id: 'matrix',
                    name: 'Matrix Data',
                    desc: '极客深网，纯粹逻辑推演',
                    primary: '#10b981',
                    primaryGradientStart: '#34d399',
                    primaryGradientEnd: '#059669',
                    secondary: '#047857',
                    bgHighlight: 'rgba(16, 185, 129, 0.05)',
                    shadowPrimary: 'rgba(16, 185, 129, 0.4)'
                },
                {
                    id: 'crimson',
                    name: 'Blood Crimson',
                    desc: '猩红狂怒，高危熔断警报',
                    primary: '#ef4444',
                    primaryGradientStart: '#f87171',
                    primaryGradientEnd: '#b91c1c',
                    secondary: '#be123c',
                    bgHighlight: 'rgba(239, 68, 68, 0.05)',
                    shadowPrimary: 'rgba(239, 68, 68, 0.4)'
                },
                {
                    id: 'void',
                    name: 'Deep Void',
                    desc: '虚空白金，摒弃所有杂念的终局',
                    primary: '#f4f4f5',
                    primaryGradientStart: '#e4e4e7',
                    primaryGradientEnd: '#a1a1aa',
                    secondary: '#71717a',
                    bgHighlight: 'rgba(244, 244, 245, 0.05)',
                    shadowPrimary: 'rgba(244, 244, 245, 0.2)'
                }
            ]
        }
    },
    getters: {
        activeThemeData: (state) => {
            if (state.currentTheme === 'custom') {
                return { primary: state.customColor }
            }
            return state.themes.find(t => t.id === state.currentTheme) || state.themes[0]
        },
        themeCssVars: (state) => {
            if (state.currentTheme === 'custom') {
                // 算法生成深浅色系
                const rgb = hexToRgb(state.customColor)
                const gradStartRgb = adjustColor(rgb, 20)
                const gradEndRgb = adjustColor(rgb, -40)
                const secRgb = adjustColor(rgb, -60)

                const gradStart = rgbToHex(...gradStartRgb)
                const gradEnd = rgbToHex(...gradEndRgb)
                const secondary = rgbToHex(...secRgb)

                return `
        --theme-primary: ${state.customColor};
        --theme-primary-grad-start: ${gradStart};
        --theme-primary-grad-end: ${gradEnd};
        --theme-secondary: ${secondary};
        --theme-bg-highlight: rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.05);
        --theme-shadow-primary: rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4);
      `
            }

            const t = state.themes.find(theme => theme.id === state.currentTheme) || state.themes[0]
            return `
        --theme-primary: ${t.primary};
        --theme-primary-grad-start: ${t.primaryGradientStart};
        --theme-primary-grad-end: ${t.primaryGradientEnd};
        --theme-secondary: ${t.secondary};
        --theme-bg-highlight: ${t.bgHighlight};
        --theme-shadow-primary: ${t.shadowPrimary};
      `
        }
    },
    actions: {
        setTheme(themeId) {
            this.currentTheme = themeId
            uni.setStorageSync('neuro_theme', themeId)
            uni.vibrateShort()
        },
        setCustomColor(hexColor) {
            this.customColor = hexColor
            uni.setStorageSync('neuro_theme_custom_color', hexColor)
            if (this.currentTheme !== 'custom') {
                this.setTheme('custom')
            }
            uni.vibrateShort()
        }
    }
})
