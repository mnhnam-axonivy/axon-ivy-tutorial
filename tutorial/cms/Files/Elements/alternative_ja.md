<!-- markdownlint-disable MD051 -->
<!-- #/ で始まるリンクは、ガイドのページとウォークスルーを開きます。 -->

# Alternative

`Alternative` · Axon Ivy 14.0

## どんな要素で、いつ使うか

公式リファレンスの言葉では:「Alternative は、出口の条件の評価に応じて、プロセスの流れを要素の出口の1つにつなぐスイッチです。」プロセスの *if – else if – else* であり、「プロセスの流れの中でループを作る」ためにも使います。キャンバスでは × の付いたひし形です。

Alternative には1つ以上の入口と複数の出口があり、トークンをそのうちのちょうど1つに送ります。プロセスデータを読みますが、変えません。

| したいこと | 使う要素 |
| --- | --- |
| データに応じて、いくつかのパスから1つを選ぶ | Alternative |
| 何かが true になるまでステップを繰り返す | 戻る出口のある Alternative |
| 分かれたパスを再び合流させる | 出口が1つの Alternative、または両方のパスを同じ要素につなぐ |
| 複数のパスを同時に実行する | Split と Join |
| 人に決めてもらう | Alternative の前に User Task か User Dialog（パート5、6） |

## 詳細

Alternative のインスクリプションには、**一般** と **条件** の2つのタブがあります。

### 一般

表示名、説明、手段／ドキュメント、タグです。ほかの要素と同じです。Alternative が問う問いに名前を付け（「More than 500?」）、コネクターには答えの名前を付けます（「yes」「no」）。どちらもキャンバスに表示されます。

### 条件

出口ごとに1行あり、条件が試される順に並びます。

| 列 | 役割 |
| --- | --- |
| タイプ | 出口の行き先。`<要素の名前>: <そのタイプ>` の形、例えば `Ask the manager: Script`。 |
| 式 | 条件。true か false になる IvyScript の式です。空の式は常に true です。 |

行は上下に移動できます。行の順序が問いの順序です。新しい Alternative では、すべての出口が空の条件で並びます。プロセスファイルでは、条件は `config.conditions` に、コネクターの ID とその条件の組として、表の順序で保存されます。

条件の中の変数:

| 変数 | 内容 |
| --- | --- |
| `in` | プロセスデータ。 |
| `ivy` | 環境: `ivy.log`、`ivy.cms`、… |
| `out` | **使えません。** Designer は `Condition #1: Variable 'out' cannot be resolved` と報告します。 |

### 実行時

1. 「条件は上から下へ評価され、最初に *true* と評価された条件の出口が選ばれます。」その下の行はまったく試されません。
2. 空の条件は true です。そのため、空の最後の行が *else* になり、上の行が選ばなかったものをすべて引き受けます。
3. どの条件も true でないと、リクエストは失敗します。ランタイムログには `Problem while processing request '…'` と、原因として `java.lang.IllegalStateException: In the alternative all conditions evaluate to false` が出ます。Designer は何も警告しません。
4. 失敗する条件、例えば count が 0 のときの `1 / in.count > 0` も、リクエストを失敗させます。
5. Boolean ではなくテキストの条件は、Engine では入っていてもいなくても true になりません。Designer は `Condition #1: Cannot cast object of type String to type Boolean` と報告します。
6. `=` が1つの `in.flag = true` は代入です。`flag` を設定し、true になります。Designer は何も報告しません。
7. ループを止めるものはありません。Alternative を通って戻るループは、Engine で 10 000 周実行されました。

2〜7 はドキュメントに記載がありません。2026-11-16 に Designer とそのエンジン 14.0.1 で確認したものです。プロセスファイルの `config.conditions` に載っていない出口（手で書いたファイル）は、載っている出口の後に、空の条件のように試されます。

## よくある質問

**「それ以外」のパスを作るには？**
最後の行の条件を空にします。常に true なので、上の行が選ばなかったケースをすべて引き受けます。

**条件はどの順に試される？**
「条件」タブの上から下へ。最初に true になったものが決めます。2つの条件が両方 true になりうるときは、狭い方を先にします。「30 kg を超える」を「2 kg を超える」より前に。

**条件でデータを変えられる？**
うっかり変えてしまうことがあります。`in.flag = true` は代入です。データは Alternative の前の Script Step で変え、条件は比較と Boolean だけにします。

