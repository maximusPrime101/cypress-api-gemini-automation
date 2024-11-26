// cypress.config.js

const { defineConfig } = require("cypress");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require('dotenv').config({ path: 'D:/Git/.env' }); // PC
//require('dotenv').config({ path: 'D:/Git/.env' }); // Laptop

// Validate API key
if (!process.env.API_KEY) {
    throw new Error("Missing API Key. Please check your .env file or ENV_PATH.");
}
module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            on('task', {
                generateContent({ baseImage, manipulatedImage, prompt }) {
                    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                    const images = [
                        {
                            inlineData: {
                                data: baseImage.data,
                                mimeType: baseImage.mimeType
                            }
                        },
                        {
                            inlineData: {
                                data: manipulatedImage.data,
                                mimeType: manipulatedImage.mimeType
                            }
                        }
                    ];

                    return model.generateContent([images, prompt])
                        .then((result) => {
                            const text = result.response.text();
                            const dirPath = 'cypress/outputs';

                            if (!fs.existsSync(dirPath)) {
                                fs.mkdirSync(dirPath);
                            }

                            fs.writeFileSync(`${dirPath}/GeminiOutput.txt`, text, { flag: 'w' });
                            return text; // Return the result to Cypress for further use
                        })
                        .catch((error) => {
                            console.error("Error generating content:", error);
                            throw error;
                        });
                }//retry with timeout
            });
        },
        supportFile: false
    },
});


/* backup
module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            on('task', {
                compareImages({ baseImage, manipulatedImage, prompt }) {
                    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                    const images = [
                        { data: baseImage.data, mimeType: baseImage.mimeType, label: 'Base Image' },
                        { data: manipulatedImage.data, mimeType: manipulatedImage.mimeType, label: 'Manipulated Image' }
                    ];

                    return model.compareImages(images, { prompt })
                        .then((result) => {
                            const text = result.response.text();
                            const dirPath = 'cypress/outputs';

                            if (!fs.existsSync(dirPath)) {
                                fs.mkdirSync(dirPath);
                            }

                            fs.writeFileSync(`${dirPath}/GeminiOutput.txt`, text, { flag: 'w' });
                            return text; // Return the result to Cypress for further use
                        })
                        .catch((error) => {
                            console.error("Error comparing images:", error);
                            throw error;
                        });
                }
            });
        },
        supportFile: false
    },
});
*/