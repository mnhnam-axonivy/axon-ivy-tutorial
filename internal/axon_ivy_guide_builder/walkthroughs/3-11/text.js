/**
 * Walkthrough 3.11 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Error Start ("The execution can continue at an
 * Error Start Event which handles the occurred error"); Error Handling (the order in which a
 * handler is searched; "The Error End Event throws the error to the upper process level, it
 * can't be caught on the same process level"; BpmError.create(…).throwError()). That BpmError
 * needs its import in IvyScript, and what the Runtime Log shows, were read on the Designer and
 * its engine 14.0.1 (PROGRESS.md, "Part 3, checked on the engine").
 */
export const strings = {
  en: {
    'tour.intro.title': 'One handler for the whole process',
    'tour.intro.text': 'An import of orders stops when its file is empty. A script throws the error, and an Error Start of the process handles it, whichever step it comes from. You see the order in which Axon Ivy looks for a handler, an error that its own level cannot catch, and two mistakes.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.handler': 'The Error Start',
    'tour.chapter.throwScript': 'Thrown by a script',
    'tour.chapter.search': 'Where a handler is searched',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.errorStart.title': 'An Error Start',
    'tour.errorStart.text': 'No connector leads to this start. It starts when an error happens on this level of the process, and no Error Boundary Event on the failing element has caught it.',
    'tour.startCode.title': 'Its code',
    'tour.startCode.text': '`import` catches every error whose code starts with `import`, from any element of this level.',
    'tour.startOutput.title': 'The data at the error',
    'tour.startOutput.text': 'Its Output has `in`, the process data as it was when the error happened, and `error`. Here the code of the error goes into `problem`.',

    'tour.bpmCode.title': 'A script throws',
    'tour.bpmCode.text': 'An empty file is not a reason to fail; it is a case to handle. `BpmError.create("import:empty").throwError();` throws a BPM error with that code.',
    'tour.importLine.title': 'Its import',
    'tour.importLine.text': 'In IvyScript, BpmError needs its import: `import ch.ivyteam.ivy.bpm.error.BpmError;`.',
    'tour.caughtStart.title': 'The Error Start takes it',
    'tour.caughtStart.text': '"Read the file" threw `import:empty`. It has no boundary event, so the Error Start of this level catches it, and the token goes on from there.',
    'tour.reported.title': 'Reported',
    'tour.reported.text': '"Import" did not run. The error path wrote its warning with the code.',

    'tour.order.title': 'The order of the search',
    'tour.order.text': 'First an Error Boundary Event on the element where the error happened. Then an Error Start on the same level, but not for an error that an Error End on this level threw. Then one level up: a boundary event on the box or the Call Sub this level belongs to, then an Error Start up there. An error nobody catches fails the request.',
    'tour.cancelStart.title': 'An Error End on this level',
    'tour.cancelStart.text': 'A second start, "Cancel an import", leads straight to an Error End that throws `import:cancelled`. The Error Start `import` is on the same level.',
    'tour.cancelFails.title': 'Not caught',
    'tour.cancelFails.text': 'The request fails, caused by BpmError import:cancelled. An Error End throws to the level above; this process has none, so nobody catches it.',
    'tour.cancelWhy.title': 'Why',
    'tour.cancelWhy.text': 'An Error End leaves its level, so it is caught by the caller: by the boundary on the Call Sub or the box, or by an Error Start up there (walkthrough 3.10). To handle an error on its own level, throw it from a script, as "Read the file" does.',

    'tour.noImport.title': 'BpmError without its import',
    'tour.importGone.title': 'The Designer marks it',
    'tour.importGone.text': 'The import line is deleted. The Designer reports: Output code: Variable \'BpmError\' cannot be resolved.',
    'tour.importRan.title': 'Another error',
    'tour.importRan.text': 'Run with the error, and the script fails with ivy:error:script. That is not an `import` error, so the Error Start does not take it, and the request fails.',
    'tour.importFix.title': 'How to fix it',
    'tour.importFix.text': 'Import it at the top of the code: `import ch.ivyteam.ivy.bpm.error.BpmError;`.',
    'tour.wrongCode.title': 'A code that is almost right',
    'tour.codeEdit.title': 'One letter more',
    'tour.codeEdit.text': 'The Error Start now catches `imports`.',
    'tour.codeRan.title': 'Not caught',
    'tour.codeRan.text': 'Codes are compared part by part, between the colons: `imports` is not `import`. The request fails, caused by BpmError import:empty.',
    'tour.codeFix.title': 'How to fix it',
    'tour.codeFix.text': 'Write the code exactly as it is thrown, or one of its leading parts: `import:empty` or `import`.'
  },
  ja: {
    'tour.intro.title': 'プロセス全体に1つのハンドラー',
    'tour.intro.text': '注文のインポートは、ファイルが空のときに止まります。スクリプトがエラーをスローし、どのステップから来たエラーでも、プロセスの Error Start が処理します。Axon Ivy がハンドラーを探す順序、同じレベルではキャッチできないエラー、そして2つの間違いを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.handler': 'Error Start',
    'tour.chapter.throwScript': 'スクリプトからスロー',
    'tour.chapter.search': 'ハンドラーを探す場所',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.errorStart.title': 'Error Start',
    'tour.errorStart.text': 'この開始にはコネクターが入ってきません。プロセスのこのレベルでエラーが起き、失敗した要素の Error Boundary Event がキャッチしなかったときに開始します。',
    'tour.startCode.title': 'コード',
    'tour.startCode.text': '`import` は、このレベルのどの要素からでも、コードが `import` で始まるエラーをすべてキャッチします。',
    'tour.startOutput.title': 'エラーのときのデータ',
    'tour.startOutput.text': '「出力」には、エラーが起きたときのプロセスデータ `in` と、`error` があります。ここではエラーのコードを `problem` に入れます。',

    'tour.bpmCode.title': 'スクリプトがスローする',
    'tour.bpmCode.text': '空のファイルは失敗の理由ではなく、処理すべきケースです。`BpmError.create("import:empty").throwError();` が、そのコードの BPM エラーをスローします。',
    'tour.importLine.title': 'インポート',
    'tour.importLine.text': 'IvyScript では、BpmError にインポートが必要です: `import ch.ivyteam.ivy.bpm.error.BpmError;`。',
    'tour.caughtStart.title': 'Error Start が引き受ける',
    'tour.caughtStart.text': '「Read the file」が `import:empty` をスローしました。境界イベントがないので、このレベルの Error Start がキャッチし、トークンはそこから先に進みます。',
    'tour.reported.title': '報告済み',
    'tour.reported.text': '「Import」は実行されませんでした。エラーのパスが、コード付きの警告を書きました。',

    'tour.order.title': '探す順序',
    'tour.order.text': 'まず、エラーが起きた要素の Error Boundary Event。次に、同じレベルの Error Start。ただし、このレベルの Error End がスローしたエラーは除きます。それから1つ上のレベルへ。このレベルが属するボックスや Call Sub の境界イベント、次にそのレベルの Error Start です。誰もキャッチしないエラーはリクエストを失敗させます。',
    'tour.cancelStart.title': 'このレベルの Error End',
    'tour.cancelStart.text': '2つ目の開始「Cancel an import」は、`import:cancelled` をスローする Error End に直接つながっています。Error Start `import` は同じレベルにあります。',
    'tour.cancelFails.title': 'キャッチされない',
    'tour.cancelFails.text': 'リクエストは失敗し、原因は BpmError import:cancelled です。Error End は1つ上のレベルにスローしますが、このプロセスにはそれがないので、誰もキャッチしません。',
    'tour.cancelWhy.title': 'なぜか',
    'tour.cancelWhy.text': 'Error End は自分のレベルを離れるので、キャッチするのは呼び出し元です。Call Sub やボックスの境界イベント、または上のレベルの Error Start です（ウォークスルー 3.10）。同じレベルでエラーを処理するには、「Read the file」のようにスクリプトからスローします。',

    'tour.noImport.title': 'インポートのない BpmError',
    'tour.importGone.title': 'Designer が指摘する',
    'tour.importGone.text': 'インポートの行を削除しました。Designer の報告: Output code: Variable \'BpmError\' cannot be resolved。',
    'tour.importRan.title': '別のエラー',
    'tour.importRan.text': 'エラーのまま実行すると、スクリプトは ivy:error:script で失敗します。これは `import` のエラーではないので Error Start は引き受けず、リクエストは失敗します。',
    'tour.importFix.title': '直し方',
    'tour.importFix.text': 'コードの先頭でインポートします: `import ch.ivyteam.ivy.bpm.error.BpmError;`。',
    'tour.wrongCode.title': 'ほとんど正しいコード',
    'tour.codeEdit.title': '1文字多い',
    'tour.codeEdit.text': 'Error Start が `imports` をキャッチするようになりました。',
    'tour.codeRan.title': 'キャッチされない',
    'tour.codeRan.text': 'コードはコロンで区切られた部分ごとに比べられます。`imports` は `import` ではありません。リクエストは失敗し、原因は BpmError import:empty です。',
    'tour.codeFix.title': '直し方',
    'tour.codeFix.text': 'スローされるとおりにコードを書くか、その先頭の部分を書きます: `import:empty` または `import`。'
  }
};
