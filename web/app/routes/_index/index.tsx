import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { LogIn } from "lucide-react";
import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import { useTypedLoaderData } from "remix-typedjson";
import { Button } from "~/components/ui/button";
import i18nServer from "~/i18n.server";
import { authenticator } from "~/utils/auth.server";
import { SourceTextAndTranslationSection } from "../$userName+/page+/$slug+/components/sourceTextAndTranslationSection/SourceTextAndTranslationSection";
import { fetchPageWithTranslations } from "../$userName+/page+/$slug+/functions/queries.server";
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
	const pageName = targetLanguage === "en" ? "eveeve-ja" : "eveeve";
	const topPageWithTranslations = await fetchPageWithTranslations(
		pageName,
		currentUser?.id ?? 0,
		targetLanguage,
	);
	if (!topPageWithTranslations) {
		throw new Response("Not Found", { status: 404 });
	}
	const sourceLanguage = topPageWithTranslations.sourceLanguage;
	const heroTitle = topPageWithTranslations.sourceTextWithTranslations.find(
		(SourceTextWithTranslation) =>
			SourceTextWithTranslation.sourceText.number === 0,
	);
	const heroText = topPageWithTranslations.sourceTextWithTranslations.find(
		(SourceTextWithTranslation) =>
			SourceTextWithTranslation.sourceText.number === 1,
	);
	if (!heroTitle || !heroText) {
		throw new Response("Not Found", { status: 404 });
	}
	return {
		currentUser,
		heroTitle,
		heroText,
		sourceLanguage,
		targetLanguage,
	};
}
export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.authenticate("google", request);

	if (currentUser) {
		return redirect(`/${currentUser.userName}`);
	}

	return redirect("/auth/login");
}

export default function Index() {
	const { currentUser, heroTitle, heroText, sourceLanguage, targetLanguage } =
		useTypedLoaderData<typeof loader>();

	return (
		<div className="flex flex-col justify-between">
			<main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center flex-grow">
				<div className="max-w-4xl w-full">
					<h1 className="text-7xl font-bold mb-20 text-center">
						<SourceTextAndTranslationSection
							sourceTextWithTranslation={heroTitle}
							sourceTextClassName="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2"
							currentUserName={currentUser?.userName}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
						/>
					</h1>

					<span className="text-xl mb-12 w-full">
						<SourceTextAndTranslationSection
							sourceTextWithTranslation={heroText}
							sourceTextClassName="mb-2"
							currentUserName={currentUser?.userName}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
						/>
					</span>

					<div className="mb-12 flex justify-center mt-10">
						<Form method="POST">
							<Button
								type="submit"
								variant="default"
								size="lg"
								className="w-60 h-12"
							>
								<FaGoogle className=" mr-2" />
								<LogIn />
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
			</main>
		</div>
	);
}
