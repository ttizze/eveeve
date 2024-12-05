import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import i18nServer from "~/i18n.server";
import { getNonSanitizedUserbyUserName } from "~/routes/functions/queries.server";
import { authenticator } from "~/utils/auth.server";
import { FolderUploadTab } from "./components/FolderUploadTab";
import { GitHubIntegrationTab } from "./components/GitHubIntegrationTab";
import { PageManagementTab } from "./components/PageManagementTab";
import { archivePages, togglePagePublicStatus } from "./functions/mutations.server";
import { fetchPaginatedOwnPages } from "./functions/queries.server";
import { translationInputSchema } from "./types";
import { processFolder } from "./utils/process-folder";

const archiveSchema = z.object({
  pageIds: z.string().transform((val) => val.split(",").map(Number)),
  intent: z.literal("archive"),
});

const togglePublicSchema = z.object({
  pageId: z.string().transform(Number),
  intent: z.literal("togglePublic"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });

  const nonSanitizedUser = await getNonSanitizedUserbyUserName(
    currentUser.userName,
  );
  const hasGeminiApiKey = !!nonSanitizedUser?.geminiApiKey;
  const targetLanguage = await i18nServer.getLocale(request);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || "";
  const { pagesWithTitle, totalPages, currentPage } =
    await fetchPaginatedOwnPages(
      currentUser.id,
      targetLanguage,
      page,
      10,
      search,
    );
  return {
    currentUser,
    hasGeminiApiKey,
    pagesWithTitle,
    totalPages,
    currentPage,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const nonSanitizedUser = await getNonSanitizedUserbyUserName(
    currentUser.userName,
  );
  const formData = await request.formData();

  if (formData.get("intent") === "archive") {
    const submission = parseWithZod(formData, {
      schema: archiveSchema,
    });

    if (submission.status !== "success") {
      return data(
        { error: "Invalid submission" },
        {
          status: 400,
        },
      );
    }

    await archivePages(submission.value.pageIds);
    return data({ success: true });
  }

  if (formData.get("intent") === "togglePublic") {
    const submission = parseWithZod(formData, {
      schema: togglePublicSchema,
    });

    if (submission.status !== "success") {
      return data(
        { error: "Invalid submission" },
        {
          status: 400,
        },
      );
    }

    await togglePagePublicStatus(submission.value.pageId);
    return data({ success: true });
  }

  const submission = parseWithZod(formData, {
    schema: translationInputSchema,
  });
  if (submission.status !== "success") {
    return { lastResult: submission.reply() };
  }

  if (!nonSanitizedUser?.geminiApiKey) {
    return {
      lastResult: submission.reply({
        formErrors: ["Gemini API key is not set"],
      }),
      slugs: [],
    };
  }

  const targetLanguage = await i18nServer.getLocale(request);
  const queue = getTranslateUserQueue(nonSanitizedUser.id);

  function generateLinkArticle(
    userId: number,
    folderPath: string,
    files: { name: string; slug: string }[],
  ): string {
    let article = `
      # ${folderPath}
      <ul>
    `;

    for (const file of files) {
      article += `
        <li>
          <a href="/${userId}/page/${file.slug}">${file.name}</a>
          <a href="/${userId}/page/${file.slug}/edit" class="edit-link">[edit]</a>
        </li>
      `;
    }

    article += `
      </ul>
    `;

    return article;
  }

  let slugs: string[] = [];
  if (submission.value.folder) {
    slugs = await processFolder(
      submission.value.folder,
      nonSanitizedUser,
      submission.value.aiModel,
      targetLanguage,
      queue,
    );
  } else {
    return {
      lastResult: submission.reply({
        formErrors: ["Folder is not selected"],
      }),
      slugs: [],
    };
  }

  return {
    lastResult: submission.reply({ resetForm: true }),
    slugs,
  };
}

export default function TranslatePage() {
  const { hasGeminiApiKey, pagesWithTitle, totalPages, currentPage, currentUser } =
    useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Tabs defaultValue="page-management" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="page-management">Management</TabsTrigger>
          <TabsTrigger value="folder-upload">Folder</TabsTrigger>
          <TabsTrigger value="github-integration">GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="page-management">
          <PageManagementTab
            pagesWithTitle={pagesWithTitle}
            totalPages={totalPages}
            currentPage={currentPage}
            userName={currentUser.userName}
          />
        </TabsContent>

        <TabsContent value="folder-upload">
          {hasGeminiApiKey ? (
            <FolderUploadTab />
          ) : (
            <div className="p-4 text-center text-red-500">
              Gemini API key is not set
            </div>
          )}
        </TabsContent>

        <TabsContent value="github-integration">
          <GitHubIntegrationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
