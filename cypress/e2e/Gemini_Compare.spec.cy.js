/// <reference types="cypress" />
/*
A Cypress-based automation framework integrating with the Gemini API to detect and analyze 
text and visual differences between screenshots after applying text manipulations such
as color, font, resolution, and spacing changes.

*/


//const fs = require("fs");

//Version 1

describe.skip('Gemini Compare test', () => {

    before(() => {

        cy.visit("https://www.tab4u.com/lyrics/songs/745_%D7%90%D7%A8%D7%99%D7%A7_%D7%90%D7%99%D7%99%D7%A0%D7%A9%D7%98%D7%99%D7%99%D7%9F_-_%D7%99%D7%A9_%D7%91%D7%99_%D7%90%D7%94%D7%91%D7%94.html", { timeout: 20000 });

        //Capture  image for compare
        cy.screenshot('BaseImage', { overwrite: true }, { timeout: 10000 });
    });

    it('Hide floating menu and player', () => {

        cy.get('#topMenuInSong', { timeout: 10000 }).invoke('attr', 'style', 'visibility: hidden !important;').should('not.be.visible');

        cy.get('#scSpeed_div', { timeout: 10000 }).invoke('attr', 'style', 'visibility: hidden !important;').should('not.be.visible');
    });


    it('Applying random attributes', () => {

        // Load manipulations from the fixtures
        cy.fixture('Manipulations.json').then((data) => {
            const manipulations = data.manipulations;

            // Randomly select 4 manipulations (uses Lodash library)
            const randomChanges = Cypress._.sampleSize(manipulations, 4);

            cy.log(randomChanges);
            // Apply each manipulation to the target element and log
            const combinedStyles = randomChanges.map(change => `${change.type}: ${change.value};`).join(' ');

            //Adds attributes and validates them
            cy.get('[id="songContentTPL"]', { timeout: 20000 })
                .invoke('attr', 'style', combinedStyles)
                .then(() => {
                    cy.get('[id="songContentTPL"]', { timeout: 20000 })
                        .invoke('attr', 'style')
                        .then((style) => {
                            const stylesToCheck = combinedStyles.split(';').filter(Boolean);
                            stylesToCheck.forEach((styleRule) => {
                                expect(style).to.include(styleRule.trim()); // Verify each style
                            });
                        });
                });
            //cy.get('#songContentTPL').invoke('attr', 'style', combinedStyles);
            cy.log(`Applied styles: ${combinedStyles}`);

            cy.writeFile('cypress/outputs/ManipulationsThatWereUsed.txt', combinedStyles, { flag: 'w' });
        });

    });


    it('Making second screenshot and Comparing it to first', () => {


        const prompt = "Analyze these two images. The first image is the original version of a webpage. The second image represents the webpage after new style attributes have been added. Identify the specific visual differences, particularly in terms of text style and formatting. Pay attention to font, size, color, and any other relevant text attributes. Provide a detailed comparison of the two screenshots. Start your answer with Yes if you have found any difference and then specify quantity and what changes were made. write in this format example: 'color: red; '. in the last paragraph of your answer write wether if lyrics text is the same or missing.  ";


        //compare
        cy.screenshot('ManipulatedImage', { overwrite: true }).then(() => {
            cy.readFile('cypress/screenshots/ManipulatedImage.png', 'base64').then((manipulatedImageData) => {

                cy.readFile('cypress/screenshots/baseImage.png', 'base64').then((baseImageData) => {

                    // Call the Cypress task
                    cy.task('generateContent', {
                        prompt,
                        baseImage: {
                            data: baseImageData,
                            mimeType: "image/png"
                        },
                        manipulatedImage: {
                            data: manipulatedImageData,
                            mimeType: "image/png"
                        }
                    })
                });
            });
        });
    });

    it('Analyze response and display conclusions', () => {

        // Read and log the latest content in a Cypress-friendly format
        cy.readFile('cypress/outputs/GeminiOutput.txt').then((content) => {
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


//version 2



describe('Gemini Compare Test 2', () => {

    // Base URL for the website
    const webSiteUrl = "https://www.tab4u.com/lyrics/songs/745_%D7%90%D7%A8%D7%99%D7%A7_%D7%90%D7%99%D7%99%D7%A0%D7%A9%D7%98%D7%99%D7%99%D7%9F_-_%D7%99%D7%A9_%D7%91%D7%99_%D7%90%D7%94%D7%91%D7%94.html";

    // Ensure we're on the correct webpage before each test
    beforeEach(() => {
        cy.visit(webSiteUrl, { timeout: 20000 });

        const elementsToHide = ['#topMenuInSong', '#scSpeed_div'];

        elementsToHide.forEach(selector => {
            cy.get(selector)
                .invoke('attr', 'style', 'visibility: hidden !important;')
                .should('not.be.visible');
        });
    });

    describe('Prepare and capture screenshots for comparison', () => {



        // const elementsToHide = ['#topMenuInSong', '#scSpeed_div'];

        // elementsToHide.forEach(selector => {
        //     cy.get(selector)
        //         .invoke('attr', 'style', 'visibility: hidden !important;')
        //         .should('not.be.visible');
        // });





        it('Apply random styles to lyrics', () => {

            cy.fixture('Manipulations.json').then((data) => {

                cy.screenshot('BaseImage', { overwrite: true });
                const manipulations = data.manipulations;

                // Randomly select 4 manipulations
                const randomChanges = Cypress._.sampleSize(manipulations, 4);
                const combinedStyles = randomChanges.map(change => `${change.type}: ${change.value};`).join(' ');

                cy.log(`Random styles: ${combinedStyles}`);

                cy.get('[id="songContentTPL"]')
                    .invoke('attr', 'style', combinedStyles)
                    .then(() => {
                        // Verify each style is applied
                        cy.get('[id="songContentTPL"]').invoke('attr', 'style').then((style) => {
                            combinedStyles.split(';').filter(Boolean).forEach(styleRule => {
                                expect(style).to.include(styleRule.trim());
                            });
                        });
                    });

                // Save the applied styles
                cy.writeFile('cypress/outputs/ManipulationsThatWereUsed.txt', combinedStyles);
            });
        });
    });

    describe('Comparison Tests', () => {
        it('Capture manipulated screenshot and compare', () => {

            const prompt = "Analyze these two images. The first image is the original version of a webpage. The second image represents the webpage after new style attributes have been added. Identify the specific visual differences, particularly in terms of text style and formatting. Pay attention to font, size, color, and any other relevant text attributes. Provide a detailed comparison of the two screenshots. Start your answer with Yes if you have found any difference and then specify quantity and what changes were made. write in this format example: 'color: red; '. in the last paragraph of your answer write whether if lyrics text is the same or missing.";

            // Take second screenshot
            cy.screenshot('ManipulatedImage', { overwrite: true }).then(() => {
                cy.readFile('cypress/screenshots/ManipulatedImage.png', 'base64').then((manipulatedImageData) => {
                    cy.readFile('cypress/screenshots/BaseImage.png', 'base64').then((baseImageData) => {
                        cy.task('generateContent', {
                            prompt,
                            baseImage: { data: baseImageData, mimeType: "image/png" },
                            manipulatedImage: { data: manipulatedImageData, mimeType: "image/png" },
                        });
                    });
                });
            });
        });

        it('Analyze response and validate differences', () => {
            cy.readFile('cypress/outputs/GeminiOutput.txt').then((content) => {
                cy.log('==== Latest API Response ====');
                cy.log(content);
                cy.log('=============================');

                expect(content.trim()).to.match(/^Yes/);

                // Additional validation
                if (content.startsWith("Yes")) {
                    cy.log("Test passed: Image has visual differences.");
                } else {
                    cy.log("Test failed: No visual differences detected.");
                }
            });
        });
    });
});















/* automated it() generator



describe.skip('Screenshot Manipulations', () => {
    manipulations.forEach((manipulation, index) => {
        it(`Test #${index + 1
        }: Validate ${manipulation.type
        } change`, () => {
            // Perform the manipulation
            cy.task('applyManipulation', manipulation);

            // Take screenshot
            cy.screenshot(manipulation.type);

            // Validate using Gemini
            cy.task('validateWithGemini',
            {
                screenshot: `cypress/screenshots/${manipulation.type
                }.png`,
                expected: manipulation.expected,
            }).then((result) => {
                expect(result.passed).to.be.true;
                cy.log(`${manipulation.type
                } change validated successfully`);
            });
        });
    });
});

describe.skip('My Test Suite', () => {


    it('takes a screenshot', () => {
        //cy.screenshot('beforeImage');
        // Ensure the directory exists
        //    const dirPath = 'cypress/fixtures/Manipulations.json';
        const dirPath = 'cypress/fixtures';
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        // Writes to the file
        fs.writeFileSync(`${dirPath
        }/Manipulations.json`, text,
        { flag: 'w'
        });
    });
});

*/

