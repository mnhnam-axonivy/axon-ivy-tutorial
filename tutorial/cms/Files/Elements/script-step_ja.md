<!-- markdownlint-disable MD051 -->
<!-- #/ で始まるリンクは、ガイドのページとウォークスルーを開きます。 -->

# Script Step

`Script` · Axon Ivy 14.0 · このガイドの主要な要素

## どんな要素で、いつ使うか

**Script Step** はプロセスデータを変更したり、後のステップのための準備をしたりします。公式リファレンスの言葉では「この要素を使うと、プロセスデータのあらゆる変換や、後のステップに備えたその他の処理の開始を行えます」。パレットの *Activity* ドロワーにあります。

計算、値のコピーや組み合わせ、コードで書く判断、ログへの出力に使います。ほかのシステムとやり取りするときは、専用の要素を使います。リファレンスの警告: 「特定の機能や技術（Web サービスの呼び出し、データベースへのクエリーなど）を使う場合は、専用のプロセス要素を使うことを強く推奨します。これらの要素はその使い方をカプセル化し、例外を内部で処理します。」

| したいこと | 使う要素 |
| --- | --- |
| データに応じてパスを選ぶ | Alternative（パート3） |
| データベースを読み書きする | Database Activity（パート7） |
| REST や Web サービスを呼び出す | REST Client Activity、Web Service Call Activity（パート7） |
| 同じ手順を複数のプロセスで使う | 呼び出し可能なサブプロセスと Call Sub（パート3） |
| 長い処理や、IvyScript にないものが必要な処理を書く | Java のクラスを作り、Script Step から呼び出す |

## 詳細

Script Step のインスクリプションには **一般** と **出力** の2つのタブがあります。

### 一般

| フィールド | 役割 |
| --- | --- |
| 名前／説明 → 表示名 | キャンバス上の名前。ステップが何をするかを書きます。「Script」ではなく「合計を計算する」のように。 |
| 名前／説明 → 説明 | ツールチップに表示されます。Markdown を使えます。 |
| 手段／ドキュメント | 要素に関係するドキュメントへの参照。 |
| タグ | 検索用の自由なキーワード。 |

### 出力

「出力」タブには、実行される順に3つの部分があります。

| 部分 | 役割 |
| --- | --- |
| **マッピング** | 出ていくデータ `out` の属性ごとに1行、「属性」「タイプ」「式」の列を持つ表。`out` の行そのものには式 `in` があり、既定では出力は入力と同じです。行に式があると、その属性に新しい値が入ります。式のない行は、属性を入ってきたときのままにします。Designer は保存するすべてのマッピングに `out` ← `in` の行を書きます。この行がないと `out` は新しい空のデータから始まり、自分の行がない属性はすべて失われます。 |
| **コード** | 行に収まらないもののための IvyScript: 条件、ループ、複数の手順。既定では空です。 |
| **権限チェックを無効化（このスクリプトステップをシステムとして実行）** | マッピングとコードを権限チェックなしで実行します。`PermissionDeniedException` がスローされることはありません。オンにしない限りオフです。 |

リファレンスの推奨: 単純な代入は出力の表で定義し、データを計算するためにより多くのスクリプトが必要な場合にコードを使います。

変数:

| 変数 | マッピング | コード | 内容 |
| --- | --- | --- | --- |
| `in` | 使える | 使える | ステップに入ってきたデータ。 |
| `out` | 使える | 使える | ステップから出ていくデータ。 |
| `ivy` | 使える | 使える | 環境: `ivy.log`、`ivy.cms` など。 |
| ローカル変数 | | 使える | コードの中で宣言するもの。例: `Number price = 8;`。コードの実行中だけ存在します。 |

### 実行時

