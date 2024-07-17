import type { PageVersion } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
interface LoaderData {
	pageVersionList: PageVersion[];
}

export function TranslatedList(language: string) {
	const { pageVersionList } = useLoaderData<LoaderData>();
	return (
		<div>
			<h2>Translated List (Language: {language})</h2>
			<ul>
				{pageVersionList.map((pageVersion) => (
					<li key={pageVersion.id}>
						{/* ページのタイトルや他の情報を表示 */}
						{pageVersion.title} - {pageVersion.url}
					</li>
				))}
			</ul>
		</div>
	);
}
