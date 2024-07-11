import { describe, expect, it } from 'vitest'
import { extractTranslations } from './extractTranslations'

describe('extractTranslations', () => {
  it('should extract translations correctly', () => {
    const inputText = `{"number": 185, "text": "使用人\n私たちの家へ"}, {"number": 186, "text": "ロミオ\n誰の家だ？"}, {"number": 187, "text": "使用人\n私の主人の家です"}, {"number": 188, "text": "ロミオ\n確かに、先にそれを聞くべきだった"}, {"number": 189, "text": "使用人\nでは、聞かなくても教えてあげましょう。私の主人は大金持ちのキャピュレットです。もしあなたがモンタギュー家の人でなければ、一杯のワインを飲みに来てください。ご機嫌よう"}, {"number": 190, "text": "[退場]"}, {"number": 191, "text": "ベンヴォーリオ\nキャピュレットのこの昔からの宴で\nお前があんなに愛している美しいロザラインが食事をする\nヴェローナの賞賛される美女たち全員とともに\nそこへ行って、偏見のない目で\n彼女の顔を私がお前に見せる誰かと比べてみろ\nそうすれば、お前の白鳥がカラスに見えるようにしてやる"}, {"number": 192, "text": "ロミオ\n私の目の敬虔な宗教が\nそのような偽りを主張するなら、涙を火に変えろ\nそして、何度も溺れても死ぬことのない\n透明な異端者たち、嘘つきとして焼かれろ\n私の愛する人より美しい人がいるのか？すべてを見通す太陽は\n世界が始まって以来、彼女に匹敵する者を見たことがない"}, {"number": 193, "text": "ベンヴォーリオ\nばか、お前は彼女を美しく見た、他に誰もいなかったから\n彼女自身は両目で自分自身と釣り合っている\nしかし、その水晶の天秤で計量してみろ\nお前の愛する女性を\n私がこの宴でお前に見せる他の女性と比べて\nそうすれば、今一番美しく見える彼女も、ほとんど美しく見えなくなるだろう"}, {"number": 194, "text": "ロミオ\n一緒に行く、そんな光景を見せるためじゃない\nただ俺自身の輝きの中で喜ぶためだ"}, {"number": 195, "text": "[退場]"}, {"number": 196, "text": "第三場　キャピュレットの家の一室"}, {"number": 197, "text": "レディ・キャピュレットと乳母登場"}, {"number": 198, "text": "レディ・キャピュレット\n乳母、娘はどこ？私のところへ呼びなさい"}, {"number": 199, "text": "乳母\nさあ、私の処女時代に誓って、12歳の時\n彼女に来るように言ったのよ。何てこと、子羊ちゃん！何ててんとう虫ちゃん！\nとんでもない！この子はどこ？何てこと、ジュリエッ`
    const input = ` " [\n  {\n    \"number\": 1,\n    \"text\": \"ロミオとジュリエット\"\n  },\n  {\n    \"number\": 2,\n    \"text\": \"ウィリアム・シェイクスピア\"\n  },\n  {\n    \"number\": 3,\n    \"text\": \"目次\"\n  },\n  {\n    \"number\": 4,\n    \"text\": \"プロローグ\"\n  },\n  {\n    \"number\": 5,\n    \"text\": \"第一幕\"\n  },\n  {\n    \"number\": 6,\n    \"text\": \"第一場　公共の場\"\n  },\n  {\n    \"number\": 7,\n    \"text\": \"第二場　通り\"\n  },\n  {\n    \"number\": 8,\n    \"text\": \"第三場　キャピュレットの家の中\"\n  },\n  {\n    \"number\": 9,\n    \"text\": \"第四場　通り\"\n  },\n  {\n `
    const expectedOutput = [
      { number: 185, text: '使用人\n私たちの家へ' },
      { number: 186, text: 'ロミオ\n誰の家だ？' },
      { number: 187, text: '使用人\n私の主人の家です' },
      { number: 188, text: 'ロミオ\n確かに、先にそれを聞くべきだった' },
      {
        number: 189,
        text: '使用人\nでは、聞かなくても教えてあげましょう。私の主人は大金持ちのキャピュレットです。もしあなたがモンタギュー家の人でなければ、一杯のワインを飲みに来てください。ご機嫌よう',
      },
      { number: 190, text: '[退場]' },
    ]

    const result = extractTranslations(input)
    expect(result).toEqual(expect.arrayContaining(expectedOutput))
  })

  it('should handle empty input', () => {
    const inputText = ''
    const expectedOutput: { number: number; text: string }[] = []
    const result = extractTranslations(inputText)
    expect(result).toEqual(expectedOutput)
  })

  it('should handle input with no matches', () => {
    const inputText = 'This is a test string with no matches.'
    const expectedOutput: { number: number; text: string }[] = []
    const result = extractTranslations(inputText)
    expect(result).toEqual(expectedOutput)
  })
})
