import React, { useEffect } from 'react';
import { OpenAI } from 'openai';

const apiKey = "";

const OpenAITest: React.FC = () => {
    useEffect(() => {
        try {
            const client = new OpenAI({ apiKey: apiKey });
            console.log('OpenAI client initialized successfully');
        } catch (error) {
            console.error('Error initializing OpenAI client:', error);
        }
    }, []);

    return (
        <div>
            <h1>OpenAI Test Component</h1>
        </div>
    );
};

export default OpenAITest;