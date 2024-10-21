import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from "react-dom/client";
import { Navbar, Nav, Container } from 'react-bootstrap';
import store from "./state/Store";
import {Provider} from "react-redux";
import './page.css';

interface Props {
    children: React.ReactNode;
}

interface State {}

class Page extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Provider store={store}>
                <Navbar bg="dark" variant="dark" expand="lg">
                    <Container>
                        <Navbar.Brand href="/">CodebaseAI</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/">Home</Nav.Link>
                                <Nav.Link href="/projects">Projects</Nav.Link>
                                <Nav.Link href="/amalgam">Amalgam</Nav.Link>
                                <Nav.Link href="/chat">Chat</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Container>
                    {this.props.children}
                </Container>
            </Provider>
        );
    }
}

export function renderPage(children: React.ReactNode) {
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
        <Page>
            {children}
        </Page>
    );
}
