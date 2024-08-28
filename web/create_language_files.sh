#!/bin/bash

# 言語コードのリスト
languages=($(grep -oP "(?<=code: \")[^\"]*" web/app/routes/\$userName+/page+/\$slug+/constants/languages.ts))

# ベースディレクトリ
base_dir="app/public/locales"

# ベースディレクトリが存在しない場合は作成
mkdir -p "$base_dir"

# 各言語に対してファイルを作成
for lang in "${languages[@]}"; do
  lang_dir="$base_dir/$lang"
  mkdir -p "$lang_dir"
  touch "$lang_dir/common.json"
  echo "Created $lang_dir/common.json"
done

echo "完了しました。100個の言語ファイルが作成されました。"