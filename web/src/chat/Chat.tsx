import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import ChatAPIClient, { Message } from "./ChatAPIClient";
import ChatCard from "./ChatCard";
import {AmalgamSummary} from "../amalgam/AmalgamSummary";
import AmalgamAPIClient, {AmalgamResponse} from "../amalgam/AmalgamAPIClient";
import {Roles} from "./Roles";
import {Project} from "../projects/ProjectAPIClient";
import {RootState} from "../state/Reducer";
import {connect, ConnectedProps} from "react-redux";
import {ProjectSummary} from "../projects/ProjectSummary";

interface ReduxProps {
    selectedProject: Project | null;
}

const reduxMapStateToProps = (state: RootState): Partial<ReduxProps> => ({
    selectedProject: state.project.selectedProject
});

const reduxConnector = connect(reduxMapStateToProps);

interface Props extends ConnectedProps<typeof reduxConnector> {}

interface State {
    amalgamError: string | null;
    amalgamLoading: boolean;
    amalgamData: AmalgamResponse | null;
    messages: Message[];
    input: string;
    loading: boolean;
}

class Chat extends React.Component<Props, State> {
    chatContainerRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.state = this.emptyState();
        this.chatContainerRef = React.createRef();
    }

    emptyState(): State {
        return {
            amalgamError: null,
            amalgamLoading: true,
            amalgamData: null,
            messages: [],
            input: '',
            loading: false,
        }
    }

    componentDidMount() {
        this.fetchAmalgamData();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.selectedProject?.id !== prevProps.selectedProject?.id) {
            this.setState(this.emptyState());
            this.fetchAmalgamData();
        }
        if (this.chatContainerRef.current) {
            this.chatContainerRef.current.scrollTop = this.chatContainerRef.current.scrollHeight;
        }
    }

    fetchAmalgamData = async () => {
        this.setState({
            amalgamError: null,
            amalgamData: null,
            amalgamLoading: true,
        });
        try {
            if (!this.props.selectedProject) {
                throw new Error('Project not found');
            }
            const data = await AmalgamAPIClient.fetchAmalgam(this.props.selectedProject.id);
            this.setState({
                amalgamError: null,
                amalgamData: data,
                amalgamLoading: false,
            });
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            this.setState({
                amalgamError: 'Error fetching amalgam data',
                amalgamData: null,
                amalgamLoading: false,
            });
        }
    };

    handleSendMessage = async () => {
        if (this.state.input.trim() === '') return;

        let messages: Message[] = this.state.messages
        messages = [...messages, { role: Roles.USER, content: this.state.input.trim() }]
        messages = [...messages, { role: Roles.ASSISTANT, content: "" }]

        this.setState({
            messages: messages,
            input: '',
            loading: true,
        });

        const tokenCallback = (token: string) => {
            this.setState((prevState: State) => {
                const updatedMessages: Message[] = [...prevState.messages];
                const lastMessage: Message = updatedMessages[updatedMessages.length - 1];

                if (lastMessage.role === Roles.ASSISTANT) {
                    lastMessage.content += token;
                } else {
                    updatedMessages.push({role: Roles.ASSISTANT, content: token,});
                }

                return {
                    messages: updatedMessages,
                };
            });
        };

        try {
            const apiRequestMessages: Message[] = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            } as Message));

            apiRequestMessages[0].content = this.state.amalgamData?.content + "// User request below.\n\n" + apiRequestMessages[0].content;

            await ChatAPIClient.sendMessage(apiRequestMessages, tokenCallback);
            this.setState({ loading: false });
        } catch (error) {
            this.setState((prevState) => ({
                loading: false,
                messages: [...prevState.messages, { role: Roles.ASSISTANT, content: 'Error: ' + error }],
            }));
        }
    };

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ input: event.target.value });
    };

    handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            this.handleSendMessage();
        }
    };

    render() {
        const { messages, input, loading, amalgamError, amalgamLoading, amalgamData } = this.state;

        if (amalgamError) {
            return (
                <Container>
                    Error fetching amalgam data: {amalgamError}
                </Container>
            )
        }

        let amalgamMsg: string;
        if (amalgamLoading) {
            amalgamMsg = "Loading codebase amalgam..."
        } else if (amalgamData != null) {
            amalgamMsg = AmalgamSummary(amalgamData)
        } else {
            amalgamMsg = "Error loading codebase amalgam."
        }
        amalgamMsg = ProjectSummary(this.props.selectedProject) + "\n\n" + amalgamMsg

        return (
            <Container>
                <br/>
                <h2>Codebase AI Chat</h2>
                <p>This app adds the codebase amalgam to the beginning of the chat.</p>
                <br/>
                <div ref={this.chatContainerRef} className="chat-container">
                    <ChatCard key={"amalgam"} role={Roles.CODEBASE} content={amalgamMsg}/>
                    {messages.map((msg, index) => (
                        <ChatCard key={index} role={msg.role} content={msg.content}/>
                    ))}
                </div>
                <Form.Group className="mb-3">
                    <Form.Control
                        as="textarea"
                        className="chat-text-input text-white bg-dark"
                        placeholder="Chat with AI about your codebase..."
                        value={input}
                        onChange={this.handleInputChange}
                        onKeyUp={this.handleKeyPress}
                    />
                </Form.Group>
                <Button onClick={this.handleSendMessage} variant="primary" disabled={loading || amalgamLoading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
                <br/><br/>
            </Container>
        );
    }
}

export default reduxConnector(Chat);
