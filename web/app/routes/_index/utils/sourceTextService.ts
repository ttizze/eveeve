import { createHash } from 'node:crypto'
import { prisma } from '../../../utils/prisma'

export async function getOrCreateSourceTextId(
  text: string,
  pageId: number,
  webPageVersionId: number,
): Promise<number> {
  const textHash = Buffer.from(
    createHash('sha256').update(text).digest('hex'),
    'hex',
  )

  try {
    const sourceText = await prisma.sourceText.upsert({
      where: {
        textHash_pageId: {
          textHash,
          pageId,
        },
      },
      update: {},
      create: {
        text,
        textHash,
        pageId,
        webPageVersionId,
      },
    })

    return sourceText.id
  } catch (error) {
    console.error('Error getting or creating source text:', error)
    throw new Error('Error getting or creating source text')
  }
}