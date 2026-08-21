import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 8 * 60 * 60;

function getSessionSecret() {
    if (!process.env.SESSION_SECRET) {
        throw new Error("SESSION_SECRET is not configured");
    }

    return process.env.SESSION_SECRET;
}

function sign(value) {
    return crypto
        .createHmac("sha256", getSessionSecret())
        .update(value)
        .digest("base64url");
}

function createToken(username) {
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
    const payload = Buffer.from(
        JSON.stringify({ username, expiresAt }),
    ).toString("base64url");

    return `${payload}.${sign(payload)}`;
}

function readToken(token) {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expectedSignature = sign(payload);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (
        received.length !== expected.length ||
        !crypto.timingSafeEqual(received, expected)
    ) {
        return null;
    }

    try {
        const session = JSON.parse(Buffer.from(payload, "base64url").toString());
        if (session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
        if (session.username !== process.env.ADMIN_USERNAME) return null;
        return session;
    } catch {
        return null;
    }
}

export async function createSession(username) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, createToken(username), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_DURATION,
        path: "/",
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    return token ? readToken(token) : null;
}