// cypress/support/commands.js

Cypress.Commands.add('selectByIndex',
    { prevSubject: 'element' }, (subject, index) => {
        cy.wrap(subject)
            .find('option')
            .eq(index)
            .then(option => {
                cy.wrap(subject).select(option.text());
            });
    });



