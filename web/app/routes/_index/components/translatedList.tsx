import type { PageVersion } from "@prisma/client";
import { useLoaderData, useMatches } from "@remix-run/react";
import type { RootLoaderData } from "~/root"; // root.tsxからインポート

interface LoaderData {
  pageVersionList: PageVersion[];
}

export function TranslatedList() {
  const { pageVersionList } = useLoaderData<LoaderData>();
  const matches = useMatches();
  const rootData = matches[0].data as RootLoaderData;
  const language = rootData.language;

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