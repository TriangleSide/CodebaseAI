import React, { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { API_BASE_URL } from './Constants';

const Amalgam: React.FC = () => {
    const [amalgamData, setAmalgamData] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        const fetchAmalgamData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/amalgam`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.text();
                setAmalgamData(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAmalgamData();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(amalgamData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Container>
            <h1>Amalgam Data</h1>
            <Button onClick={handleCopy} variant={copied ? "success" : "primary"}>
                {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <div className="amalgam-container">
                {amalgamData}
            </div>
        </Container>
    );
};

export default Amalgam;
