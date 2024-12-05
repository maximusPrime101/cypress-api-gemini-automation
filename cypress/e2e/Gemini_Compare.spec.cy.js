/// <reference types="cypress" />

/*
A Cypress-based automation framework integrating with the Gemini API to detect and analyze 
text and visual differences between screenshots after applying text manipulations such
as color, font, resolution, and spacing changes.

*/



describe('Gemini Compare Test 3', () => {
    const webSiteUrl = "https://www.tab4u.com/lyrics/songs/745_%D7%90%D7%A8%D7%99%D7%A7_%D7%90%D7%99%D7%99%D7%A0%D7%A9%D7%98%D7%99%D7%99%D7%9F_-_%D7%99%D7%A9_%D7%91%D7%99_%D7%90%D7%94%D7%91%D7%94.html";
    const elementsToHide = ['#topMenuInSong', '#scSpeed_div', '#youtubeEMBD'];//Overlapping elements
    const usedManipulationsFiletPath = 'cypress/outputs/ManipulationsThatWereUsed.txt';
    const targetSelector = '[id="songContentTPL"]'; //lyrics div
    const promptFilePath = 'cypress/fixtures/Prompt.txt';
    const apiOutputFilePath = 'cypress/outputs/GeminiOutput.txt';
    const numberOfAttributesToApply = 1;

    before(() => {
        cy.visit(webSiteUrl, { timeout: 20000 });
        cy.hideElements(elementsToHide);
        // cy.upscaleFont();
        cy.get('[id = "songContentTPL"]', { timeout: 60000 }).should('be.visible')
            .invoke('attr', 'style', 'zoom:2;')

    });

    it('Apply random styles to lyrics + screenshot + API', () => {
        //Vertical viewport (vertical monitor)
        cy.viewport(1080, 1920);

        //cy.applyRandomStyles('cypress/fixtures/Manipulations_upscale.json', targetSelector, numberOfAttributesToApply);
        // Base screenshot
        cy.get(targetSelector, { timeout: 20000 }).screenshot('BaseImage', { overwrite: true, timeout: 60000 });


        cy.applyRandomStyles(usedManipulationsFiletPath, targetSelector, numberOfAttributesToApply);

        // Take second screenshot
        cy.get(targetSelector, { timeout: 20000 }).screenshot('ManipulatedImage', { overwrite: true, timeout: 60000 }).then(() => {
            //  cy.compareScreenshots('BaseImage', 'ManipulatedImage', promptFilePath);
        });
    });


    it('API to GEMINI', () => {

        cy.compareScreenshots('BaseImage', 'ManipulatedImage', promptFilePath);
    });


    it('Analyze output files and validate', () => {

        cy.outputDataAnalyzing(apiOutputFilePath, numberOfAttributesToApply);
    });
});


