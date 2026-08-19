import { redirect } from "next/navigation";
import { createSession, getSession } from "../../../lib/auth";

async function login(formData) {
    "use server";

    const username = formData.get("username");
    const password = formData.get("password");

    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        redirect("/adminlogin?error=Invalid%20username%20or%20password");
    }

    await createSession(username);
    redirect("/adminaction");
}

export default async function LoginPage({ searchParams }) {
    const session = await getSession();
    if (session) redirect("/adminaction");

    const params = await searchParams;
    const error = params?.error;

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <form action={login} className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Admin login</h1>
                    <p className="mt-2 text-sm text-slate-600">Sign in to continue.</p>
                </div>

                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                <label className="block text-sm font-medium text-slate-700">
                    Username
                    <input name="username" type="text" autoComplete="username" required className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Password
                    <input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700">
                    Sign in
                </button>
            </form>
        </main>
    );
}
