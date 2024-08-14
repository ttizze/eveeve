import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { authenticator } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
	return [
		{ title: "EveEve" },
		{
			name: "description",
			content:
				"EveEve is an open-source platform for collaborative article translation and sharing.",
		},
	];
};
export async function loader({ request }: LoaderFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request);
	return typedjson({ currentUser });
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await authenticator.authenticate("google", request);

	if (user) {
		if (user.userName) {
			return redirect(`/${user.userName}`);
		}
		return redirect("/welcome");
	}

	return redirect("/auth/login");
}

export default function Index() {
	const { currentUser } = useTypedLoaderData<typeof loader>();

	return (
		<div className="min-h-screen bg-gradient-to-b ">
			<main className="container mx-auto px-4 py-20">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-5xl font-bold mb-6">
						Everyone Understand Everyone
					</h1>
					<p className="text-xl mb-12">
						EveEve is an open-source platform where users can post articles and
						collaborate on translations, fostering global understanding and
						knowledge sharing.
					</p>
					<div className="flex justify-center gap-4 mb-8">
						<Form method="POST" className="w-full ">
							<Button type="submit" variant="default">
								Start
							</Button>
						</Form>
					</div>
					<div className="flex justify-center gap-6">
						<a
							href="https://github.com/ttizze/eveeve"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors"
						>
							<FaGithub size={24} />
						</a>
						<a
							href="https://discord.gg/2JfhZdu9zW"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors"
						>
							<FaDiscord size={24} />
						</a>
					</div>
				</div>

				<div className="mt-20">
					<Card className="border-gray-700">
						<CardContent className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2">Easy to Use</h3>
									<p className="">
										Simple interface for effortless article posting and
										translation.
									</p>
								</div>
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2">Open Source</h3>
									<p className="">
										A community-driven platform that continuously evolves.
									</p>
								</div>
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2">Multilingual</h3>
									<p className="">
										Access and contribute to content in multiple languages.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
