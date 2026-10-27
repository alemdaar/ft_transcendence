import { z } from "zod";
import { HttpError } from "../lib/http-error";

const profileSchema = z.object({
    id: z.number().int().positive(),
    login: z.string().min(1),
    email: z.email(),
    displayname: z.string().nullish(),
    location: z.string().nullish(),
    image: z.object({ link: z.string().nullish() }).nullish(),
    campus: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
    campus_users: z.array(z.object({ campus_id: z.number(), is_primary: z.boolean() })).optional()
});
export type FortyTwoUser = z.infer<typeof profileSchema>;
let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let pendingTokenRequest: Promise<string> | null = null;

// The signal also bounds consumption of the response body.
export async function fetch42(path: string, options: RequestInit = {}) {
    try {
        return await fetch(`https://api.intra.42.fr${path}`, { ...options, signal: AbortSignal.timeout(10000) });
    } catch {
        throw new HttpError(502, "Unable to reach 42. Please try again later.");
    }
}

export function parse42Profile(data: unknown): FortyTwoUser {
    const result = profileSchema.safeParse(data);
    if (!result.success) throw new HttpError(502, "Invalid 42 profile data");
    return result.data;
}

export async function read42Json(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        throw new HttpError(502, "Unable to read 42 response");
    }
}

async function get42AppToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
    if (pendingTokenRequest) return pendingTokenRequest;
    pendingTokenRequest = (async () => {
        const clientId = process.env.FORTYTWO_CLIENT_ID;
        const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
        if (!clientId || !clientSecret) throw new HttpError(503, "42 API is not configured");
        const response = await fetch42("/oauth/token", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret })
        });
        if (!response.ok) throw new HttpError(502, "42 app authentication failed");
        const data = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() }).safeParse(await read42Json(response));
        if (!data.success) throw new HttpError(502, "Invalid 42 token data");
        cachedToken = data.data.access_token;
        tokenExpiresAt = Date.now() + Math.max(0, data.data.expires_in - 30) * 1000;
        return cachedToken;
    })();
    try {
        return await pendingTokenRequest;
    } finally {
        pendingTokenRequest = null;
    }
}

export async function get42UserByLogin(login: string): Promise<FortyTwoUser> {
    let token = await get42AppToken();
    let response = await fetch42(`/v2/users/${encodeURIComponent(login)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) {
        cachedToken = null;
        token = await get42AppToken();
        response = await fetch42(`/v2/users/${encodeURIComponent(login)}`, { headers: { Authorization: `Bearer ${token}` } });
    }
    if (!response.ok) throw new HttpError(502, "Unable to retrieve 42 profile");
    const profile = parse42Profile(await read42Json(response));
    if (profile.login.toLowerCase() !== login.toLowerCase()) throw new HttpError(502, "42 profile does not match the requested login");
    return profile;
}