1. データが `in` として入ってきます。
2. **マッピングが上から1行ずつ実行されます。** 最初の行 `out` ← `in` によって、`out` は `in` と同じデータになります。下の行はそれを変えていくので、`in.a` や `out.a` を読む行には、上の行が設定した値がもう見えます。最初の行がないと `out` は空から始まり、`in` は入ってきたときの値のままです。
3. マッピングの後に **コードが実行されます**: 「入力したコードは、出力タブの実行の *後* に実行されます。」したがって、コードが設定した値はマッピングの値を置き換え、マッピングからはコードが設定する値は見えません。
4. `out` ← `in` の行があるとき、またはマッピングがないとき、コードの中では `in` と `out` は同じデータです。エンジンはコードを `out = in;` の後に続けて実行します。`in.x` に書いた値もステップから出ていきます。それでも `out` に書いてください。意図がはっきりします。
5. `out` がステップから出ていきます。ローカル変数はなくなります。
6. マッピングかコードが失敗すると、リクエストはエラー `ivy:error:script` で終わります。ランタイムログには `Problem while processing request '…'` とその原因が出て、プロセスを開始した人にはエラーページが表示されます。ステップに付けた Error Boundary Event でこのエラーを捕まえられます（パート3）。

新しいケースの初期値: 「String は空の String に、Number は 0 に、List は空の List に初期化されます」（IvyScript リファレンス）。Boolean は `false` から始まります。String が `null` になることはありません。

2、4、6 と Boolean の初期値はドキュメントに記載がありません。Designer のエンジン 14.0.1 で確認したものです（最後の注を参照）。

## IvyScript は Java ではない

コードは IvyScript です。Java に似ていて Java のクラスを呼び出せますが、別の言語です。Axon Ivy チームはフォーラムで、IvyScript は単純なマッピングや20行程度までの短いコードに使い、複雑な処理は Java に書くよう勧め、IvyScript を今後拡張する予定はないと述べています。

### IvyScript にないもの

どの行も Designer for VS Code 14.0.1 の Script Step に入力し、「問題」ビューのメッセージを確認したものです。このような行のあるプロセスも開始はでき、そのステップに達したところで失敗します。

| Java | Designer の報告 | 代わりに書くもの |
| --- | --- | --- |
| `switch (x) { case "a": … }`、switch 式、`yield` | `Unexpected token: '{'` | `if (x == "a") { … } else if (…) { … } else { … }` |
| `list.forEach(n -> …)`、ラムダ式を使うストリーム | `Unexpected token: '>'` | `for (String n : list) { … }`、または Java のクラス |
| `return;` | `Variable 'return' cannot be resolved` | `else`、またはステップの前の Alternative |
| `throw new …(…);` | `Unexpected token: 'new'` | `import ch.ivyteam.ivy.bpm.error.BpmError;` の後に `BpmError.create("my:error").throwError();` |
| catch の中の `throw e;` | `Class throw not found` | 同じく `BpmError` |
| `catch (A \| B e)` | `Unexpected token: '\|'` | catch ブロックを2つ |
| `new ArrayList<String>()` | `Class ArrayList<String> not found` | `new List<String>()`、`["a", "b"]`、または先に `import java.util.ArrayList;` |
| `new ArrayList<>()` | `Unexpected token: '<>'` | 型を省略せずに: `new java.util.ArrayList<String>()` |
| `Map<String, String> m` | `Unexpected token: ','` | 型引数のない `java.util.Map` |
| `(String) value` | `Unexpected token: identifier 'value'` | `value as String` |
| `var x = …;` | `Class var not found` | 型を書く: `String x = …;` |
| `final String x = …;` | `Unexpected token: identifier 'x'` | `final` を取る |
| `String[] a = …;` | `Unexpected token: '['` | `List<String>` |
| `5L` | `Unexpected token: identifier 'L'` | `5` |
| 単一引用符の `'text'` | `Unexpected token: Illegal Time, Date, DateTime or Duration constant ''text''` | 二重引用符。単一引用符は `'2026-12-01'` のような日付用 |
| `import java.util.Date;` | `The import java.util.Date collides with Date` | Ivy の `Date`。`java.util.Date` は完全な名前で |
| かっこのない `text.length`、`list.size` | `Field length not found for class String` | `text.length()`、`list.size()` |
| `if (in.text)`、`if (in.count)` | `An expression of type BOOLEAN is expected, but the type is String` | `!in.text.isEmpty()` のような比較 |
| `out.cost + " CHF"` | `Method +(String) for class Number of classloader null not found` | テキストから始める: `"Cost " + out.cost + " CHF"` |
| `;` のない文 | `A statement is expected, not an expression (maybe missing semicolon)`、または次の行の `Unexpected token: …` | `;` |

### 使えるが、Java とは違うもの

