import React from "react";
import {View, type ViewProps} from 'react-native';
import componentColor from '@/hooks/componentColor';

type Props = ViewProps & {
    center?: boolean;
}

export default function ThemedView(props: Props): React.ReactNode {
    const { style, center, ...rest } = props;
    const backgroundColor = componentColor('background');
    if (center) {
      return (
          <View style={[{ backgroundColor, maxWidth: 1024, marginLeft: 'auto', marginRight: 'auto', width: "100%" }, style]} {...rest} />
      )
    } else {
      return (
          <View style={[{ backgroundColor, maxWidth: 1024 }, style]} {...rest} />
      )
    }
}
