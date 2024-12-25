import CryptoJS from "crypto-js";

export const generateOauthParams = (endpoint, params, method = 'GET') => {
    const oauth_nonce = Math.random().toString(36).substring(2);
    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_version = '1.0';
    const oauth_signature_method = 'HMAC-SHA1';
    const oauth_consumer_key = params.oauth_consumer_key;
    const oauth_consumer_secret = params.oauth_consumer_secret;

    const headerParams = {
      oauth_consumer_key,
      oauth_nonce,
      oauth_signature_method,
      oauth_timestamp,
      oauth_version,
    };

    if (params.category) {
      headerParams.category = params.category;
    }

    const paramString = Object.keys(headerParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(headerParams[key])}`)
      .join('&');

    const encodedEndpoint = encodeURIComponent(endpoint);

    const baseString = [
      method.toUpperCase(),
      encodedEndpoint,
      encodeURIComponent(paramString),
    ].join('&');

    const signingKey = `${encodeURIComponent(oauth_consumer_secret)}&`;

    const oauth_signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);
    headerParams.oauth_signature = oauth_signature;
    
    return headerParams;
}