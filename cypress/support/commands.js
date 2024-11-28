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

        // Randomly select N manipulations
        const randomChanges = Cypress._.sampleSize(manipulations, numberOfAttributesToApply);
        const combinedStyles = randomChanges.map(change => `${change.type}: ${change.value};\n`).join(' ');

        cy.log(`Random styles: ${combinedStyles}`);

        // Apply styles and verify
        cy.get(selector)
            .invoke('attr', 'style', combinedStyles)
            .then(() => {
                cy.get(selector).invoke('attr', 'style').then((style) => {
                    combinedStyles.split(';').filter(Boolean).forEach(styleRule => {
                        expect(style).to.include(styleRule.trim());
                    });
                });
            });

        // Save the applied styles
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
 * Analyzes the API response file for validation and logs results.
 * Validates whether the response indicates visual and textual differences as expected.
 *
 * @param {string} apiOutputFilePath - Path to the API output file.
 */
Cypress.Commands.add('outputDataAnalyzing', (apiOutputFilePath) => {

    //Path validation
    //ensureDirectoryExists(apiOutputFilePath);

    cy.readFile(apiOutputFilePath, { timeout: 20000 }).then((content) => {
        cy.log('==== Latest API Response ====');
        cy.log(content);
        cy.log('=============================');

        // Validate response starts and ends as expected
        expect(content.trim()).to.match(/^Yes/);

        if (content.startsWith("Yes")) {
            cy.log("Test passed: Image has visual differences.");
        } else {
            cy.log("Test failed: No visual differences detected.");
        }
        if (content.endsWith("True")) {
            cy.log("Test passed: Image has the same text.");
        } else {
            cy.log("Test failed: Changes in text were detected.");
        }
    });

});