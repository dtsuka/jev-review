# jev-review

[English README](README.md)

プロジェクト全体をざっとチェックして、レビューが必要なところを見つけるツールです。

すべてのファイルを最初から細かくレビューするのではなく、まず **Jev** でスクリーニング。気になるファイルやチェックすべき観点を絞り込んでから、**Codex や Claude Code** などの詳細レビュアーに渡します。

Codex や Claude Code の **Skill として導入することもできる**ので、普段の開発フローの中で「まず Jev でチェックして、必要なところだけ詳しくレビューする」といった使い方ができます。

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

jev-review は **Codex Skill として使う方法を推奨**しています。一度セットアップすれば、Codex から Skill を呼び出すだけで、Jev によるスクリーニングから対象ファイルの詳細レビューまでを一連のワークフローとして実行できます。

### 1. CLI と Skill をインストールする

まず、このリポジトリを clone して依存関係をインストールします。

```bash
git clone https://github.com/dtsuka/jev-review.git
cd jev-review

pnpm install
cp .env.example .env
# .env を編集して TYPESAFE_API_KEY を設定

pnpm build
```

次に、`jev-review` コマンドをどのプロジェクトからでも実行できるようにし、Codex Skill をインストールします。

```bash
pnpm link --global
bash scripts/install-skill.sh
```

インストーラーは次のシンボリックリンクを作成します。

```text
~/.agents/skills/jev-review
  -> <このリポジトリのパス>/skills/jev-review
```

Skill 本体をコピーするのではなく、このリポジトリへのシンボリックリンクを作ります。そのため、jev-review を `git pull` で更新すると Skill 側にもそのまま反映されます。

新しくインストールした Skill が Codex に表示されない場合は、Codex を再起動してください。

CLI が正しくインストールされたかは、次のコマンドで単独確認できます。

```bash
jev-review --help
```

### 2. レビューしたいプロジェクトで使う

レビュー対象のリポジトリを Codex で開きます。**対象プロジェクトに jev-review をコピーする必要はありません。**

Codex で Skill を明示的に呼び出します。

```text
$jev-review このプロジェクトをレビューして
```

たとえば、次のような指示も可能です。

```text
$jev-review このリポジトリの具体的なバグとセキュリティ上の問題をレビューして
```

Skill 名を書かずに「このプロジェクトを Jev でレビューして」のように依頼した場合も、Codex が Skill の description から自動選択することがあります。ただし、**確実に jev-review のワークフローを使いたい場合は `$jev-review` を明示するのがおすすめです。**

### 3. Skill 実行時に何が起きるか

Codex は以下の流れを自動的に実行します。

```text
レビュー対象リポジトリ
        |
        v
   jev-review .
        |
        +-- .jev-review/report.json
        |
        +-- .jev-review/category-handoff.json
                        |
                        v
                 Codex 詳細レビュー
                 - 選択されたファイル全体を読む
                 - 指定カテゴリを重点的に調査
                 - 必要な依存先や周辺コードだけを追う
                 - Jev のスコアを問題の根拠にしない
                 - Jev が疑った chunk の位置は見ない
                        |
                        v
        .jev-review/category-verified-report.json
                        |
                        v
                 ユーザーへ finding を報告
```

この役割分担が jev-review の中心となる設計です。

- **Jev** — どのファイルを、どのカテゴリで重点的に調べるべきかを決める
- **Codex** — 選択されたファイル全体を読み、実際に問題が存在するかを検証して原因を説明する

Jev が高いスコアを付けたこと自体を finding の根拠にはしません。

### 4. 対象プロジェクトに生成されるファイル

Skill を実行すると、レビュー対象リポジトリに `.jev-review/` ディレクトリが作られます。

本番ワークフローで重要なのは次の3ファイルです。

- `report.json` — Jev の完全なスクリーニング結果。診断には利用できますが、詳細レビュアーはこのスコアを問題の根拠として利用しません。
- `category-handoff.json` — Jev と Codex の境界となるデータ。選択されたファイル名とレビューカテゴリだけを含みます。
- `category-verified-report.json` — Codex がファイル全体を調査した後に生成する具体的な finding。

実際のレビューでは、baseline、stability、過去の verification、実験用 evaluation などを Codex が参照しないよう Skill 側で指示しています。

### 更新方法

Skill はシンボリックリンクなので、通常はリポジトリを更新するだけです。

```bash
cd /path/to/jev-review
git pull
pnpm install
pnpm build
```

シンボリックリンクが残っていれば、`scripts/install-skill.sh` を再実行する必要はありません。

### アンインストール

Codex Skill だけを削除する場合は、シンボリックリンクを削除します。

```bash
rm ~/.agents/skills/jev-review
```

グローバルにリンクした CLI も不要な場合は、あわせて次を実行します。

```bash
pnpm unlink --global jev-review
```

Skill 自体のワークフローは `skills/jev-review/SKILL.md`、詳細レビューの出力仕様は `skills/jev-review/references/category-review.md` を参照してください。

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