| 書いたもの | IvyScript の結果 | Java の結果 |
| --- | --- | --- |
| `in.text == null` | 常に `false`。String の属性は `""` から始まり、`in.text = null` としても `""` のまま | null の String なら `true` |
| `String s = null;` の後の `s == null` | `false`。ローカルの String も null にならない | `true` |
| データクラスの属性の `in.order == null` | `false`。オブジェクトは使った瞬間に作られる | `true` |
| `in.#order == null` | 何も作っていない間は `true`。`.#` は作らずに読む | — |
| `in.text is initialized`（String、Number、Boolean、Date） | 値が一度でも代入されたかどうか。新しいケースでは `false`、`0` や `false` でも代入の後は `true` | — |
| `"Hello" == "Hel" + "lo"` | `true`。`==` はテキストを比べる | `false`（別のオブジェクト） |
| `7 / 2` | `3.5`。Integer の変数でも同じ | `3` |
| `0.1 + 0.2` | ちょうど `0.3` | `0.30000000000000004` |
| Integer の `count` に `in.count = 7 / 2` | 何も言わずに `3` | コンパイルできない |
| `if (in.flag = true)` | 代入され、true になる。警告はない | boolean なら同じ |
| `"Total " + in.amount + 1` | `"Total 01"`。左から順につながる | 同じ |

### Java と同じように使えるもの

`if`/`else if`/`else`、`for (Number i = 0; i < 3; i++)` と `for (int i …)`、`for (String n : list)`、`while`、`break`、`continue`、`x++`、`x += 2`、`cond ? a : b`、`instanceof`、`catch (Exception e)` や `catch (NumberFormatException e)`、複数の catch ブロック、`finally` を持つ `try`、`in.text.toUpperCase()` や `String.format(…)` のような Java のメソッド、完全な名前か `import` の後の Java のクラス。

`try`/`catch` は Java の例外、IvyScript 自身のエラー（キャストの失敗など）、`BpmError.create(…).throwError()` でスローした BPM エラーを捕まえます。

## よくある質問

**マッピングとコード、どちらを使う？**
単純な代入はマッピングの表に書きます。どの属性にどの値が入るのか一目でわかり、Designer が行ごとにチェックします。条件、ループ、複数の手順があるものにはコードを使います。

