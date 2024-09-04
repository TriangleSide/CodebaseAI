import React from 'react';
import Amalgam from './Amalgam';
import Projects from '../projects/Projects';

interface AmalgamContainerProps {}
interface AmalgamContainerState {}

export default class AmalgamContainer extends React.Component<AmalgamContainerProps, AmalgamContainerState> {
    constructor(props: AmalgamContainerProps) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Projects>
                <Amalgam />
            </Projects>
        );
    }
}
