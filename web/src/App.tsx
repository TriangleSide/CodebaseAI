import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Amalgam from "./Amalgam";
import Home from "./Home";
import Chat from "./Chat";
import './App.css';

function App() {
    return (
        <Router>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/">CodebaseAI</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href="/amalgam">Amalgam</Nav.Link>
                            <Nav.Link href="/chat">Chat</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/amalgam" element={<Amalgam />} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;