**マッピングとコードはどの順で実行される？**
先にマッピングが1行ずつ、次にコードです。[ウォークスルー 3.3](#/walkthrough/3.3) で、それぞれの後のデータを確認できます。

**`== null` のチェックが true にならないのはなぜ？**
IvyScript の String は `null` にならないからです。代わりに `in.note.isEmpty()` で確認します。データクラスのオブジェクトは使った瞬間に作られるので、`in.#order == null` で確認します。`.#` はオブジェクトを作らずに属性を読みます。

**try/catch は使える？**
はい。`try { … } catch (Exception e) { … } finally { … }` は使え、特定の例外の型や複数の catch ブロックも使えます。ないのは `throw` です。プロセスが捕まえられるエラーを起こすには、`import ch.ivyteam.ivy.bpm.error.BpmError;` の後に `BpmError.create("my:error").throwError();` と書きます。

**ジェネリクス、リスト、マップは使える？**
ジェネリクスはリストだけです: `List<String> names = ["a", "b"];` または `new List<String>()`。`java.util.ArrayList` は完全な名前か import で使えますが、`<>` は使えません。2つの型引数を持つマップは解析できないので、型引数なしの `java.util.Map` を使います。List 型の属性に Java のリストを代入すると、Ivy の List になります。

**コードを途中で終えるには？**
`return` はありません。残りを `else` に入れるか、もっと良いのは、ステップの前の Alternative で別のパスを選ぶことです。

**Java を呼び出せる？**
はい。`in.country.toUpperCase()` のように Java オブジェクトのメソッドをそのまま使え、自分の Java クラスも完全な名前で、または `import` 行の後に使えます。長いものは Java のクラスに書いてステップから呼び出します。Java には IvyScript にないものがすべてあり、デバッグもできます。

**`ivy.log` が書いたものはどこで見られる？**
Designer のランタイムログです。「出力」ビューのチャネル Axon Ivy Runtime Log で、コマンド **Axon Ivy ランタイムログを開く** で開きます。各行には時刻、レベル、プロジェクト、カテゴリー（`ivy.log` では `USER`）、要素、メッセージが表示されます。`ivy.log` には `debug`、`info`、`warn`、`error` のレベルがあります。値をログに出すのが、ステップの動きを確認するいちばん早い方法です。

**権限チェックの無効化は何をし、いつ必要？**
マッピングとコードが権限チェックなしにシステムとして実行されます。ユーザー自身にはできないことをステップで行う必要があり、かつ権限のないユーザーがそのステップに到達しないと確信できるときだけ使います。リファレンスは「この機能は注意して使ってください」と書いています。

## よくある間違い

### 引用符のないテキスト

- *症状:* Designer が行に印を付ける: `Output 'out.status': Variable 'calculated' cannot be resolved`。それでも実行すると、そのステップでリクエストが `ivy:error:script` で失敗する。
- *原因:* 引用符がないと、その語は変数、属性、またはクラスの名前として読まれる。
- *直し方:* テキストは二重引用符で囲む: `"calculated"`。[ウォークスルー 3.1](#/walkthrough/3.1)

### 引用符で囲んだ数値、テキストの場所に数値

- *症状:* `Output 'out.total': Cannot cast object of type String to type Number`、またはコードで `Cannot cast object of type Integer to type String`。
- *原因:* `"37.5"` はテキストで、`total` は Number。`5` は数値で、`status` は String。
- *直し方:* 数値は引用符なし、テキストは引用符付き。CHF の料金のように単位のある値は数値のまま持ち、単位は値を表示するところでだけ付ける。[ウォークスルー 3.1](#/walkthrough/3.1)

### 属性名のつづり間違い

- *症状:* `Output code: Field weigth not found for class tutorial.part3.ScriptCodeData`。
- *原因:* 名前がデータクラスと一致していない。大文字と小文字も区別される。
- *直し方:* フィールドやコードで Ctrl+Space を押し、一覧から属性を選ぶ。

### Java の switch

- *症状:* `Output code: Unexpected token: '{'`。
- *原因:* IvyScript には `switch` も、switch 式や `yield` もない。
- *直し方:* `if` と `else if`。テキストは `==` で比べる。IvyScript ではテキストそのものを比べる。[ウォークスルー 3.2](#/walkthrough/3.2)

### Java のリストやマップ

- *症状:* `Class ArrayList<String> not found`、`Unexpected token: '<>'`、型付きのマップでは `Unexpected token: ','`。
- *原因:* IvyScript が知っているのは自分の `List` と `java.lang` のクラスで、ジェネリクスはリストのものしか理解しない。
- *直し方:* `List<String> labels = new List<String>();` または `["fragile"]`。ArrayList なら先に `import java.util.ArrayList;`。マップは型引数なしで。[ウォークスルー 3.2](#/walkthrough/3.2)

### ラムダ式やストリーム

- *症状:* `Output code: Unexpected token: '>'`。
- *原因:* IvyScript にはラムダ式がない。
- *直し方:* `for (String l : labels) { … }`、または処理を行う Java のクラス。[ウォークスルー 3.2](#/walkthrough/3.2)

### コードを抜けるための return や throw

- *症状:* `Variable 'return' cannot be resolved`。`throw new …` では `Unexpected token: 'new'`。`return` のあるプロセスは、その前の行を実行し、`return` に達したところで `ivy:error:script` で失敗する。
- *原因:* どちらも IvyScript にはない。
- *直し方:* 残りは `else` に入れるか、ステップの前に Alternative を置く。エラーを起こすには `BpmError.create("my:error").throwError();`。[ウォークスルー 3.2](#/walkthrough/3.2)

### Java のキャスト

- *症状:* `(String) value` で `Unexpected token: identifier 'value'`。
- *原因:* IvyScript のキャストは `as`。
- *直し方:* `value as String`。

### テキストの前に数値

- *症状:* `Output code: Method +(String) for class Number of classloader null not found`。例えば `ivy.log.info(out.cost + " CHF")` で。
- *原因:* + の左が Number だと、テキストを受け取る Number のメソッドが必要だが、それはない。左がテキストなら + はつなげる。
- *直し方:* テキストから始める: `"Cost " + out.cost + " CHF"`。[ウォークスルー 3.2](#/walkthrough/3.2)

### コードの値を必要とするマッピング

- *症状:* マッピングで作った値に、コードが設定する部分が欠けている。例えば "Customer level: gold" ではなく "Customer level: standard" になる。マッピングに見えたのは、上の行が設定した値だけです。
- *原因:* マッピングはコードより先に実行される。
- *直し方:* その値はコードの中で、依存する行より下に、`out` から作る。[ウォークスルー 3.3](#/walkthrough/3.3)

### マッピングの最初の行が空

- *症状:* ステップの後、値があった属性が空か 0 になっている。設定されているのは自分の行がある属性だけ。Designer は何も報告しない。
- *原因:* `out` の行に式がない。`out` が、入ってきたデータではなく新しい空のデータから始まる。この行なしで手で書いたファイルも同じ（エンジン 14.0.1）。
- *直し方:* `out` の行にもう一度式 `in` を入れる。Designer は新しいマッピングにはすべてそうしています。

### テキストを `== null` で確認する

- *症状:* テキストがないことを確認するチェックが、一度も反応しない。
- *原因:* IvyScript の String は `null` にならない。
- *直し方:* `in.customer.isEmpty()`。[ウォークスルー 3.3](#/walkthrough/3.3)

### Integer の属性に小数

- *症状:* `3.5` が `3` として保存される。メッセージはない。
- *原因:* Integer の属性は、与えられた値の整数部分だけを持つ。
- *直し方:* 金額や小数のあるものには `Number` を使う。

### 条件で `==` の代わりに `=`

- *症状:* 条件が常に true になり、属性が変わっている。
- *原因:* `if (in.flag = true)` は代入し、Designer は警告しない。
- *直し方:* `if (in.flag)`、または `==`。

### Script Step からほかのシステムを呼び出す

- *症状:* 呼び出しのエラーを扱いにくく、プロセスがエラーに反応できない。
- *原因:* 専用の要素は接続、エラー、設定を引き受けてくれるが、Script Step のコードはそうではない。
- *直し方:* Database、REST Client、Web Service Call の Activity を使う（パート7）。

### ステップを守らずに権限チェックを無効化する

- *症状:* 正しいロールを持たないユーザーが、本来得られない結果を得る。
- *原因:* オプションがオンだと、ステップの中では何も権限をチェックしない。
- *直し方:* オフにするか、権限のあるユーザーだけがステップに到達するようにプロセスを作る。

## ウォークスルー

- [2.4 最初の Script Step: 実行してログを読む](#/walkthrough/2.4): マッピングの1行、ログの1行、各ステップのデータ、ログにしか現れない2つの間違い。
- [3.1 値のマッピング](#/walkthrough/3.1): マッピングの表、`in` を使った式、変わらずに残るもの、2つの間違い。
- [3.2 コードを書く](#/walkthrough/3.2): ローカル変数、条件、Java の呼び出し、ログへの出力、IvyScript にはない Java の書き方5つ。
- [3.3 マッピングが先、コードが後](#/walkthrough/3.3): 実行順序、権限チェックの無効化、2つの間違い。

## 関連項目

- [Start](#/part/2/start): `param` を使う、同じマッピングの表とコード。
- [Alternative](#/part/3/alternative): パスを選ぶ条件。
- 公式リファレンス（英語）: [Script Step](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/script-step.html) · [IvyScript language](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/language.html) · [IvyScript reference](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/reference.html) · [Java integration](https://developer.axonivy.com/doc/14.0/en/reference/process/ivyscript/java-integration.html) · [Error handling](https://developer.axonivy.com/doc/14.0/en/reference/process/error-handling.html)
- フォーラム（英語）: [switch](https://answers.axonivy.com/questions/390/switch-case-statement-in-ivyscript.html) · [generics](https://answers.axonivy.com/questions/878/error-on-creating-a-typed-map-in-ivyscript-ivyscript-and-generics.html) · [lambdas and streams](https://answers.axonivy.com/questions/1902/ivyscript-support-for-streams-and-lambda-expressions.html) · [casting](https://answers.axonivy.com/questions/341/casting-in-ivyscript.html) · [java.util.Date](https://answers.axonivy.com/questions/2489/i-can-t-import-java-util-date-in-script-step-why.html)

*ラベルとエラーメッセージは Designer for VS Code 14.0.1 の表示どおりです。実行時の動作は、上の表の1行ごとにテスト用のプロセスを作り、2026-11-16 にそのエンジン 14.0.1 で確認したものです。*
