
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator } from "~/utils/auth.server";
import { getUserByUserName, updateUser } from "./functions/queries.server";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

const schema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name must be 50 characters or less"),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUserByUserName(params.userName || "");
  if (!user) throw new Response("Not Found", { status: 404 });

  if (user.userName !== params.userName) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return typedjson({ user });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const displayName = formData.get("displayName") as string;

  const result = schema.safeParse({ displayName });

  if (!result.success) {
    return typedjson({ errors: result.error.flatten().fieldErrors });
  }

  await updateUser(currentUser.id, { displayName });

  return redirect(`/${params.userName}`);
};

export default function EditProfile() {
  const { user } = useTypedLoaderData<typeof loader>();

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <Form method="post" className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            type="text"
            id="displayName"
            name="displayName"
            defaultValue={user.displayName}
            required
          />
        </div>
        <Button type="submit">Save Changes</Button>
      </Form>
    </div>
  );
}