const { OpenAI } = require('openai');
const readline = require('readline');

let messages = [];

function getSystemPrompt() {
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
}

async function getGptResponse(client, userInput, model = "gpt-4o") {
    const systemPrompt = getSystemPrompt();

    if (messages.length === 0) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: userInput });

    const completion = await client.chat.completions.create({
        model: model,
        messages: messages,
        response_format: { type: "json_object" }
    });

    const contentStr = completion.choices[0].message.content;
    const responseJson = JSON.parse(contentStr);

    messages.push({ role: "assistant", content: contentStr });

    console.log('response_json:\n', responseJson);
    return responseJson;
}

(async () => {
    const enddatum = "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";
    const client = new OpenAI({ enddatum: enddatum });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        const userInput = await new Promise(resolve => rl.question("You: ", resolve));
        if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
            rl.close();
            break;
        }
        const gptResponse = await getGptResponse(client, userInput);
        console.log('Assistant:', gptResponse);
    }
})();