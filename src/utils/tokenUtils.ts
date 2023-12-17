export const isTokenExpired = (token: string): boolean => {
    if (!token) {
        return true;
    }

    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;

    const currentUnixTime = Math.floor(Date.now() / 1000);
    return exp < currentUnixTime;
};

export const getSecondsUntilExpiry = (token: string) => {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    const currentUnixTime = Math.floor(Date.now() / 1000);
    return exp - currentUnixTime; // Returns the number of seconds until expiry
};

