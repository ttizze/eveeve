import { Link } from "@remix-run/react";
import { Form, useSubmit } from "@remix-run/react";
import { LogIn, LogOut } from "lucide-react"; // Lucide アイコンをインポート
import { ModeToggle } from "~/components/dark-mode-toggle";
import type { SafeUser } from "../types";
import { TargetLanguageSelect } from "./TargetLanguageSelect";
import { Button } from "./ui/button";

interface HeaderProps {
	safeUser: SafeUser | null;
	targetLanguage: string;
}

export function Header({ safeUser, targetLanguage }: HeaderProps) {
	const submit = useSubmit();

	const handleTargetLanguageChange = (newTargetLanguage: string) => {
		const formData = new FormData();
		formData.append("targetLanguage", newTargetLanguage);
		submit(formData, { method: "post" });
	};

	return (
		<header className="shadow-sm mb-10">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/">
					<h1 className="text-3xl font-bold ">EveEve</h1>
				</Link>
				<Form method="post" className="flex items-center space-x-4">
					<TargetLanguageSelect
						value={targetLanguage}
						onChange={handleTargetLanguageChange}
					/>
					<nav className="flex items-center space-x-4">
						<ModeToggle />
						{safeUser ? (
							<>
								<span className="text-gray-700">Hello, {safeUser.name}!!</span>
								<Link
									to="/auth/logout"
									className="text-gray-600 hover:text-gray-800"
									title="Logout"
								>
									<LogOut className="w-6 h-6" />
								</Link>
							</>
						) : (
							<Button
								type="submit"
								name="intent"
								value="SignInWithGoogle"
								variant="outline"
								size="icon"
							>
								<LogIn className="w-5 h-5" />
							</Button>
						)}
					</nav>
				</Form>
			</div>
		</header>
	);
}
