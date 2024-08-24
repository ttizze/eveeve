import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { LogIn, LogOut, UserPen } from "lucide-react";
import { ModeToggle } from "~/components/ModeToggle";
import { Button } from "~/components/ui/button";
import type { SanitizedUser } from "~/types";
import { authenticator } from "~/utils/auth.server";
interface FooterProps {
	currentUser: SanitizedUser | null;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.clone().formData();
	const intent = formData.get("intent");

	if (intent === "logout") {
		return await authenticator.logout(request, { redirectTo: "/" });
	}

	if (intent === "SignInWithGoogle") {
		const user = await authenticator.authenticate("google", request);

		if (user) {
			if (user.userName) {
				return redirect(`/${user.userName}`);
			}
			return redirect("/welcome");
		}

		return redirect("/auth/login");
	}

	return json({ error: "Invalid intent" }, { status: 400 });
}

export function Footer({ currentUser }: FooterProps) {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-gray-200 dark:border-gray-700">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col space-y-4">
					<div className="flex flex-col space-y-4">
						<Link to="/">
							<h1 className="text-4xl font-bold">EveEve</h1>
						</Link>
						<div className="flex items-center space-x-4">
							<ModeToggle />
							{currentUser ? (
								<>
									<Link to={`/${currentUser.userName}`}>
										<Button variant="outline">
											<UserPen className="w-4 h-4 mr-2" />
											{currentUser.userName}
										</Button>
									</Link>
									<Form method="post" action="/resources/footer">
										<Button
											type="submit"
											name="intent"
											value="logout"
											variant="outline"
										>
											<LogOut className="w-4 h-4 mr-2" />
											Log out
										</Button>
									</Form>
								</>
							) : (
								<>
									<Form method="post" action="/resources/footer">
										<Button
											type="submit"
											name="intent"
											value="SignInWithGoogle"
											variant="outline"
										>
											<LogIn className="w-4 h-4 mr-2" />
											Log in
										</Button>
									</Form>
								</>
							)}
						</div>
					</div>
					<div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mt-8">
						<div className="flex space-x-4">
							<Link
								to="/privacy"
								className="hover:text-gray-900 dark:hover:text-white"
							>
								Privacy Policy
							</Link>
							<Link
								to="/terms"
								className="hover:text-gray-900 dark:hover:text-white"
							>
								Terms of Service
							</Link>
						</div>
						<p>© {currentYear} EveEve</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
