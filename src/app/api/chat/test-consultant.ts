// test-consultant.ts
import { GoogleGenAI } from '@google/genai';
import * as readline from 'readline';

// Initialize the Google SDK matching our local setup
const ai = new GoogleGenAI({});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function startSession() {
    console.log('\n==================================================');
    console.log('🧑‍⚕️ DIETARY CONSULTANT - TERMINAL SANITY BOX');
    console.log('Type your question below (or type "exit" to quit)');
    console.log('==================================================\n');

    const promptQuestion = () => {
        rl.question('Patron 📱> ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log('\nShutting down sandbox engine. Goodbye!\n');
                rl.close();
                return;
            }

            if (!input.trim()) {
                promptQuestion();
                return;
            }

            process.stdout.write('Expert 🧠> Thinking...');

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: input,
                    config: {
                        systemInstruction: "You are a professional nutritional expert. Give brief, punchy advice to the restaurant patron."
                    }
                });

                // Clear the "Thinking..." text and print the real answer
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                console.log(`Expert 🧠> ${response.text}\n`);
            } catch (error) {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Expert 🧠> [CRITICAL ERROR] ${errMsg}\n`);
            }

            promptQuestion();
        });
    };

    promptQuestion();
}

startSession();
