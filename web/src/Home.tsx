import React from 'react';

export interface HomeProps {}
export interface HomeState {}

export default class Home extends React.Component<HomeProps, HomeState> {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                <h1>Home</h1>
            </div>
        );
    }
}
