// import type { LoaderFunctionArgs } from "@remix-run/node";
// import { Outlet } from "@remix-run/react";
// import { useTypedLoaderData } from "remix-typedjson";
// import { Header } from "~/components/Header";
// import { authenticator } from "~/utils/auth.server";
// export async function loader({ request }: LoaderFunctionArgs) {
// 	const safeUser = await authenticator.isAuthenticated(request);
// 	return { safeUser };
// }

// export default function PageLayout() {
// 	const { safeUser } = useTypedLoaderData<typeof loader>();
// 	return (
// 		<div>
// 			<Header safeUser={safeUser} />
// 			<Outlet />
// 		</div>
// 	);
// }
