import { Link } from "@remix-run/react";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">利用規約</h1>

				<section className="mb-8">
					<p className="mb-4">
						EveEve（以下「本サービス」）をご利用いただく前に、以下の利用規約をよくお読みください。
						本サービスを利用することで、これらの規約に同意したものとみなされます。
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">1. サービスの説明</h2>
					<p>
						本サービスは、ウェブページの内容を表示し、翻訳機能を提供するオープンソースプロジェクトです。
						ユーザーは指定したURLのコンテンツを閲覧し、翻訳することができます。
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">2. ユーザーの責任</h2>
					<ul className="list-disc pl-6">
						<li>
							ユーザーは、本サービスを利用する際に、すべての適用法令を遵守する責任があります。
						</li>
						<li>
							ユーザーは、翻訳対象のコンテンツの著作権および利用規約を遵守する責任があります。
						</li>
						<li>
							著作権法に違反する使用や、許可のない商用利用は禁止されています。
						</li>
						<li>
							ユーザーは、本サービスを通じて表示されるコンテンツの使用に関して全責任を負います。
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">3. 著作権と知的財産権</h2>
					<p>
						本サービスは、第三者のコンテンツを表示することがありますが、それらのコンテンツの著作権は
						各コンテンツの所有者に帰属します。本サービスは、これらのコンテンツに対する権利を主張しません。
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">4. 免責事項</h2>
					<ul className="list-disc pl-6">
						<li>
							本サービスは「現状有姿」で提供され、明示または黙示を問わず、いかなる種類の保証も行いません。
						</li>
						<li>
							本サービスは、表示されるコンテンツの正確性、完全性、適時性、または品質について保証しません。
						</li>
						<li>本サービスは、翻訳の正確性や品質について保証しません。</li>
						<li>
							本サービスの使用によって生じたいかなる損害についても、責任を負いません。
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						5. サービスの制限と終了
					</h2>
					<p>
						本サービスは、予告なくサービスの全部または一部を変更、停止、または終了する権利を有します。
						また、特定のユーザーのサービス利用を制限または終了する権利を有します。
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">6. 準拠法と管轄裁判所</h2>
					<p>
						本規約の解釈および適用は日本法に準拠するものとし、本サービスに関連する紛争については、
						東京地方裁判所を第一審の専属的合意管轄裁判所とします。
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">7. 規約の変更</h2>
					<p>
						本サービスは、必要に応じて本規約を変更する権利を有します。重要な変更がある場合は、
						本サービス上で通知します。変更後も本サービスを継続して利用する場合、
						変更後の規約に同意したものとみなされます。
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">同意の確認</h2>
					<p>
						本サービスを利用することで、上記の利用規約に同意したものとみなされます。
						これらの規約に同意しない場合は、本サービスの利用を中止してください。
					</p>
				</section>

				<div className="mt-8">
					<Link to="/" className="text-blue-600 hover:underline">
						ホームに戻る
					</Link>
				</div>
			</main>
		</div>
	);
}
