import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { authenticator } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
	return [
		{ title: "EveEve" },
		{
			name: "description",
			content:
				"EveEveは、インターネット上のテキストを翻訳できるオープンソースプロジェクトです。",
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request);
	return typedjson({ safeUser });
}

export async function action({ request }: ActionFunctionArgs) {
	return authenticator.authenticate("google", request, {
		successRedirect: "/translator",
		failureRedirect: "/",
	});
}

export default function Index() {
	const { safeUser } = useTypedLoaderData<typeof loader>();

	return (
		<div className="min-h-screen bg-gradient-to-b ">
			<Header safeUser={safeUser} />
			<main className="container mx-auto px-4 py-20">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-5xl font-bold mb-6">
						Everyone Translate Everything
					</h1>
					<p className="text-xl  mb-12">
						EveEveは、インターネット上のテキストを翻訳し､共有し､より良い翻訳を作り上げていくオープンソースプロジェクトです。
					</p>
					<div className="flex justify-center gap-4 mb-8">
						<Form method="POST" className="w-full ">
							<Button
								type="submit"
								name="intent"
								value="SignInWithGoogle"
								variant="default"
							>
								Start
							</Button>
						</Form>
					</div>
					<div className="flex justify-center gap-6">
						<a
							href="https://github.com/ttizze/eveeve"
							target="_blank"
							rel="noopener noreferrer"
							className="  transition-colors"
						>
							<FaGithub size={24} />
						</a>
						<a
							href="https://discord.gg/2JfhZdu9zW"
							target="_blank"
							rel="noopener noreferrer"
							className="  transition-colors"
						>
							<FaDiscord size={24} />
						</a>
					</div>
				</div>

				<div className="mt-20">
					<Card className=" border-gray-700">
						<CardContent className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2">Easy to Use</h3>
									<p className="">
										シンプルなインターフェースで、誰でも簡単に翻訳を始められます。
									</p>
								</div>
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2">Open Source</h3>
									<p className="">
										コミュニティの力で、常に進化し続けるプラットフォーム。
									</p>
								</div>
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2">Multilingual</h3>
									<p className="">
										多言語対応で、世界中のコンテンツにアクセス可能。
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