**2つのパスを再び合流させるには？**
両方を同じ要素につなぐか、出口が1つで条件が空の Alternative につなぎます。後者なら合流点も見えます。Join は使いません。Join は入ってくるすべてのパスを待ちますが、分かれたパスからは1つしか来ません。

**ループを作るには？**
出口を Alternative より前の要素に戻します。条件が読むものが1周ごとに変わること、そして最後には必ずどれかの出口が選ばれること（例えば最大の周回数）を確かめます。

**リクエストが "In the alternative all conditions evaluate to false" で失敗するのはなぜ？**
このデータでは、どの条件も true になりませんでした。多くの場合、空であるべき最後の行に条件があるか、条件が確かめる値が届いていません（送られなかったパラメーターは 0 か空です）。

## よくある間違い

### どの条件も true にならない

- *症状:* リクエストが失敗する: `Problem while processing request '…'`、原因は `IllegalStateException: In the alternative all conditions evaluate to false`。
- *原因:* すべての行に条件があり、このデータに合うものがない。
- *直し方:* 最後の行を空にする。値がないときは別のパスで扱う。[ウォークスルー 3.5](#/walkthrough/3.5)

### 広い条件が先

- *症状:* あるケースが常に同じ出口に進み、ある出口が決して選ばれない。
- *原因:* より多くのケースで true になる条件が、狭い条件の上にある。「2 kg を超える」が「30 kg を超える」の上にある。
- *直し方:* 狭い条件を上に移すか、各条件をそれだけで正確にする: `in.weight > 2 && in.weight <= 30`。[ウォークスルー 3.5](#/walkthrough/3.5)

### 条件の代わりにテキスト

- *症状:* Designer が `Condition #1: Cannot cast object of type String to type Boolean` と報告する。実行時には、その出口は決して選ばれない。
- *原因:* 条件が `in.employee` のようなテキストの属性になっている。
- *直し方:* 比較する: `in.employee == "Anna"`、`!in.employee.isEmpty()`。[ウォークスルー 3.4](#/walkthrough/3.4)

### `==` の代わりに `=`

- *症状:* すべてのケースがこの出口に進み、Boolean の属性が急に true になっている。Designer は何も報告しない。
- *原因:* `in.urgent = true` は true を代入し、true になる。
- *直し方:* `in.urgent == true`、または単に `in.urgent`。[ウォークスルー 3.4](#/walkthrough/3.4)

### 条件に `out`

- *症状:* Designer が `Condition #1: Variable 'out' cannot be resolved` と報告する。実行時にはリクエストが失敗する。
- *原因:* Alternative には自分の出ていくデータがなく、`in` だけがある。
- *直し方:* `in` を読む。[ウォークスルー 3.5](#/walkthrough/3.5)

### 終わらないループ

- *症状:* 同じステップが何度も実行され、リクエストが終わらない。
- *原因:* ループの中で、条件が読むものが何も変わらないか、必ず来る出口がない。
- *直し方:* 1周ごとにカウンターや状態を変え、最大回数で終わる出口を用意する。[ウォークスルー 3.6](#/walkthrough/3.6)

### Alternative の代わりに Join

- *症状:* 分かれた2つのパスが出会った後、何も実行されず、ランタイムログにエラーもない。
- *原因:* Join は入ってくるすべてのコネクターでトークンを待つが、分かれたパスからは1つしか来ない。
- *直し方:* 分かれたパスは Alternative で合流させるか、同じ要素につなぐ。[ウォークスルー 3.6](#/walkthrough/3.6)

## ウォークスルー

- [3.4 2つのパス、1つの条件](#/walkthrough/3.4): 「条件」タブ、else としての空の条件、2回の実行、2つの間違い（条件にテキスト、`==` の代わりに `=`）。
- [3.5 複数の条件](#/walkthrough/3.5): 条件の順序、空の最後の行、3つの間違い（広い条件が先、どの行も true にならない、条件に `out`）。
- [3.6 合流とループ](#/walkthrough/3.6): ループ、2つの出口、再び出会うパス、2つの間違い（終わらないループ、Alternative の代わりに Join）。

## 関連項目

- [Split と Join](#/part/3/split-join): 複数のパスを同時に。
- [Script Step](#/part/3/script-step): 条件が読むデータを準備する場所。
- 公式リファレンス（英語）: [Alternative](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/alternative.html) · [IvyScript language](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/language.html)

*ラベルとエラーメッセージは Designer for VS Code 14.0.1 の表示どおりです。実行時の動作はそのエンジン 14.0.1 で確認したものです。*
