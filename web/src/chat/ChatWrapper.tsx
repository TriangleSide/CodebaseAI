import React from 'react';
import Chat from "./Chat";
import SelectedProject from "../projects/SelectedProject";

interface Props {}
interface State {}

export default class ChatWrapper extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <SelectedProject>
                <Chat />
            </SelectedProject>
        );
    }
}
