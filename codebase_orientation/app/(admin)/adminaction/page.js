import { redirect } from "next/navigation";
import { getSession } from "../../../lib/auth";

export default async function AdminActionPage() {
	const session = await getSession();
	if (!session) redirect("/adminlogin");

	return (
		<main className="min-h-screen bg-slate-100 px-6 py-12">
			<div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
				<h1 className="text-2xl font-semibold text-slate-900">Admin actions</h1>
				<p className="mt-2 text-slate-600">
					Welcome, {session.username}.
				</p>
			</div>
		</main>
	);
}
