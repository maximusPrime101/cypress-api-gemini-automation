// cypress/support/index.js

// Intercept all XHR POST requests and suppress logging
Cypress.Commands.overwrite('intercept', (originalFn, ...args) => {
    const options = args[0] || {};
    // Check if this is a request you want to suppress
    if (options.method === 'POST') {
        // Disable logging for this intercept
        options.log = false;
    }
    return originalFn(...args);
});
