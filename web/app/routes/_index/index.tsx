import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { LogIn } from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { useTypedLoaderData } from "remix-typedjson";
import { Button } from "~/components/ui/button";
import i18nServer from "~/i18n.server";
import { authenticator } from "~/utils/auth.server";
import { TranslationSection } from "../$userName+/page+/$slug+/components/TranslationSection";
import { fetchPageWithTranslations } from "../$userName+/page+/$slug+/functions/queries.server";
import type { PageWithTranslations } from "../$userName+/page+/$slug+/types";

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
	const targetLanguage = await i18nServer.getLocale(request);
	const topPageWithTranslations = await fetchPageWithTranslations(
		"eveeve",
		currentUser?.id ?? 0,
		targetLanguage,
	);
	return {
		currentUser,
		topPageWithTranslations: topPageWithTranslations as PageWithTranslations,
		targetLanguage,
	};
}
export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.authenticate("google", request);

	if (currentUser) {
		if (currentUser.userName) {
			return redirect(`/${currentUser.userName}`);
		}
		return redirect("/welcome");
	}

	return redirect("/auth/login");
}

export default function Index() {
	const { currentUser, topPageWithTranslations, targetLanguage } =
		useTypedLoaderData<typeof loader>();
	const sourceTextWithTranslations =
		topPageWithTranslations.sourceTextWithTranslations;

	return (
		<div className="min-h-screen flex flex-col justify-between">
			<main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center flex-grow">
				<div className="max-w-4xl w-full">
					<h1 className="text-7xl font-bold mb-20 text-center">
						<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent inline-block mb-2">
							{sourceTextWithTranslations[0].text}
						</span>
						{targetLanguage !== "en" && (
							<TranslationSection
								translationsWithVotes={
									sourceTextWithTranslations[0].translationsWithVotes
								}
								currentUserName={currentUser?.userName || null}
								sourceTextId={sourceTextWithTranslations[0].sourceTextId}
							/>
						)}
					</h1>

					<p className="text-xl mb-12 w-full">
						<span className="text-slate-500 dark:text-slate-400 inline-block mb-2">
							{sourceTextWithTranslations[1].text}
						</span>
						{targetLanguage !== "en" && (
							<TranslationSection
								translationsWithVotes={
									sourceTextWithTranslations[1].translationsWithVotes
								}
								currentUserName={currentUser?.userName || null}
								sourceTextId={sourceTextWithTranslations[1].sourceTextId}
							/>
						)}
					</p>

					<div className="mb-12 flex justify-center">
						<Form method="POST">
							<Button type="submit" variant="default" size="lg">
								<LogIn className="w-48 " />
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

				{/* <div className="mt-20">
					<div className="">
						<Card className="border-gray-700">
							<CardContent className="p-6">
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
										<SquarePen size={24} />
									</h3>
									<div className="relative">
										<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg transform -rotate-6 scale-105 opacity-30 blur-sm" />
										<img
											src="/write.png"
											alt="Write"
											className="relative w-full rounded-lg shadow-xl transform -translate-y-2"
										/>
									</div>
									<p className="">
										Simple interface for effortless article posting.
									</p>
								</div>
							</CardContent>
						</Card>
						<Card className="border-gray-700">
							<CardContent className="p-6">
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
										<BookOpen size={24} />
									</h3>
									<img
										src="/read.png"
										alt="Read"
										className="w-full border-4 shadow-lg rounded-lg"
									/>
									<p className="">
										Read articles in your native language, regardless of the
										original language.
									</p>
								</div>
							</CardContent>
						</Card>
						<Card className="border-gray-700">
							<CardContent className="p-6">
								<div className="text-center">
									<h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
										<Languages size={24} />
									</h3>
									<img
										src="/translate.png"
										alt="Translate"
										className="w-full border-4 shadow-lg rounded-lg"
									/>
									<p className="">
										Translate articles into your native language.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div> */}
			</main>
		</div>
	);
}
