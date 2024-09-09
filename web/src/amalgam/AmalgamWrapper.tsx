import React from 'react';
import Amalgam from './Amalgam';
import SelectedProject from "../projects/SelectedProject";

interface Props {}
interface State {}

export default class AmalgamWrapper extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <SelectedProject>
                <Amalgam />
            </SelectedProject>
        );
    }
}
