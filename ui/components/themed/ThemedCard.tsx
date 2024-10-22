import React from "react";
import componentColor from '@/hooks/componentColor';
import {Card, CardProps} from "react-native-elements";

type Props = CardProps & {
    children?: React.ReactNode;
}

export default function ThemedCard(props: Props): React.ReactNode {
    const { containerStyle, ...rest } = props;
    const backgroundColor = componentColor('background');
    return (
        // @ts-ignore
        <Card containerStyle={[{ backgroundColor }, containerStyle]} {...rest}>
            {props.children}
        </Card>
    )
}
