type FortyTwoTokenResponse = {
    access_token: string;
    expires_in: number;
};

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let pendingTokenRequest: Promise<string> | null = null;

export type FortyTwoUser = {
    id: number;
    login: string;
    email: string;
    displayname: string;
    location: string | null;
    image?: { link?: string };
    campus?: { id: number; name: string; time_zone: string }[];
    campus_users?: {
        id: number;
        user_id: number;
        campus_id: number;
        is_primary: boolean;
    }[];
};

async function get42AppToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }
    if (pendingTokenRequest) {
        return pendingTokenRequest;
    }
    pendingTokenRequest = (async (): Promise<string> => {

        const clientId = process.env.FORTYTWO_CLIENT_ID;
        const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error("42 API credentials are not configured");
        }

        const response = await fetch(
            "https://api.intra.42.fr/oauth/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    grant_type: "client_credentials",
                    client_id: clientId,
                    client_secret: clientSecret
                })
            }
        );

        if (!response.ok) {
            const body = await response.text();

            console.error(
                `42 app token failed: ${response.status} ${response.statusText}`,
                body
            );

            throw new Error(
                `42 app authentication failed with status ${response.status}`
            );
        }

        const data = await response.json() as FortyTwoTokenResponse;

        cachedToken = data.access_token;

        tokenExpiresAt = Date.now() + (data.expires_in - 30) * 1000;

        return cachedToken
    })();

    try {
        return await pendingTokenRequest;
    } finally {
        pendingTokenRequest = null;
    }
}

export async function get42UserByLogin(
    login: string
): Promise<FortyTwoUser> {
    const token = await get42AppToken();

    const response = await fetch(
        `https://api.intra.42.fr/v2/users/${encodeURIComponent(login)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const body = await response.text();

        console.error(
            `42 user lookup failed: ${response.status} ${response.statusText}`,
            body
        );

        throw new Error(
            `42 user lookup failed with status ${response.status}`
        );
    }

    return await response.json() as FortyTwoUser;
}