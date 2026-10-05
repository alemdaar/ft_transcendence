type FortyTwoTokenResponse = {
    access_token: string;
};

export type FortyTwoUser = {
    id: number;
    login: string;
    email: string;

    image?: {
        link?: string;
    };

    campus?: {
        id: number;
        name: string;
        time_zone: string;
    }[];

    campus_users?: {
        id: number;
        user_id: number;
        campus_id: number;
        is_primary: boolean;
    }[];
};

async function get42AppToken(): Promise<string> {
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

    return data.access_token;
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