import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
    onAddProject: (path: string) => void;
}

interface State {
    projectPath: string;
}

export default class AddProjectModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { projectPath: '' };
    }

    handleSubmit = () => {
        this.props.onAddProject(this.state.projectPath);
        this.props.onHide();
    };

    handleProjectPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ projectPath: event.target.value });
    };

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                className="bg-dark text-white"
            >
                <Modal.Header closeButton className="bg-dark">
                    <Modal.Title>Add New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">
                    <Form>
                        <Form.Group className="mb-3" controlId="formProjectPath">
                            <Form.Label>Project Path</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter project path"
                                value={this.state.projectPath}
                                onChange={this.handleProjectPathChange}
                                className="bg-dark text-white"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-dark">
                    <Button variant="secondary" onClick={this.props.onHide}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.handleSubmit}>
                        Add Project
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
