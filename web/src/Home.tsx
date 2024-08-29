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
                <br/>
                <p>
                    CodebaseAI is designed to help you perform AI inference on your entire GoLang codebase.
                    It leverages OpenAI's GPT models to provide insights and recommendations based on the content of
                    your codebase.
                </p>
                <p>
                    Select an item from the menu to get started.
                </p>
            </div>
        );
    }
}
