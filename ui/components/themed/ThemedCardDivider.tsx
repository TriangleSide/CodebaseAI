import React from "react";
import componentColor from "@/hooks/componentColor";
import {Card, DividerProps} from "react-native-elements";

const ThemedCardDivider: React.FC = (props: DividerProps) => {
    const { ...rest } = props;
    const color = componentColor('cardDivider');
    return (
        <Card.Divider color={color} width={2} {...rest} />
    );
};

export default ThemedCardDivider;