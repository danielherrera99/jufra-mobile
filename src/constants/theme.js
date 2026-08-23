// Paleta de colores franciscana
export const COLORS = {
    // Colores principales (Seraphic Heritage)
    primary: '#6c2f00', // Marrón terracota
    secondary: '#9a4600', // Umber (usado como accent antes)
    tertiary: '#414231', // Verde grisáceo oscuro

    // Colores de acento
    accent: '#fd8a3e', // Terracota anaranjado (secondary-container)
    gold: '#934b19', // surface-tint (Tono madera oscuro)

    // Neutros
    white: '#ffffff', // surface-container-lowest
    ivory: '#f0eded', // surface-container
    cream: '#fbf9f8', // surface (fondo principal)
    lightGray: '#e4e2e1', // surface-variant
    gray: '#54433a', // on-surface-variant
    darkGray: '#1b1c1c', // on-surface
    black: '#1b1c1c', // Reemplazo de negro puro por on-surface

    // Estados
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#ba1a1a', // error
    info: '#2196F3',

    // Transparencias
    overlay: 'rgba(27, 28, 28, 0.5)', // darkGray con opacidad
    shadow: 'rgba(139, 69, 19, 0.08)', // Ambient Glow suave
};

// Tipografía
export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
};

export const FONT_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
};

// Espaciado
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Bordes
export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 999,
};

// Sombras (Soft Brown Ambient Glow)
export const SHADOWS = {
    small: {
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
};

// Dimensiones
export const SIZES = {
    headerHeight: 60,
    tabBarHeight: 70,
    buttonHeight: 50,
    inputHeight: 50,
    iconSize: 24,
    avatarSize: 50,
};
