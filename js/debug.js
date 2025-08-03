export const debug = {
    log: (message, ...args) => {
        console.log(`[DEBUG] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    }
};

// Add a global error handler to catch unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    debug.error('Unhandled promise rejection:', event.reason);
});
