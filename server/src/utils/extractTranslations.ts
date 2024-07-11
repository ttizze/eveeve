export function extractTranslations(
  text: string,
): { number: number; text: string }[] {
  try {
    // まず、文字列をJSONとしてパースしてみる
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      // すでに配列の場合は、そのまま返す
      return parsed
    }
  } catch (error) {
    // JSONとしてパースできない場合は、元の正規表現ベースの処理を行う
  }

  const translations: { number: number; text: string }[] = []
  const regex =
    /{\s*"number"\s*:\s*(\d+)\s*,\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"\s*}/g
  let match: RegExpExecArray | null

  while (true) {
    match = regex.exec(text)
    if (match === null) break

    translations.push({
      number: Number.parseInt(match[1], 10),
      text: match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
    })
  }

  return translations
}
