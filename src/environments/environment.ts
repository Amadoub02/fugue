export const environment = {
    production: false,
    auth: {
        domain: "dev-gxdpde05s3bl244k.us.auth0.com",
        clientId: "7Wj7IHLfFQPlNR6zXpotuhJBaaFUwinu",
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
    }
}
