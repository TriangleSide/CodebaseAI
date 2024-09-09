import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import AmalgamWrapper from "./amalgam/AmalgamWrapper";
import ChatWrapper from "./chat/ChatWrapper";
import Projects from "./projects/Projects";
import Home from "./Home";
import './App.css';

interface Props {}
interface State {}

export default class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Router>
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
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/amalgam" element={<AmalgamWrapper />} />
                        <Route path="/chat" element={<ChatWrapper />} />
                        <Route path="/projects" element={<Projects />} />
                    </Routes>
                </Container>
            </Router>
        );
    }
}
