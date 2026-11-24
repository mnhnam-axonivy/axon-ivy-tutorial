/**
 * Walkthrough 3.1 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Script Step, Common Tabs (Output); IvyScript →
 * Language (initial values). The error messages are the Designer's own, read from its Problems
 * view (Designer for VS Code 14.0.1; see PROGRESS.md, log of 2026-11-16).
 */
export const strings = {
  en: {
    'tour.intro.title': 'Mapping values',
    'tour.intro.text': 'A Script Step that calculates the total of an order in its mapping table, without a line of code. You see which values change, which stay, and two mistakes the Designer catches.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.table': 'The mapping table',
    'tour.chapter.expressions': 'Expressions on in',
    'tour.chapter.unchanged': 'What stays unchanged',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.table.title': 'The mapping table',
    'tour.table.text': 'The Output tab of a Script Step starts with its mapping. There is a row for every attribute of the data that leaves the step, `out`. The Expression column gives the row its value.',
    'tour.root.title': 'By default, out is in',
    'tour.root.text': 'The row `out` itself has the expression `in`: by default the output is the input. Rows below it change single attributes.',
    'tour.rowTotal.title': 'An expression on in',
    'tour.rowTotal.text': '`out.total` gets `in.quantity * in.unitPrice`. The expression reads the incoming data, `in`.',
    'tour.rowStatus.title': 'Text in quotes',
    'tour.rowStatus.text': '`out.status` gets the text "calculated". Text in an expression is written in double quotes.',

    'tour.before.title': 'Before the step',
    'tour.before.text': '`in.total` is still 0 and `in.status` is empty: the values a new case starts with, because nothing has set them yet.',
    'tour.after.title': 'After the mapping',
    'tour.after.text': '`total` is now 37.5, three times 12.5, and `status` is "calculated".',

    'tour.kept.title': 'No expression, no change',
    'tour.kept.text': '`customer` has no row of its own. The first row, `out` ← `in`, hands on everything as it came in, so it leaves the step as "Muster AG". The Designer puts that row into every mapping.',
    'tour.customerEdit.title': 'An expression for customer',
    'tour.customerEdit.text': 'Now its row gets `in.customer.toUpperCase()`, a method of the Java String.',
    'tour.customerChanged.title': 'The row replaces the value',
    'tour.customerChanged.text': '`customer` leaves the step as "MUSTER AG". The attributes without a row still pass through unchanged.',

    'tour.quotes.title': 'Text without quotes',
    'tour.quotesError.title': 'The Designer marks the row',
    'tour.quotesError.text': 'Without quotes, `calculated` is read as the name of a variable, and there is none. The Designer reports: Variable \'calculated\' cannot be resolved.',
    'tour.quotesStopped.title': 'Run anyway',
    'tour.quotesStopped.text': 'Run with the error, and the request fails at this Script Step. The Runtime Log reports ivy:error:script, with the Designer\'s message as its cause.',
    'tour.quotesFix.title': 'How to fix it',
    'tour.quotesFix.text': 'Put text in double quotes: "calculated". Without quotes, a word is an attribute, a variable or a class.',
    'tour.numberAsText.title': 'A number in quotes',
    'tour.castError.title': 'Text is not a number',
    'tour.castError.text': 'In quotes, "37.5" is text, and `total` is a Number. The Designer reports: Cannot cast object of type String to type Number.',
    'tour.castFix.title': 'How to fix it',
    'tour.castFix.text': 'Write numbers without quotes, like 37.5, or calculate them, as the original row does.'
  },

  ja: {
    'tour.intro.title': '値のマッピング',
    'tour.intro.text': 'コードを1行も書かずに、マッピングの表で注文の合計を計算する Script Step です。どの値が変わり、どの値が残るのか、そして Designer が見つける2つの間違いを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.table': 'マッピングの表',
    'tour.chapter.expressions': 'in を使った式',
    'tour.chapter.unchanged': '変わらずに残るもの',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.table.title': 'マッピングの表',
    'tour.table.text': 'Script Step の「出力」タブはマッピングから始まります。ステップから出ていくデータ `out` の属性ごとに1行があります。「式」の列がその行の値を決めます。',
    'tour.root.title': '既定では out は in',
    'tour.root.text': '`out` の行そのものには式 `in` があります。既定では、出力は入力と同じです。その下の行で個々の属性を変えます。',
    'tour.rowTotal.title': 'in を使った式',
    'tour.rowTotal.text': '`out.total` には `in.quantity * in.unitPrice` が入ります。式は入ってくるデータ `in` を読みます。',
    'tour.rowStatus.title': '引用符で囲んだテキスト',
    'tour.rowStatus.text': '`out.status` にはテキスト "calculated" が入ります。式の中のテキストは二重引用符で囲みます。',

    'tour.before.title': 'ステップの前',
    'tour.before.text': '`in.total` はまだ 0、`in.status` は空です。まだ何も設定していないので、新しいケースの初期値のままです。',
    'tour.after.title': 'マッピングの後',
    'tour.after.text': '`total` は 12.5 の3倍の 37.5、`status` は "calculated" になりました。',

    'tour.kept.title': '式がなければ変わらない',
    'tour.kept.text': '`customer` には自分の行がありません。最初の行 `out` ← `in` が、入ってきたものをすべてそのまま渡すので、"Muster AG" のままステップを出ます。Designer はすべてのマッピングにこの行を入れます。',
    'tour.customerEdit.title': 'customer に式を付ける',
    'tour.customerEdit.text': '今度はその行に、Java の String のメソッド `in.customer.toUpperCase()` を入れます。',
    'tour.customerChanged.title': '行が値を置き換える',
    'tour.customerChanged.text': '`customer` は "MUSTER AG" としてステップを出ます。行のない属性は、引き続きそのまま通過します。',

    'tour.quotes.title': '引用符のないテキスト',
    'tour.quotesError.title': 'Designer が行に印を付ける',
    'tour.quotesError.text': '引用符がないと、`calculated` は変数の名前として読まれますが、そのような変数はありません。Designer は次のように報告します: Variable \'calculated\' cannot be resolved',
    'tour.quotesStopped.title': 'それでも実行すると',
    'tour.quotesStopped.text': 'エラーがあるまま実行すると、この Script Step でリクエストが失敗します。ランタイムログには ivy:error:script と、その原因として Designer のメッセージが出ます。',
    'tour.quotesFix.title': '直し方',
    'tour.quotesFix.text': 'テキストは二重引用符で囲みます: "calculated"。引用符がなければ、その語は属性、変数、またはクラスとして扱われます。',
    'tour.numberAsText.title': '引用符で囲んだ数値',
    'tour.castError.title': 'テキストは数値ではない',
    'tour.castError.text': '引用符で囲んだ "37.5" はテキストで、`total` は Number です。Designer は次のように報告します: Cannot cast object of type String to type Number',
    'tour.castFix.title': '直し方',
    'tour.castFix.text': '数値は 37.5 のように引用符なしで書くか、元の行のように計算します。'
  }
};
