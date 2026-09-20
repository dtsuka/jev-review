# jev-review

TypeSafe AI の Jev System One モデルを利用した、プロジェクト全体のコードレビュー・トリアージツールです。すべてのファイルをそのまま詳細レビューへ渡すのではなく、Jev でスクリーニングして、Codex などの詳細レビュアーが確認すべきファイルと観点を絞り込みます。

[English README](README.md)

現在の本番ワークフローは次のとおりです。

```text
リポジトリ
  -> Jev によるスクリーニング
  -> 対象ファイル + レビューカテゴリ
  -> ファイル全体の詳細レビュー
  -> 具体的な finding
```

Jev の役割は、**どのファイルを、どの観点で重点的にレビューするかを決めること**です。最終的な原因特定は行いません。詳細レビュー側には選択されたファイル全体を読ませますが、Jev のスコアや疑わしい行番号は渡しません。これにより、スクリーニング結果へのアンカリングを抑えます。

## チェックカテゴリ

- `bug` — 実行時の誤動作や実際の不具合
- `security` — セキュリティ上の問題
- `refactor` — 複雑性・重複・結合度など、実質的なリファクタリングの必要性
- `performance` — パフォーマンスやリソース効率の問題
- `error_handling` — エラー処理・復旧処理の問題
- `type_safety` — 型安全性に関する問題

## セットアップ

Node.js 20+ と TypeSafe AI API へのアクセスが必要です。

```bash
pnpm install
cp .env.example .env
# .env に TYPESAFE_API_KEY を設定
pnpm build

# どのリポジトリからでも Codex が CLI を実行できるようにする
pnpm link --global

# 再利用可能な Codex Skill をインストール
bash scripts/install-skill.sh
```

Codex はユーザー共通 Skill を `~/.agents/skills` から検出します。インストーラーはこのリポジトリ内の Skill へのシンボリックリンクを作るため、Skill の編集内容はインストール先にもそのまま反映されます。

## CLI の使い方

```bash
# 本番用スキャン
jev-review .

# 開発モード
pnpm dev -- .

# security のみ
jev-review . --checks security

# 全カテゴリの閾値を上書き
jev-review . --threshold 0.8
```

スキャンすると以下が生成されます。

- `.jev-review/report.json` — Jev の全スコアと診断情報
- `.jev-review/runs/report-*.json` — スクリーニング結果の履歴
- `.jev-review/category-handoff.json` — 詳細レビュー用の本番入力。選択されたファイルとカテゴリのみを含む

`category-handoff.json` は CLI 実行時に自動生成されます。既存のレポートから再生成したい場合は `pnpm category-handoff <project>` も利用できます。

## Codex Skill

Skill をインストールした後は、Codex で `$jev-review` を明示的に呼び出すか、プロジェクト全体の Jev レビューを依頼して Skill の description にマッチさせます。

Skill は次の処理を行います。

1. Jev でリポジトリをスクリーニング
2. 本番用の category handoff だけを読み込む
3. 選択されたファイル全体を、指定カテゴリを重点的に詳細レビュー
4. `.jev-review/category-verified-report.json` に結果を書き出す

詳細なワークフローは `skills/jev-review/SKILL.md`、詳細レビューの契約は `skills/jev-review/references/category-review.md` を参照してください。

## なぜ「ファイル + カテゴリ」なのか

このリポジトリでは、strict chunk、chunk attention hint、blind selected files、category-only review など複数の handoff 方法を比較しています。

現在の本番方式は **file + category** です。

- Jev への入力サイズを抑えるため、内部では chunk を利用する
- 詳細レビューはその chunk に制限しない
- 詳細レビュアーには Jev のスコアや行番号ヒントを渡さない
- category だけを渡し、問題の存在を断定せずに調査方向を示す

評価用スクリプトは開発・検証専用です。実際のレビュー中に詳細レビュアーが評価結果や baseline を参照してはいけません。

## 注意点と制限

Jev はトリアージ層であり、権威的な静的解析ツールではありません。高い確率が問題の存在を証明するわけではなく、低い確率も安全性を保証しません。

現在も、たとえば以下の制限があります。

- クロスファイルの問題を見逃す可能性がある
- file-kind policy によって一部カテゴリが抑制される可能性がある
- 適切な閾値はプロジェクトによって異なる
- 詳細レビュアー側にも見逃しや分類の揺れがある

セキュリティ上重要なプロジェクトでは、言語の型チェッカー、リンター、依存関係監査、Semgrep、CodeQL などの決定論的なツールと併用してください。

## 評価・実験

現在の主な開発・評価コマンドです。

```bash
pnpm evaluate <project>
pnpm stability <project>
pnpm evaluate:handoff <project>
pnpm evaluate:attention <project>
pnpm evaluate:category <project>
```

これらはキャリブレーションや実験のためのもので、通常の Skill ワークフローでは使用しません。

## 環境変数

```text
TYPESAFE_API_KEY=...
```

CLI は現在の環境から `.env` を自動的に読み込みます。シェルですでに設定されている環境変数が優先されます。API キーをコミットしないでください。

## ライセンス

MIT
