import { type LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
	// ルートローダーを実行したい場合はここで行います
	// const rootData = await loadRootData(request);

	// 404エラーをスローします
	throw json({ message: "Not Found" }, { status: 404 });
};

export default function CatchAllRoute() {
	// このコンポーネントは通常レンダリングされません（エラーがスローされるため）
	// しかし、エラーバウンダリを使用しない場合はここでカスタム404ページをレンダリングできます
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<p>{data.message}</p>
		</div>
	);
}
