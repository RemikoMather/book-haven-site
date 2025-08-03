// Initialize Supabase globally
window.initSupabase = () => {
    try {
        if (!window.Supabase) {
            throw new Error('Supabase library is not loaded');
        }
        // Create a reference to the constructor
        window.supabase = window.Supabase;
        console.log('DEBUG: Supabase global object initialized successfully');
        
        // Dispatch an event to notify that Supabase is ready
        window.dispatchEvent(new Event('supabaseReady'));
    } catch (error) {
        console.error('DEBUG: Failed to initialize global Supabase object:', error);
        // Re-throw the error to ensure calling code knows about the failure
        throw error;
    }
};
