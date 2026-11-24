<!-- markdownlint-disable MD051 -->
<!-- #/ で始まるリンクは、ガイドのページとウォークスルーを開きます。 -->

# エラー処理

`ErrorEnd` · `ErrorBoundaryEvent` · `ErrorStartEvent` · Axon Ivy 14.0

## どんな要素で、いつ使うか

「プロセス要素の実行は、エラーで中断されることがあります。」そのようなエラーをスローし、キャッチする要素が3つあります:

- **Error End**:「エラーをスローして、プロセスの正常なパスから外れるために使えます（例えば承認が却下されたとき）。以前にキャッチしたエラーを再スローするためにも使えます。」
- **Error Boundary Event**:「コンテキストメニューを使って、任意のアクティビティに付けられます。」アクティビティがエラーで終わると、「実行はこの Error Boundary Event 要素に向けられ、そこから続きます。」
- **Error Start**: 入ってくるコネクターのない開始です:「実行は、起きたエラーを処理する Error Start Event で続けられます。」

「Error Boundary Event や Error Start Event は、そのエラーコードのパターンがエラーコードに合うとき、エラーをキャッチします。エラーコードが空の Error Boundary Event や Error Start Event は、すべてのエラーをキャッチします。」

| したいこと | 使う要素 |
| --- | --- |
| 呼び出し元が処理できるエラーでプロセスを終える | 呼び出し可能なサブプロセスかボックスの中の Error End |
| コードからエラーをスローする | Script Step で `BpmError.create("…").throwError();` |
| 1つのアクティビティのエラーを処理する | そのアクティビティの Error Boundary Event |
| プロセスの1つのレベル全体のエラーを処理する | Error Start |

## 詳細

### エラーコード

「エラーコードは文字列で定義します。コロン（:）を挟んで細かくできます。」「ワイルドカード（\*）を使うと、複数のサブエラーコードをキャッチできます。」「末尾のワイルドカードは省略できるので、`custom:error` は `custom:error:*` と同じです。」`booking:failed` としてスローされたエラーは、`booking:failed`、`booking`、`*:failed` でキャッチされ、`payment` ではキャッチされません。システムのエラーのコードは `ivy` で始まります。失敗したスクリプトは `ivy:error:script` をスローし、「エラーオブジェクトでは、原因となった Java の例外が技術的な原因として使えます。」

### Error End

**一般** と **エラー** の2つのタブがあります。

| セクション | フィールド | 役割 |
| --- | --- | --- |
| エラー | スローするエラーコード | スローするエラーのコード。例えば `booking:full`。 |
| エラー | エラー原因 | 再スローするエラー。その原因として。 |
| コード | | エラーがスローされる前に実行される IvyScript。`error` はこれからスローされる BpmError です。 |

### Error Boundary Event と Error Start

**一般**、**エラー**、**出力** の3つのタブがあります。

| セクション | 役割 |
| --- | --- |
| エラーコード | キャッチするコードまたはパターン。空のときは `<< 空白 >>` と表示され、「すべてのエラーをキャッチします」。 |
| 出力: マッピング、コード | エラーが起きたときのプロセスデータ `in` と、`error`:「起きた `BpmError` を参照します。起きたエラーコード、原因、コールスタックにアクセスできます。」`error.getErrorCode()` でコードが、`error.getTechnicalCause()` で Java の例外が分かります。 |

### コードからスローする

リファレンスの例は `BpmError.create("mystock:empty").throwError();` です。IvyScript では、先に BpmError をインポートする必要があります: `import ch.ivyteam.ivy.bpm.error.BpmError;`。インポートがないと、Designer は `Output code: Variable 'BpmError' cannot be resolved` と報告します。

### ハンドラーを探す順序

リファレンスはこの順序を挙げています:

