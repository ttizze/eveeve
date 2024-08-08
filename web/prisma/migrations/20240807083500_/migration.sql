-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "slug" TEXT,

ADD COLUMN     "sourceUrl" TEXT;

UPDATE "pages" SET 
  "sourceUrl" = "url",
  "slug" = 
    LOWER(
      CONCAT(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE("url", '^https?://|www\.', ''),
                  '[^a-zA-Z0-9-]+', ''  -- 英数字とハイフン以外を削除
                ),
                '-+', '-'  -- 連続するハイフンを単一のハイフンに置換
              ),
              '^-|-$', ''  -- 先頭と末尾のハイフンを削除
            ),
            '\.html?$', ''
          ),
          '(.{1,41})(.*)', '\1'  -- 最大41文字に制限（ランダム文字列用に9文字確保）
        ),
        '-',
        SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)
      )
    );

-- slugカラムにNOT NULL制約を追加
ALTER TABLE "pages" ALTER COLUMN "slug" SET NOT NULL;

-- slugカラムにUNIQUE制約を追加
ALTER TABLE "pages" ADD CONSTRAINT "pages_slug_key" UNIQUE ("slug");

-- 古いurlカラムを削除
ALTER TABLE "pages" DROP COLUMN "url";