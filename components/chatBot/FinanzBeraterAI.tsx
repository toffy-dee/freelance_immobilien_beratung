import React, { useState } from 'react';
import { OpenAI } from 'openai';
import { Message, ChatCompletionResponse } from './types';

const apiKey = "";
const client = new OpenAI({ apiKey: apiKey });

const getSystemPrompt = (): string => {
    return `
        #Task 
        Du bist ein Finanzberater, der einem Kunden hilft, eine Immobilie zu kaufen. Der Kunde hat bereits eine Immobilie gefunden, die er kaufen möchte, und hat dich gebeten, ihm zu beraten, wie die Immobilie zu finanzieren ist. Das Ausgabeformat ist weiter unter definiert. Wenn du nicht alle Informationen hast, musst fragen stellen, bis alles klar ist.

        #User Input in free format
        Enthält user informationen, die der Finanzberater benötigt, um die Immobilie zu finanzieren.

        #Output in json format
        {
            "furtherQuestions": "only if you have more questions",
            "outputData": { // only if you have enough data to generate
                "kunde": {
                    "objektnutzung": "enum of [Eigennutzung und Vermietung, Volle Eigennutzung, Volle Vermietung] must be one of those",
                    "objektArt": "enum of [  
                        "ETW", "Einfamilienhaus", "Zweifamilienhaus", "Mehrfamilienhaus", "Wohn- und Geschäftshaus", "Gewerbeobjekt", "Volle Eigennutzung", "Eigennutzung und Vermietung", "Volle Vermietung"
                    ] must be one those",
                    "darlehensnehmer": "name of the customer",
                }
            }
        }

    #Example conversation:

    User: Hallo, ich möchte eine Immobilie kaufen. Könnten Sie mir bitte helfen?

    Assistant: 
    {
        "furtherQuestions": "Hallo, bitte gib mir mehr informationen. Wie ist der Name? Wie ist die Objektnutzung? Wollen Sie ein Einfamilienhaus, Wohn- und Geschäftshaus etc.?",
        "outputData": {}
    }
    
    User: Mein Name ist Larry Fink. Ich will ein bescheidenes business aufbauen und brauche ein gebäude dafür.

    Assistant:
    {
        "outputData": {
            "kunde": {
                "objektnutzung": "Volle Eigennutzung",
                "objektArt": "Gewerbeobjekt",
                "darlehensnehmer": "Larry Fink",
            }
        }
    }
    `;
};

const FinanzBeraterAI: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([{ role: 'system', content: getSystemPrompt() }]);
    const [chatConversation, setChatConversation] = useState<Message[]>([
        { role: 'user', content: 'Hallo, ich möchte eine Immobilie kaufen. Könnten Sie mir bitte helfen?' },
        { role: 'assistant', content: 'Hallo, bitte gib mir mehr informationen. Wie ist der Name? Wie ist die Objektnutzung? Wollen Sie ein Einfamilienhaus, Wohn- und Geschäftshaus etc.?' },
        { role: 'user', content: 'Mein Name ist Larry Fink. Ich will ein bescheidenes business aufbauen und brauche ein gebäude dafür.' },
        { role: 'assistant', content: JSON.stringify({
            "outputData": {
                "kunde": {
                    "objektnutzung": "Volle Eigennutzung",
                    "objektArt": "Gewerbeobjekt",
                    "darlehensnehmer": "Larry Fink",
                }
            }
        }, null, 2) }
    ]);
    const [error, setError] = useState<string | null>(null);

    const handleSendMessage = async () => {
        const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setChatConversation([...chatConversation, { role: 'user', content: userInput }]);
        setUserInput('');

        try {
            const completion: ChatCompletionResponse = await client.chat.completions.create({
                model: "gpt-4o",
                messages: newMessages,
                response_format: { type: "json_object" }
            });

            const contentStr: string | null = completion.choices[0].message.content;
            const responseJson = contentStr ? JSON.parse(contentStr) : {};

            setMessages([...newMessages, { role: 'assistant', content: contentStr || '' }]);
            setChatConversation([...chatConversation, { role: 'assistant', content: JSON.stringify(responseJson, null, 2) }]);
        } catch (err) {
            setError('Failed to fetch response from GPT API');
            console.error(err);
        }
    };

    return (
        <div className="chat-container" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <div className="chat-messages" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
                {chatConversation.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                        {msg.content}
                    </div>
                ))}
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div className="chat-input" style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1, marginRight: '10px' }}
                />
                <button onClick={handleSendMessage} style={{ padding: '5px 10px' }}>Send</button>
            </div>
        </div>
    );
};

export default FinanzBeraterAI;