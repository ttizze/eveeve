import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { LogIn, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import type { SafeUser } from "~/types";
import { json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import type { ActionFunctionArgs } from "@remix-run/node";

interface FooterProps {
  safeUser: SafeUser | null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.clone().formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return await authenticator.logout(request, { redirectTo: "/" });
  }

  if (intent === "SignInWithGoogle") {
    return authenticator.authenticate("google", request, {
      successRedirect: "/translator",
      failureRedirect: "/faile",
    });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export function Footer({ safeUser }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { resolvedTheme } = useTheme();

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <img
                src={`/title-logo-${resolvedTheme || "light"}.png`}
                alt="::COMPANY_NAME::"
                className="w-32"
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white">
              プライバシーポリシー
            </Link>
            <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white">
              利用規約
            </Link>
            <p>© {currentYear} EveEve</p>
          </div>

          <div>
            {safeUser ? (
              <Form method="post" action="/resources/footer">
                <Button
                  type="submit"
                  name="intent"
                  value="logout"
                  variant="outline"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </Form>
            ) : (
              <Form method="post" action="/resources/footer">
                <Button
                  type="submit"
                  name="intent"
                  value="SignInWithGoogle"
                  variant="outline"
                >
                  <LogIn className="w-4 h-4" />
                </Button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}