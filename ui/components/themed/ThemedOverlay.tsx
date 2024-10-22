import React from "react";
import componentColor from '@/hooks/componentColor';
import {Overlay, OverlayProps} from "react-native-elements";

export default function ThemedOverlay(props: OverlayProps): React.ReactNode {
    const { overlayStyle, ...rest } = props;
    const backgroundColor = componentColor('background');
    return (
        <Overlay overlayStyle={[{ backgroundColor }, overlayStyle]} {...rest} />
    )
}