1. 要素のインスクリプションで直接指定された Error Start Event（ほかのシステムを呼び出す要素、パート7）。
2. エラーが起きたアクティビティに直接付いた Error Boundary Event。
3. 同じプロセスレベルの Error Start Event。ただし、エラーが Error End Event でスローされたのでない場合。
4. 1つ上のプロセスレベル。手順 2 からやり直し、トップレベルのプロセスまで。
5. トップレベルのプロジェクトの Project Error Process。
6. それでもキャッチされなければ、エラーは標準のエラーページでユーザーに表示されます。

「各プロセス（Embedded Subprocess を含む）は別々のプロセスレベルです。」「Error End Event はエラーを上のプロセスレベルにスローします。同じプロセスレベルではキャッチできません。」Project Error Process は「プロジェクト全体のキャッチされなかったエラーをキャッチします」。名前は「`Error` で始まる必要があり」、「トップレベルのプロセスグループ *Processes*」にあり、そこでは「スローしたプロセスのプロセスデータ（つまり `in` 変数の値）は使えません」。

### 実行時

1. ハンドラーは、エラーのときのデータで引き継ぎます。スクリプトが失敗する前に変えたものは残ります。
2. Error End のコードが実行され、その後エラーは上のレベルに進みます。呼び出し可能なサブプロセスからは Call Sub へ、ボックスからはボックスへ。
3. 上のレベルでは、まず Call Sub やボックスの境界イベント、次にそのレベルの Error Start が試されます。その Error Start は、下で Error End がスローしたエラーも引き受けます。
4. 同じレベルの Error End と Error Start: エラーはそこではキャッチされません。
5. 誰もキャッチしないエラーはリクエストを失敗させます。HTTP 500 で、ランタイムログには `Problem while processing request '…'` と、原因として `BpmError booking:full` やスクリプトの Java の例外が出ます。
6. 同じレベルで同じエラーに対してキャッチする要素がもう一度実行されると、エラー処理は「循環を断つため」、新しいエラーコード `ivy:error:loop` で1つ上のレベルに進みます。

1〜5 は 2026-11-16 に Designer とそのエンジン 14.0.1 で確認したもの、6 はリファレンスの記述です。

## よくある質問

**Error End とスクリプトの BpmError、どちらを使う？**
Error End は上のレベルにスローするので、呼び出し元がキャッチします。スクリプトからスローした BpmError は、同じレベルで、そのステップの境界イベントか Error Start がキャッチできます。

**プロセスのすべてのエラーをキャッチするには？**
エラーコードが空の Error Start は、境界イベントがキャッチしないそのレベルのエラーをすべてキャッチします。ただし、そのレベルの Error End がスローしたものは除きます。プロジェクト全体には Project Error Process があります。

**どのエラーが起きたか知るには？**
ハンドラーの「出力」で、`error.getErrorCode()`、失敗したスクリプトなら `error.getTechnicalCause()`（Java の例外）を使います。

**Error Start が Error End のエラーをキャッチしないのはなぜ？**
同じレベルにあるからです。スローする部分を呼び出し可能なサブプロセスかボックスに入れて、このレベルにスローさせるか、スクリプトからスローします。

