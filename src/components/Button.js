import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SHADOWS, SIZES } from '../constants/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle
}) => {
    const getColors = () => {
        switch (variant) {
            case 'primary':
                return [COLORS.primary, COLORS.accent];
            case 'secondary':
                return [COLORS.secondary, COLORS.gold];
            case 'success':
                return [COLORS.success, '#45a049'];
            case 'outline':
                return ['transparent', 'transparent'];
            default:
                return [COLORS.primary, COLORS.accent];
        }
    };

    const getSize = () => {
        switch (size) {
            case 'small':
                return { height: 40, paddingHorizontal: 16 };
            case 'medium':
                return { height: SIZES.buttonHeight, paddingHorizontal: 24 };
            case 'large':
                return { height: 60, paddingHorizontal: 32 };
            default:
                return { height: SIZES.buttonHeight, paddingHorizontal: 24 };
        }
    };

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={getColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                    styles.gradient,
                    getSize(),
                    variant === 'outline' && styles.outline,
                    isDisabled && styles.disabled,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
                ) : (
                    <>
                        {icon && <>{icon}</>}
                        <Text
                            style={[
                                styles.text,
                                variant === 'outline' && styles.outlineText,
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.medium,
    },
    outline: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        ...SHADOWS.small,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: COLORS.white,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginLeft: 8,
    },
    outlineText: {
        color: COLORS.primary,
    },
});

export default Button;
