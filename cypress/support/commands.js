// cypress/support/commands.js





const ensureDirectoryExists = (path) => {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    } catch (error) {
        throw new Error(`Directory validation failed for path: ${path}. Error: ${error.message}`);
    }
};





/**
 * Hides specified elements by setting their CSS visibility to hidden.
 * This ensures these elements do not interfere with screenshots or test execution.
 *
 * @param {Array<string>} selectors - Array of CSS selectors for elements to hide.
 */
Cypress.Commands.add('hideElements', (selectors) => {
    selectors.forEach(selector => {
        cy.get(selector)
            .invoke('attr', 'style', 'visibility: hidden !important;')
            .should('not.be.visible');
    });
});


/**
 * Applies a set of random CSS styles to a specified element.
 * The styles are selected from a predefined list in the 'Manipulations.json' file.
 * This is used to test the visual impact of dynamic style changes.
 *
 * @param {string} outputPath - Path to the file where applied styles are saved.
 * @param {string} selector - CSS selector of the element to which styles will be applied.
 * @param {number} numberOfAttributesToApply - Number of random styles to apply.
 */
Cypress.Commands.add('applyRandomStyles', (outputPath, selector, numberOfAttributesToApply) => {




    cy.fixture('Manipulations.json').then((data) => {
        const manipulations = data.manipulations;

        cy.get('[id = "songContentTPL"]', { timeout: 60000 }).should('be.visible')
            .invoke('attr', 'style', 'zoom:2;')

        // Randomly select N manipulations
        const randomChanges = Cypress._.sampleSize(manipulations, numberOfAttributesToApply);
        const combinedStyles = randomChanges.map(change => `${change.type}: ${change.value};\n`).join(' ');

        cy.log(`Random styles: ${combinedStyles}`);

        // Apply styles and verify
        cy.get(selector, { timeout: 60000 }).should('be.visible')
            .invoke('attr', 'style', combinedStyles)
            .then(() => {
                cy.get(selector).invoke('attr', 'style').then((style) => {
                    combinedStyles.split(';').filter(Boolean).forEach(styleRule => {
                        expect(style).to.include(styleRule.trim());
                    });
                });
            });

        // Save to file the applied styles
        cy.writeFile(outputPath, combinedStyles);
    });
});


/**
 * Compares two screenshots by sending their base64 data along with a prompt
 * to an AI model for visual analysis.
 *
 * @param {string} baseImageName - Name of the baseline screenshot file (without extension).
 * @param {string} manipulatedImageName - Name of the manipulated screenshot file (without extension).
 * @param {string} promptPath - Path to the file containing the analysis prompt.
 */
Cypress.Commands.add('compareScreenshots', (baseImageName, manipulatedImageName, promptPath) => {

    const ScreenshotDirPath = 'cypress/screenshots';

    //ensureDirectoryExists(ScreenshotDirPath);

    cy.readFile(`${ScreenshotDirPath}/${baseImageName}.png`, 'base64', { timeout: 20000 }).then((baseImageData) => {
        cy.readFile(`${ScreenshotDirPath}/${manipulatedImageName}.png`, 'base64', { timeout: 20000 }).then((manipulatedImageData) => {
            cy.readFile(promptPath, { timeout: 20000 }).then((prompt) => {
                cy.task('generateContent', {
                    prompt,
                    baseImage: { data: baseImageData, mimeType: "image/png" },
                    manipulatedImage: { data: manipulatedImageData, mimeType: "image/png" },
                });
            });
        });
    });
});


/**
 * Custom Cypress command to analyze the output of a Gemini visual test and validate
 * the differences between a BaseImage and a ManipulatedImage. It reads the API response
 * from a file and performs several validations to ensure the visual differences match
 * the expected count and that the text is intact.
 *
 * @param {string} apiOutputFilePath - The file path of the API response output that contains the visual test results.
 * @param {number} numberOfAttributesToApply - The expected number of manipulations (CSS changes) applied to the image.
 */
Cypress.Commands.add('outputDataAnalyzing', (apiOutputFilePath, numberOfAttributesToApply) => {

    //Path validation
    //ensureDirectoryExists(apiOutputFilePath);

    cy.readFile(apiOutputFilePath, { timeout: 20000 }).then((content) => {
        cy.log('==== Latest API Response ====');
        cy.log(content);
        cy.log('=============================');

        // Extract the total differences directly
        const totalDifferences = parseInt(
            content.split('Total differences identified:')[1].trim().split(' ')[0],
            10
        );

        //Error if totalDifferences contains unexpected text
        if (isNaN(totalDifferences)) {
            throw new Error('Unable to parse the total differences. Ensure the response contains a valid number.');
        }
        cy.log(`Total differences identified: ${totalDifferences}`);

        // Validate against the expected manipulations count
        if (totalDifferences !== numberOfAttributesToApply) {
            throw new Error(
                `Mismatch in visual differences count. Expected: ${numberOfAttributesToApply}, Found: ${totalDifferences}`
            );
        } else {
            cy.log(
                `Test passed: Visual differences match the expected manipulations count (${numberOfAttributesToApply}).`
            );
        }

        // Validate response starts as expected
        try {
            expect(content.trim()).to.match(/^Yes/, 'Response should start with "Yes"');
        } catch (error) {
            throw new Error(`No changes were found in images. Ensure that the images are different.\n${error.message}`);
        }



        //Searching for missing text
        if (content.endsWith("True")) {
            cy.log("Test passed: Image has the same text.");
        } else {
            cy.log("Test failed: Changes in text were detected.");
            const missingText = content.match(/Text is missing! - (.*)/);
            if (missingText) {
                cy.log(`Missing text: ${missingText[1]}`);
            }
        }

    });

});