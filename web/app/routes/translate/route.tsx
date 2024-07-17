import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { authenticator } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma";
import { getSession } from "~/utils/session.server";
import { extractNumberedElements } from "./../../libs/extractNumberedElements";
import {
  URLTranslationForm,
  urlTranslationSchema,
} from "./components/URLTranslationForm";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import { translate } from "./libs/translation";
import {
  type UserAITranslationInfoItem,
  UserAITranslationInfoSchema,
} from "./types";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { extractArticle } from "./utils/extractArticle";
import { fetchWithRetry } from "./utils/fetchWithRetry";
import { z } from "zod";
import { redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const safeUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const dbUser = await prisma.user.findUnique({ where: { id: safeUser.id } });
  if (!dbUser?.geminiApiKey) {
    return redirect("/settings");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const targetLanguage = session.get("targetLanguage") || "ja";
  let userAITranslationInfo: UserAITranslationInfoItem[] = [];
  const rawTranslationInfo = await prisma.userAITranslationInfo.findMany({
    where: {
      userId: safeUser.id,
      targetLanguage,
    },
    include: {
      pageVersion: {
        select: {
          title: true,
          page: {
            select: {
              url: true,
            },
          },
          pageVersionTranslationInfo: {
            where: {
              targetLanguage,
            },
          },
        },
      },
    },
    orderBy: {
      lastTranslatedAt: "desc",
    },
    take: 10,
  });

  // Validate and transform data
  userAITranslationInfo = z
    .array(UserAITranslationInfoSchema)
    .parse(rawTranslationInfo);

  return typedjson({
    safeUser,
    targetLanguage,
    userAITranslationInfo,
  });
}
export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: urlTranslationSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.geminiApiKey) {
    return submission.reply({ formErrors: ["Gemini API key is not set"] });
  }

  const html = await fetchWithRetry(submission.value.url);
  const { content, title } = extractArticle(html);
  const numberedContent = addNumbersToContent(content);
  const extractedNumberedElements = extractNumberedElements(numberedContent);
  const session = await getSession(request.headers.get("Cookie"));
  const targetLanguage = session.get("targetLanguage") || "ja";

  await translate(
    dbUser.geminiApiKey,
    user.id,
    targetLanguage,
    title,
    numberedContent,
    extractedNumberedElements,
    submission.value.url,
  );

  return submission.reply();
}

export default function TranslatePage() {
  const { user, targetLanguage, userAITranslationInfo } =
    useTypedLoaderData<typeof loader>();

  return (
    <div>
      <h1>Translate</h1>
      <URLTranslationForm />
      <UserAITranslationStatus
        userAITranslationInfo={userAITranslationInfo}
        targetLanguage={targetLanguage}
      />
    </div>
  );
}
