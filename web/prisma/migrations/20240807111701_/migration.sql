-- This is an empty migration.
UPDATE "pages" SET 
  "slug" = 
    LOWER(
      CONCAT(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  SPLIT_PART(REGEXP_REPLACE("slug", '^https?://|www\.', ''), '?', 1),
                  '[/\.]', '-', 'g'  -- すべてのスラッシュとピリオドをハイフンに置換（グローバルフラグ追加）
                ),
                '[^a-zA-Z0-9-]+', '', 'g'  -- 英数字とハイフン以外を削除（グローバルフラグ追加）
              ),
              '-+', '-', 'g'  -- 連続するハイフンを単一のハイフンに置換（グローバルフラグ追加）
            ),
            '^-|-$', ''  -- 先頭と末尾のハイフンを削除
          ),
          '(.{1,41})(.*)', '\1'  -- 最大41文字に制限（ランダム文字列用に9文字確保）
        ),
        '-',
        SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)
      )
    );