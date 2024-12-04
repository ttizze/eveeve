import type { MetaFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import i18nServer from "~/i18n.server";
import { authenticator } from "~/utils/auth.server";
import { AddAndVoteTranslations } from "../$userName+/page+/$slug+/components/sourceTextAndTranslationSection/AddAndVoteTranslations";
import { SourceTextAndTranslationSection } from "../$userName+/page+/$slug+/components/sourceTextAndTranslationSection/SourceTextAndTranslationSection";
import { fetchPageWithTranslations } from "../$userName+/page+/$slug+/functions/queries.server";
import { StartButton } from "../../components/StartButton";
import { useFloating } from "@floating-ui/react";

export const meta: MetaFunction = () => {
	return [
		{ title: "Evame" },
		{
			name: "description",
			content:
				"Evame is an open-source platform for collaborative article translation and sharing.",
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {

	const currentUser = await authenticator.isAuthenticated(request);
	const targetLanguage = await i18nServer.getLocale(request);
	const pageName = targetLanguage === "en" ? "evame-ja" : "evame";
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

export default function Index() {
	const {
		currentUser,
		topPageWithTranslations,
		heroTitle,
		heroText,
		sourceLanguage,
		targetLanguage,
	} = useLoaderData<typeof loader>();
	const { refs: floatingRefs, floatingStyles } = useFloating();
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
			<main className="prose dark:prose-invert sm:prose lg:prose-lg mx-auto px-2 py-10 flex flex-col items-center justify-center">
				<div className="max-w-4xl w-full">
					<h1 className="text-7xl font-bold mb-20 text-center">
						<SourceTextAndTranslationSection
							sourceTextWithTranslations={heroTitle}
							sourceTextClassName="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text !text-transparent mb-2"
							elements={heroTitle.sourceText.text}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
							onOpenAddAndVoteTranslations={handleOpenAddAndVoteTranslations}
							showOriginal={true}
							showTranslation={true}
							selectedSourceTextId={selectedSourceTextId}
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
							showOriginal={true}
							showTranslation={true}
							selectedSourceTextId={selectedSourceTextId}
						/>
					</span>
					{!currentUser && (
						<div className="mb-12 flex justify-center mt-10">
							<StartButton className="w-60 h-12 text-xl" />
						</div>
					)}
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
						floatingRefs={floatingRefs}
						floatingStyles={floatingStyles}
					/>
				)}
			</main>
		</div>
	);
}
