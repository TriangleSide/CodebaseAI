import React from "react";
import { Text, type TextProps, StyleSheet } from 'react-native';
import componentColor from '@/hooks/componentColor';

export const TEXT_TYPES = {
    DEFAULT: 'default',
    TITLE: 'title',
    SUBTITLE: 'subtitle',
} as const;

type Props = TextProps & {
    type?: typeof TEXT_TYPES[keyof typeof TEXT_TYPES];
};

export default function ThemedText(props: Props): React.ReactNode {
    const { style, type = TEXT_TYPES.DEFAULT, ...rest } = props;
    const color = componentColor('text');
    return (
        <Text
            style={[
                { color },
                type === TEXT_TYPES.DEFAULT ? styles.default : undefined,
                type === TEXT_TYPES.TITLE ? styles.title : undefined,
                type === TEXT_TYPES.SUBTITLE ? styles.subtitle : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
