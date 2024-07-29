import { useForm,getFormProps,getInputProps, } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { type ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/utils/prisma";

const schema = z.object({
  query: z.string().min(1, "Search query is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return { lastResult: submission.reply() ,results: []};
  }
  const { query } = submission.value;

  const results = await prisma.pageVersion.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { pageVersionTranslationInfo: { some: { translationTitle: { contains: query, mode: "insensitive" } } } },
      ],
    },
    include: {
      pageVersionTranslationInfo: true,
    },
  });

  return { lastResult: submission.reply(), results };
}

export default function Search() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSearching = navigation.state === "submitting";

  const [form, fields] = useForm({
    id: "search-form",
    constraint: getZodConstraint(schema),
    lastResult: actionData?.lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Page Versions</h1>
      <Form method="post" {...getFormProps(form)}>
        <div className="flex gap-2">
          <Input
            {...getInputProps(fields.query, { type: "text" })}
            placeholder="Search for page titles or translations..."
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </Form>

      {actionData?.results && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          {actionData.results.length === 0 ? (
            <p>No results found.</p>
          ) : (
            <ul className="space-y-2">
              {actionData.results.map((result) => (
                <li key={result.id} className="border p-2 rounded">
                  <h3 className="font-bold">{result.title}</h3>
                  {result.pageVersionTranslationInfo.map((info) => (
                    <p key={info.id}>
                      {info.targetLanguage}: {info.translationTitle}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}