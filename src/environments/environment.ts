import { domain, clientId } from '../../auth_config.json';

let redirectUri = '';
if (typeof window !== 'undefined') {
  redirectUri = window.location.origin;
}

export const environment = {
    production: false,
    auth: {
        domain,
        clientId,
        redirectUri
    }
}
