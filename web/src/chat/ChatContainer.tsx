import React from 'react';
import Chat from './Chat';
import Projects from '../projects/Projects';

interface ChatContainerProps {}
interface ChatContainerState {}

export default class ChatContainer extends React.Component<ChatContainerProps, ChatContainerState> {
    constructor(props: ChatContainerProps) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Projects>
                <Chat />
            </Projects>
        );
    }
}
