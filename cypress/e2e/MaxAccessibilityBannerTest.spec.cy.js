/// <reference types="cypress" />
/*

npm i dotenv
npm i @google/generative-ai
*/

describe('Accessibility test', () => {

    beforeEach(() => {
        cy.visit('https://idgu.co.il');
        cy.wait(2000);
    });

    it('API Check B&W (Monochrome) images', () => {

        // Clicks on Accessibility button 
        cy.get('#INDbtnWrap > button').click({ force: true });
        cy.wait(2000);

        // Select monochrome
        cy.get('#INDmonochromeBtn').click({ force: true }).should('have.attr', 'aria-checked', 'true', { timeout: 10000 });

        cy.get('#INDcloseAccMenu').click({ force: true });
        cy.wait(2000);
        // Screenshot and read the image as base64
        const prompt = "Is the image grayscale? Start your answer with 'Yes' or 'No', followed by a brief explanation.";
        cy.screenshot('myImageBw', { overwrite: true }).then(() => {
            cy.readFile('cypress/screenshots/myImageBw.png', 'base64').then((imageData) => {
                // Call the Cypress task
                cy.task('generateContent', {
                    prompt, imageData: {
                        inlineData: {
                            data: imageData,
                            mimeType: "image/png",
                        },
                    }
                })


            });
            // Read and log the latest content in a Cypress-friendly format
            cy.readFile('cypress/outputs/myOutput.txt').then((content) => {
                // Add a header in the Cypress log for emphasis
                cy.log('==== Latest API Response ====');
                cy.log(content); // Log the actual file content
                cy.log('=============================');
                // Check if the content starts with 'Yes' or 'No'
                expect(content.trim()).to.match(/^Yes/);

                //Checks based on expected answers
                if (content.startsWith("Yes")) {
                    cy.log("Test passed: Image is grayscale.");
                } else {
                    cy.log("Test failed: Image is not grayscale.");
                }
            });
        });

    });


    it('API Black contrast test', () => {

        //Clicks on Accessibility button 
        cy.get('#INDbtnWrap > button').click({ force: true });
        cy.wait(2000);

        //select Black contrast
        cy.get('#INDblackwhiteBtn').click({ force: true }).should('have.attr', 'aria-checked', 'true');
        cy.get('#INDcloseAccMenu').click({ force: true });

        // Screenshot and read the image as base64
        const prompt = "Is the background in the image of website in black contrast? Start your answer with 'Yes' or 'No', followed by a brief explanation.";

        cy.screenshot('myImageBlackContrast', { overwrite: true }).then(() => {
            cy.readFile('cypress/screenshots/myImageBlackContrast.png', 'base64').then((imageData) => {
                // Call the Cypress task
                cy.task('generateContent', {
                    prompt, imageData: {
                        inlineData: {
                            data: imageData,
                            mimeType: "image/png",
                        },
                    }
                })
            });
            // Read and log the latest content in a Cypress-friendly format
            cy.readFile('cypress/outputs/myOutput.txt').then((content) => {
                // Add a header in the Cypress log for emphasis
                cy.log('==== Latest API Response ====');
                cy.log(content); // Log the actual file content
                cy.log('=============================');
                // Check if the content starts with 'Yes' or 'No'
                expect(content.trim()).to.match(/^Yes/);

                //Checks based on expected answers
                if (content.startsWith("Yes")) {
                    cy.log("Test passed: Image is with Black Contrast.");
                } else {
                    cy.log("Test failed: Image is not with Black Contrast.");
                }
            });
        });
        //Clicks on Accessibility button 
        // cy.get('#INDbtnWrap > button').click({ force: true });
        // cy.wait(2000);

        // //select Black contrast
        // cy.get('#INDblackwhiteBtn').click({ force: true });
        // cy.get('#INDcloseAccMenu').click({ force: true });
    });


    it('API White contrast test', () => {

        //Clicks on Accessibility button 
        cy.get('#INDbtnWrap > button').click({ force: true });
        cy.wait(2000);

        //select White contrast
        cy.get('#INDwhiteblackBtn').click({ force: true }).should('have.attr', 'aria-checked', 'true');
        cy.get('#INDcloseAccMenu').click({ force: true });

        // Screenshot and read the image as base64
        const prompt = "Is the background in the image of website mostly in white contrast? Ignore the commercials and clickable content and light blue banner . Start your answer with 'Yes' or 'No', followed by a brief explanation.";
        cy.viewport(1920, 1080);
        cy.screenshot('myImageWhiteContrast', { overwrite: true }).then(() => {
            cy.readFile('cypress/screenshots/myImageWhiteContrast.png', 'base64').then((imageData) => {
                // Call the Cypress task
                cy.task('generateContent', {
                    prompt, imageData: {
                        inlineData: {
                            data: imageData,
                            mimeType: "image/png",
                        },
                    }
                })
            });
            // Read and log the latest content in a Cypress-friendly format
            cy.readFile('cypress/outputs/myOutput.txt').then((content) => {
                // Add a header in the Cypress log for emphasis
                cy.log('==== Latest API Response ====');
                cy.log(content); // Log the actual file content
                cy.log('=============================');
                // Check if the content starts with 'Yes' or 'No'
                expect(content.trim()).to.match(/^Yes/);

                // Checks based on expected answers
                if (content.startsWith("Yes")) {
                    cy.log("Test passed: Image is with White Contrast.");
                } else {
                    cy.log("Test failed: Image is not with White Contrast.");
                }
            });
        });
        //     //Clicks on Accessibility button 
        //     cy.get('#INDbtnWrap > button').click({ force: true });
        //     cy.wait(2000);

        //     //select Black contrast
        //     cy.get('#INDblackwhiteBtn').click({ force: true });
        //     cy.get('#INDcloseAccMenu').click({ force: true }); 
    });


    /* There is a bug in cypress that doesn't show the Cursor on screenshot.
    */
    it('Large black cursor test', () => {

        //Clicks on Accessibility button 
        cy.get('#INDbtnWrap > button').click({ force: true });
        cy.wait(1000);

        //select black cursor Btn
        cy.get('#INDblackcursorBtn').click({ force: true }).should('have.attr', 'aria-checked', 'true');
        cy.get('#INDcloseAccMenu').click({ force: true });

        /*
                // Screenshot and read the image as base64
                const prompt = "Is the cursor's color is black and enlarged in the website image? Start your answer with 'Yes' or 'No', followed by a brief explanation.";
        
                cy.viewport(1920, 1080);
                //cy.get('.owl-item:nth-child(5)').first().trigger('mouseover')
                cy.screenshot('myImageBlackCursor', { overwrite: true, capture: 'fullPage' }).then(() => {
        
                    cy.readFile('cypress/screenshots/myImageBlackCursor.png', 'base64')
                        .then((imageData) => {
                            // Call the Cypress task
                            cy.task('generateContent', {
                                prompt, imageData: {
                                    inlineData: {
                                        data: imageData,
                                        mimeType: "image/png",
                                    },
                                }
                            })
                        });
                    // Read and log the latest content in a Cypress-friendly format
                    cy.readFile('cypress/outputs/myOutput.txt').then((content) => {
                        // Add a header in the Cypress log for emphasis
                        cy.log('==== Latest API Response ====');
                        cy.log(content); // Log the actual file content
                        cy.log('=============================');
                        // Check if the content starts with 'Yes' or 'No'
                        expect(content.trim()).to.match(/^Yes/);
        
                        // Checks based on expected answers
                        if (content.startsWith("Yes")) {
                            cy.log("Test passed: Image is with Black Cursor.");
                        } else {
                            cy.log("Test failed: Image is not with Black Cursor.");
                        }
                    });
                });
                */
    });


    /* There is a bug in cypress that doesn't show the keyboard and can't find it
    */
    it('Virtual keyboard test', () => {

        //Clicks on Accessibility button 
        cy.get('#INDbtnWrap > button').click({ force: true });
        cy.wait(2000);

        //select Black contrast
        cy.get('#INDvirtualKeyboardBtn').click({ force: true }).should('have.attr', 'aria-checked', 'true');

        //cy.get('#INDcloseAccMenu').click({ force: true });
        /*
                //open virtual keyboard
                cy.get('#eq-virtualKeyboard-tab').click({ force: true }).should('have.attr', 'aria-selected', 'true');
                
                        //Type in search box
                        cy.get('.search input').click({ force: true }).then(() => {
                            cy.get('#INDvKeyboard-Layout').within(() => {
                                cy.select('#INDvKeyboard-Layout').select('מ');
                                cy.select('#INDvKeyboard-Layout').select('ק');
                                cy.select('#INDvKeyboard-Layout').select('ל');
                                cy.select('#INDvKeyboard-Layout').select('ד');
                                cy.select('#INDvKeyboard-Layout').select('ת');
                            })
                        });
                */
    });
});