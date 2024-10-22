import React from "react";
import {View, type ViewProps} from 'react-native';
import {componentColor} from '@/hooks/useThemeColor';

export default function ThemedView(props: ViewProps): React.ReactNode {
    const { style, ...rest } = props;
    const backgroundColor = componentColor('background');
    return (
        <View style={[{ backgroundColor }, style]} {...rest} />
    )
}
