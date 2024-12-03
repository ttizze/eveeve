import { type LoaderFunctionArgs, json } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
	// ルートローダーを実行したい場合はここで行います
	// const rootData = await loadRootData(request);

	// 404エラーをスローします
	throw json({ message: "Not Found" }, { status: 404 });
}

export default function CatchAllRoute() {
	return (
		<div>
			<p>Not Found</p>
		</div>
	);
}
