class Config {
    constructor() {
        this.configs = {
            SUPABASE_URL: 'https://qeoyopgtolnmtdaahdvn.supabase.co',
            SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb3lvcGd0b2xubXRkYWFoZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjY0MTUsImV4cCI6MjA2OTc0MjQxNX0.wqSrr2lLHO0JzG3426dVlMEaJne3gKbn8nqibn57FgM',
            NODE_ENV: 'development',
            BASE_URL: location.hostname === 'remikomather.github.io' ? '/book-haven-site' : ''
        };
    }

    get(key) {
        return this.configs[key];
    }

    getAssetUrl(path) {
        return `${this.get('BASE_URL')}${path}`;
    }
}

export const config = new Config();
