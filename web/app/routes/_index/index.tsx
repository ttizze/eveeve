import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import i18nServer from "~/i18n.server";
import { authenticator } from "~/utils/auth.server";
import { AddAndVoteTranslations } from "../$userName+/page+/$slug+/components/sourceTextAndTranslationSection/AddAndVoteTranslations";
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
	const sourceLanguage = topPageWithTranslations.page.sourceLanguage;

	const [heroTitle, heroText] =
		topPageWithTranslations.sourceTextWithTranslations
			.filter((st) => st.sourceText.number === 0 || st.sourceText.number === 1)
			.sort((a, b) => a.sourceText.number - b.sourceText.number);

	if (!heroTitle || !heroText) {
		throw new Response("Not Found", { status: 404 });
	}
	return {
		currentUser,
		topPageWithTranslations,
		heroTitle,
		heroText,
		sourceLanguage,
		targetLanguage,
	};
}
export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.authenticate("google", request);
	return currentUser ? redirect("/home") : redirect("/auth/login");
}

export default function Index() {
	const {
		currentUser,
		topPageWithTranslations,
		heroTitle,
		heroText,
		sourceLanguage,
		targetLanguage,
	} = useLoaderData<typeof loader>();
	const [selectedSourceTextId, setSelectedSourceTextId] = useState<
		number | null
	>(null);

	const handleOpenAddAndVoteTranslations = (sourceTextId: number) => {
		setSelectedSourceTextId(sourceTextId);
	};

	const handleCloseAddAndVoteTranslations = () => {
		setSelectedSourceTextId(null);
	};

	const selectedSourceTextWithTranslations =
		topPageWithTranslations.sourceTextWithTranslations.find(
			(stw) => stw.sourceText.id === selectedSourceTextId,
		);

	return (
		<div className="flex flex-col justify-between">
			<main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center flex-grow">
				<div className="max-w-4xl w-full">
					<h1 className="text-7xl font-bold mb-20 text-center">
						<SourceTextAndTranslationSection
							sourceTextWithTranslations={heroTitle}
							sourceTextClassName="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text !text-transparent mb-2"
							elements={heroTitle.sourceText.text}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
							onOpenAddAndVoteTranslations={handleOpenAddAndVoteTranslations}
						/>
					</h1>

					<span className="text-xl mb-12 w-full">
						<SourceTextAndTranslationSection
							sourceTextWithTranslations={heroText}
							sourceTextClassName="mb-2"
							elements={heroText.sourceText.text}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
							onOpenAddAndVoteTranslations={handleOpenAddAndVoteTranslations}
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
				</div>
				{selectedSourceTextWithTranslations && (
					<AddAndVoteTranslations
						key={`add-and-vote-translations-${selectedSourceTextWithTranslations.sourceText.id}`}
						open={true}
						onOpenChange={(open) => {
							if (!open) {
								handleCloseAddAndVoteTranslations();
							}
						}}
						currentUserName={currentUser?.userName}
						sourceTextWithTranslations={selectedSourceTextWithTranslations}
					/>
				)}
			</main>
		</div>
	);
}
