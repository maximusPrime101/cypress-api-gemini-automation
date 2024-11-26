
// cypress.config.js


//config with gemini api
const { defineConfig } = require("cypress");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require('dotenv').config({ path: 'D:/Git/.env' }); //PC
//require('dotenv').config({ path: 'D:/Git/.env' }); //Laptop

//Validate API key
if (!process.env.API_KEY) {
    throw new Error("Missing API Key. Please check your .env file or ENV_PATH.");
}


module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // Define the generateContent task
            on('task', {
                generateContent({ prompt, imageData }) {
                    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                    return model.generateContent([prompt, imageData])
                        .then((result) => {
                            const text = result.response.text();

                            // Ensure the directory exists
                            const dirPath = 'cypress/outputs';
                            if (!fs.existsSync(dirPath)) {
                                fs.mkdirSync(dirPath);
                            }

                            // Write to the file
                            fs.writeFileSync(`${dirPath}/myOutput.txt`, text, { flag: 'w' });
                            return text;  // Return result to Cypress for further use if needed
                        })
                        .catch((error) => {
                            console.error("Error generating content:", error);
                            throw error;
                        });
                }
            });

        },
        supportFile: false
    },
});
