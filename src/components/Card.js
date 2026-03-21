import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';

const Card = ({
    children,
    title,
    subtitle,
    onPress,
    gradient = false,
    style,
    headerRight
}) => {
    const CardContent = (
        <View style={[styles.card, style]}>
            {(title || subtitle || headerRight) && (
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
                </View>
            )}
            <View style={styles.content}>{children}</View>
        </View>
    );

    if (gradient) {
        return (
            <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradientCard, style]}
                >
                    {children}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                {CardContent}
            </TouchableOpacity>
        );
    }

    return CardContent;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    gradientCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.large,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        marginLeft: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    content: {
        // Contenido del card
    },
});

export default Card;
