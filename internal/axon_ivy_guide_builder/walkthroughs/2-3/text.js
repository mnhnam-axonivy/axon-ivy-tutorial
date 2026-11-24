/**
 * Walkthrough 2.3 — texts in English and Japanese. Labels of the Designer are quoted as the
 * Designer shows them in each language (runtime/designer-labels.json); element names stay
 * English in both (see runtime/i18n.js).
 *
 * Sources: Process Elements Reference 14.0 — Start, Common Tabs (Start Tab), Process End;
 * answers.axonivy.com/questions/1274 (a parameter that is not passed to the process data).
 */
export const strings = {
  en: {
    'tour.intro.title': 'Starting a process with parameters',
    'tour.intro.text': 'A Start that takes two values from the link it is called by. You see where the values arrive, how they get into the process data, and what happens to a value that nobody maps.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.signature': 'The signature',
    'tour.chapter.request': 'Values in the start link',
    'tour.chapter.mapping': 'Mapping the parameters',
    'tour.chapter.end': 'Process End',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.signatureName.title': 'The name of the start',
    'tour.signatureName.text': 'The Start tab begins with the signature. Its name is case sensitive and may only contain letters, numbers and underscores.',
    'tour.params.title': 'Input parameters',
    'tour.params.text': 'Each parameter has a name, a type and a description. This start expects `room`, a String, and `people`, a Number. The list may also be empty.',
    'tour.signatureText.title': 'Name plus types',
    'tour.signatureText.text': 'The name together with the types of the parameters, in their order, is the signature. Change a type or the order, and every element that calls this start has to be updated.',

    'tour.link.title': 'The start link',
    'tour.link.text': 'This Start can be started with an HTTP request. Its link is the signature name with `.ivp` at the end. Parameters are added to the URL, like `?room=Matterhorn&people=4`.',
    'tour.requestSent.title': 'The request',
    'tour.requestSent.text': 'Run sends exactly such a request. The values travel as text in the link.',
    'tour.paramArrived.title': 'They arrive as param',
    'tour.paramArrived.text': 'Each input parameter is now a field of `param`: `param.room` and `param.people`. `param` is available in the mapping and the code of the Start.',

    'tour.mapping.title': 'Mapping',
    'tour.mapping.text': 'The mapping table has one row for every attribute of the process data. Only the input parameters of the signature can be assigned to it.',
    'tour.mappingRow.title': 'One row, one value',
    'tour.mappingRow.text': '`out.room` gets the value of `param.room`. `out` is the process data that leaves the Start.',
    'tour.dataFilled.title': 'The process data is filled',
    'tour.dataFilled.text': 'After the Start, `in.room` is "Matterhorn" and `in.people` is 4. Every element after the Start sees these values as `in`.',
    'tour.logLine.title': 'Used later in the process',
    'tour.logLine.text': 'The Script Step writes `in.room` to the Runtime Log. Part 3 explains Script Steps.',

    'tour.notMapped.title': 'A parameter that is not mapped',
    'tour.unmapEdit.title': 'The row of people is emptied',
    'tour.unmapEdit.text': 'The parameter is still declared in the signature, but no row of the mapping uses it any more.',
    'tour.unmapArrived.title': 'The value still arrives',
    'tour.unmapArrived.text': 'The request brings `people=4`, so `param.people` is 4.',
    'tour.unmapLost.title': 'But it never reaches the process data',
    'tour.unmapLost.text': '`in.people` keeps the value a new case starts with: 0. The run does not fail, the value is simply gone after the Start.',
    'tour.unmapFix.title': 'How to fix it',
    'tour.unmapFix.text': 'Declaring a parameter is not enough: map it to an attribute of the process data. When a start parameter seems to be empty later in the process, check its row in the mapping first.',

    'tour.inStart.title': 'in instead of param',
    'tour.inMarked.title': 'The Designer marks the row',
    "tour.inMarked.text": "Start 'out.room': Variable 'in' cannot be resolved. In every other element `in` is the data that comes in. Nothing comes into a Start.",
    'tour.inStopped.title': 'Run anyway',
    'tour.inStopped.text': 'Run with the error, and the request fails at the Start, before any data exists. The Runtime Log reports ivy:error:script, with the Designer\'s message as its cause.',
    'tour.inFix.title': 'How to fix it',
    'tour.inFix.text': 'In the mapping and the code of a Start, the values of the request are in `param`, and `out` is the process data being filled. Write `param.room`.',

    'tour.endReached.title': 'Process End',
    'tour.endReached.text': 'The token reaches the Process End. This element terminates the current process.',
    'tour.endTabs.title': 'Nothing to configure',
    'tour.endTabs.text': 'A Process End only has the General tab: a name and a description, like every element.'
  },

  ja: {
    'tour.intro.title': 'パラメーター付きでプロセスを開始する',
    'tour.intro.text': '呼び出し元のリンクから2つの値を受け取る Start です。値がどこに届き、どのようにプロセスデータに入るのか、そしてマッピングされない値がどうなるのかを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.signature': 'シグネチャ',
    'tour.chapter.request': '開始リンクで値を渡す',
    'tour.chapter.mapping': 'パラメーターのマッピング',
    'tour.chapter.end': 'Process End',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.signatureName.title': '開始の名前',
    'tour.signatureName.text': '「開始」タブはシグネチャから始まります。名前は大文字と小文字が区別され、使えるのは英字、数字、アンダースコアだけです。',
    'tour.params.title': '入力パラメーター',
    'tour.params.text': '各パラメーターには名前、タイプ、説明があります。この開始は String の `room` と Number の `people` を受け取ります。リストは空でも構いません。',
    'tour.signatureText.title': '名前とタイプ',
    'tour.signatureText.text': '名前と、パラメーターのタイプとその順序を合わせたものがシグネチャです。タイプや順序を変えると、この開始を呼び出すすべての要素を更新する必要があります。',

    'tour.link.title': '開始リンク',
    'tour.link.text': 'この Start は HTTP リクエストで開始できます。リンクはシグネチャの名前の末尾に `.ivp` を付けたものです。パラメーターは `?room=Matterhorn&people=4` のように URL に付け加えます。',
    'tour.requestSent.title': 'リクエスト',
    'tour.requestSent.text': '「実行」はまさにこのようなリクエストを送ります。値はテキストとしてリンクの中で渡されます。',
    'tour.paramArrived.title': 'param として届く',
    'tour.paramArrived.text': '各入力パラメーターは `param` のフィールドになります: `param.room` と `param.people`。`param` は Start のマッピングとコードの中で使えます。',

    'tour.mapping.title': 'マッピング',
    'tour.mapping.text': 'マッピングの表には、プロセスデータの属性ごとに1行があります。そこに割り当てられるのは、シグネチャの入力パラメーターだけです。',
    'tour.mappingRow.title': '1行に1つの値',
    'tour.mappingRow.text': '`out.room` には `param.room` の値が入ります。`out` は Start から出ていくプロセスデータです。',
    'tour.dataFilled.title': 'プロセスデータが埋まる',
    'tour.dataFilled.text': 'Start の後、`in.room` は "Matterhorn"、`in.people` は 4 です。Start より後のすべての要素は、これらの値を `in` として参照します。',
    'tour.logLine.title': 'プロセスの後半で使う',
    'tour.logLine.text': 'Script Step が `in.room` をランタイムログに書き込みます。Script Step はパート3で説明します。',

    'tour.notMapped.title': 'マッピングされていないパラメーター',
    'tour.unmapEdit.title': 'people の行を空にする',
    'tour.unmapEdit.text': 'パラメーターはシグネチャで宣言されたままですが、マッピングのどの行でも使われなくなりました。',
    'tour.unmapArrived.title': '値は届いている',
    'tour.unmapArrived.text': 'リクエストは `people=4` を運んでくるので、`param.people` は 4 です。',
    'tour.unmapLost.title': 'しかしプロセスデータには届かない',
    'tour.unmapLost.text': '`in.people` は新しいケースの初期値 0 のままです。実行は失敗しません。値は Start の後で消えてしまうだけです。',
    'tour.unmapFix.title': '直し方',
    'tour.unmapFix.text': 'パラメーターを宣言するだけでは足りません。プロセスデータの属性にマッピングしてください。開始パラメーターがプロセスの後半で空になっているように見えたら、まずマッピングの行を確認します。',

    'tour.inStart.title': 'param ではなく in',
    'tour.inMarked.title': 'Designer が行に印を付ける',
    "tour.inMarked.text": "Start 'out.room': Variable 'in' cannot be resolved。ほかの要素では `in` は入ってくるデータですが、Start に入ってくるデータはありません。",
    'tour.inStopped.title': 'それでも実行すると',
    'tour.inStopped.text': 'エラーのまま実行すると、データがまだ何もない Start でリクエストが失敗します。ランタイムログには ivy:error:script と、その原因として Designer のメッセージが出ます。',
    'tour.inFix.title': '直し方',
    'tour.inFix.text': 'Start のマッピングとコードでは、リクエストの値は `param` にあり、`out` はこれから埋めるプロセスデータです。`param.room` と書きます。',

    'tour.endReached.title': 'Process End',
    'tour.endReached.text': 'トークンが Process End に到達します。この要素は現在のプロセスを終了します。',
    'tour.endTabs.title': '設定するものはない',
    'tour.endTabs.text': 'Process End には「一般」タブしかありません。ほかの要素と同じく、名前と説明だけです。'
  }
};
