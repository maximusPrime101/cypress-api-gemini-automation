/// <reference types="cypress" />
/*
A Cypress-based automation framework integrating with the Gemini API to detect and analyze 
text and visual differences between screenshots after applying text manipulations such
as color, font, resolution, and spacing changes.

*/

describe('My Test Suite', () => {
    it('takes a screenshot', () => {
        cy.screenshot('myImage');
    });
});

describe('Gemini Compare test', () => {

    beforeEach(() => {
        // cy.visit('https://shironet.mako.co.il/artist?type=lyrics&lang=1&prfid=166&wrkid=400');
        cy.visit("https://www.google.com");
    });

    it.only('API Check B&W (Monochrome) images', () => {

        // Clicks on Accessibility button 
        //cy.get('#INDbtnWrap > button').click({ force: true });


        // Select monochrome
        //cy.get('#INDmonochromeBtn').click({ force: true }).should('have.attr', 'aria-checked', 'true', { timeout: 10000 });

        // cy.get('#INDcloseAccMenu').click({ force: true });

        // Screenshot and read the image as base64
        const prompt = "Is the image is google search site? Start your answer with 'Yes' or 'No', followed by a brief explanation.";

        cy.screenshot('myImage1', { overwrite: true }).then(() => {
            cy.readFile('cypress/screenshots/Gemini_Compare.spec.cy.js/myImage1.png', 'base64').then((imageData) => {
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


});