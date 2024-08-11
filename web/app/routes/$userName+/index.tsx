import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getUserWithPages } from "./functions/queries.server";
import { authenticator } from "~/utils/auth.server";
import type { UserWithPages } from "./types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { userName } = params;
  if (!userName) throw new Error("Username is required");

  const userWithPages = await getUserWithPages(userName);
  if (!userWithPages) throw new Response("Not Found", { status: 404 });

  const currentUser = await authenticator.isAuthenticated(request);

  const isOwnProfile = currentUser?.id === userWithPages.id;

  return { userWithPages: userWithPages, isOwnProfile };
};

export default function UserProfile() {
  const { userWithPages, isOwnProfile } = useLoaderData<{ userWithPages: UserWithPages; isOwnProfile: boolean }>();

  return (
    <div className="container mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{userWithPages.displayName}'s Profile</h1>
        {isOwnProfile && (
          <Button variant="outline">Edit Profile</Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userWithPages.pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle>{page.title}</CardTitle>
              <CardDescription>{new Date(page.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{page.content.slice(0, 100)}...</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {userWithPages.pages.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          {isOwnProfile ? "You haven't created any pages yet." : "No pages yet."}
        </p>
      )}
    </div>
  );
}