**プロセスをまたいで、ハンドラーはどの順で試される？**
まずアクティビティの境界イベント、次にそのレベルの Error Start、次に呼び出し元、最後に Project Error Process です。Axon Ivy コミュニティでも同じ順序が説明されています（[answers 3543](https://answers.axonivy.com/questions/3543/how-to-create-errorhandling-process-for-dependent-project-model.html)）。

**ivy:error:loop とは？**
このレベルですでに実行されたキャッチする要素に、同じエラーが戻ってきたときのエラーです。コミュニティの例: ハンドラー付きのループの中で、呼び出しが再び失敗するケース。助言は、呼び出しとそのハンドラーを専用のサブプロセスに移すことでした（[answers 3181](https://answers.axonivy.com/questions/3181/prevent-by-pass-ivy-error-loop.html)）。

## よくある間違い

### 合わないコード

- *症状:* エラーがキャッチされず、リクエストが `Caused by: BpmError booking:full` で失敗する。Designer は何も報告しない。
- *原因:* キャッチする側のコードが別のもの（`payment`）か、ほとんど同じもの（`import:empty` に対して `imports`）。コードはコロンで区切られた部分ごとに比べられる。
- *直し方:* スローされたコード、またはその先頭の部分をキャッチする: `booking:full`、`booking`。[ウォークスルー 3.10](#/walkthrough/3.10) · [3.11](#/walkthrough/3.11)

### バグをキャッチする空のコード

- *症状:* そのエラーではないケースで、エラーのための業務のパスが実行される。コードは `ivy:error:script`。
- *原因:* 空のエラーコードは、失敗したスクリプトも含めてすべてのエラーをキャッチする。
- *直し方:* 処理できるコードをキャッチし、それ以外は失敗させるか、報告する1つのハンドラーに任せる。[ウォークスルー 3.10](#/walkthrough/3.10)

### 同じレベルの Error End と Error Start

- *症状:* そのコードの Error Start がプロセスにあるのに、リクエストが Error End のコードで失敗する。
- *原因:* Error End は上のレベルにスローし、「同じプロセスレベルではキャッチできません」。
- *直し方:* スクリプトから BpmError でスローするか、サブプロセスやボックスにこのレベルへスローさせる。[ウォークスルー 3.11](#/walkthrough/3.11)

### インポートのない BpmError

- *症状:* Designer が `Output code: Variable 'BpmError' cannot be resolved` と報告する。実行時には、意図したコードではなく `ivy:error:script` でスクリプトが失敗する。
- *原因:* IvyScript はインポートなしでは BpmError を知らない。
- *直し方:* コードの先頭に `import ch.ivyteam.ivy.bpm.error.BpmError;`。[ウォークスルー 3.11](#/walkthrough/3.11)

### 後の Error End の原因に `error`

- *症状:* 境界イベントの後の Error End で、Designer が `Error cause: Variable 'error' cannot be resolved` と報告する。
- *原因:* `error` があるのは、それをキャッチしたハンドラーの「出力」の中だけ。
- *直し方:* ハンドラーの「出力」でエラーをプロセスデータの属性に入れ、その属性を原因として使う。

## ウォークスルー

- [3.10 エラーのスローとキャッチ](#/walkthrough/3.10): 呼び出し可能なサブプロセスの Error End、Call Sub の Error Boundary Event、2つの間違い（合わないコード、バグをキャッチする空のコード）。
- [3.11 プロセス全体に1つのハンドラー](#/walkthrough/3.11): Error Start、スクリプトからスローする BpmError、探す順序、同じレベルではキャッチできない Error End、2つの間違い（インポートのない BpmError、1文字多いコード）。

## 関連項目

- [呼び出し可能なサブプロセス](#/part/3/callable-sub) と [Embedded Subprocess](#/part/3/embedded-bpmn): エラーがスローされてくるレベル。
- [Script Step](#/part/3/script-step): コードの中の try/catch。
- 公式リファレンス（英語）: [Error Handling](https://developer.axonivy.com/doc/14.0/en/reference/process/error-handling.html) · [Error End](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/error-end.html) · [Error Boundary Event](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/error-boundary-event.html) · [Error Start](https://developer.axonivy.com/doc/14.0/en/reference/process/process-elements/error-start.html)
- コミュニティ（英語）: [How to create ErrorHandling process for dependent project model?](https://answers.axonivy.com/questions/3543/how-to-create-errorhandling-process-for-dependent-project-model.html) · [Prevent/by-pass ivy:error:loop](https://answers.axonivy.com/questions/3181/prevent-by-pass-ivy-error-loop.html)

*ラベルとエラーメッセージは Designer for VS Code 14.0.1 の表示どおりです。実行時の動作はそのエンジン 14.0.1 で確認したものです。*
