import React, {PropsWithChildren} from "react";
import {StyleSheet} from "react-native";
import Markdown, {MarkdownProps} from "react-native-markdown-display";
import ThemedView from "@/components/themed/ThemedView";
import ThemedText from "@/components/themed/ThemedText";
import componentColor from "@/hooks/componentColor";

export default function ThemedMarkdown(props: PropsWithChildren<MarkdownProps>): React.ReactNode {
    const backgroundColor = componentColor('background')
    const codeColor = componentColor('codeColor');
    const textColor = componentColor('text');
    const defaultStyle = {
        backgroundColor: backgroundColor,
        color: textColor,
    }
    let style = {
        body: defaultStyle,
        heading1: defaultStyle,
        heading2: defaultStyle,
        heading3: defaultStyle,
        heading4: defaultStyle,
        heading5: defaultStyle,
        heading6: defaultStyle,
        hr: defaultStyle,
        strong: defaultStyle,
        em: defaultStyle,
        s: defaultStyle,
        bullet_list: defaultStyle,
        ordered_list: defaultStyle,
        list_item: defaultStyle,
        table: defaultStyle,
        thead: defaultStyle,
        tbody: defaultStyle,
        th: defaultStyle,
        tr: defaultStyle,
        td: defaultStyle,
        link: defaultStyle,
        blocklink: defaultStyle,
        image: defaultStyle,
        text: defaultStyle,
        textgroup: defaultStyle,
        paragraph: defaultStyle,
        hardbreak: defaultStyle,
        softbreak: defaultStyle,
        pre: defaultStyle,
        inline: defaultStyle,
        span: defaultStyle,
        blockquote: defaultStyle,
        fence: {
            backgroundColor: backgroundColor,
            color: codeColor,
            padding: 3,
            borderWidth: 1,
            borderRadius: 2,
            fontFamily: 'monospace',
        },
        code_block: {
            backgroundColor: backgroundColor,
            color: codeColor,
            padding: 3,
            borderWidth: 1,
            borderRadius: 2,
            fontFamily: 'monospace',
        },
        code_inline: {
            backgroundColor: backgroundColor,
            color: codeColor,
            padding: 1,
            paddingLeft: 3,
            paddingRight: 3,
            borderWidth: 1,
            borderRadius: 2,
            fontFamily: 'monospace',
        }
    }
    return (
        <ThemedView>
            <ThemedText>
                <Markdown{...props} mergeStyle={true} style={style}>
                    {props.children}
                </Markdown>
            </ThemedText>
        </ThemedView>
    )
}
