/**
 * Walkthrough 3.7 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Split ("For each outgoing connection you have a
 * separate outX object"), Join ("waits until all of the parallel incoming process paths have
 * finished"; "a separate inX object" per incoming connection). The Designer's defaults
 * (Split: out1 ← in only; Join: out ← in1), the order of the paths and the message for `in`
 * were read from the Designer and its engine 14.0.1 (PROGRESS.md, "Part 3, checked on the engine").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Two paths at the same time',
    'tour.intro.text': 'An applicant is checked twice, for credit and for references, at the same time. A Split starts both paths, a Join waits for both and brings their results together. Then three mistakes with the data of the paths.',
    'tour.intro.duration': 'about 4 min, 5 with the voice',
    'tour.chapter.split': 'The Split',
    'tour.chapter.turns': 'Two tokens',
    'tour.chapter.join': 'The Join',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.splitShape.title': 'A Split',
    'tour.splitShape.text': 'The diamond with the plus is a Split. It does not choose: it starts all of its exits at once, each with a token of its own.',
    'tour.outs.title': 'out1 and out2',
    'tour.outs.text': 'Its Output tab has one variable per exit: `out1` is the data of the first path, `out2` that of the second.',
    'tour.outIn.title': 'Each path gets a copy',
    'tour.outIn.text': 'Both are mapped from `in`, so each path starts with its own copy of the data. A new Split in the Designer maps only `out1` ← `in`; this one maps `out2` too.',

    'tour.secondFirst.title': 'Two tokens take turns',
    'tour.secondFirst.text': 'Both paths are running. Their tokens take turns, one element each. On the engine the second path went first, too. Do not build on an order: the paths are meant to be independent.',
    'tour.joinWaits.title': 'The first one waits',
    'tour.joinWaits.text': 'The first token has reached the Join. The Join waits until a token has come in on every incoming connector.',
    'tour.joinGoes.title': 'Both are there',
    'tour.joinGoes.text': 'The second token has arrived. The Join brings the two together, and one token goes on.',
    'tour.turnsLog.title': 'One decision',
    'tour.turnsLog.text': 'Each check wrote its line, and "Decide" ran once, after both.',

    'tour.ins.title': 'in1 and in2',
    'tour.ins.text': 'In a Join there is no `in`. Each incoming path brings its data as `in1`, `in2`, … in the order of the connectors.',
    'tour.joinOut.title': 'out ← in1',
    'tour.joinOut.text': 'The data that goes on starts as that of the first path, the default of a new Join. The second path set `references`, and `in1` does not have it.',
    'tour.joinRef.title': 'The second path\'s result',
    'tour.joinRef.text': 'So this row takes it from the second path: `in2.references`.',
    'tour.decided.title': 'Accepted',
    'tour.decided.text': 'Both results reached "Decide": credit from the first path, references from the second.',

    'tour.secondEmpty.title': 'The second path without data',
    'tour.out2Gone.title': 'No row for out2',
    'tour.out2Gone.text': 'The row `out2` ← `in` is deleted. This is how a new Split comes from the Designer: only `out1` is mapped.',
    'tour.noName.title': 'An applicant without a name',
    'tour.noName.text': 'The second path started with empty data: "References of : good". The run does not fail, and nothing warns.',
    'tour.out2Fix.title': 'How to fix it',
    'tour.out2Fix.text': 'Map every path the Split starts: `out2` ← `in`, `out3` ← `in`, …',
    'tour.joinLoses.title': 'The Join keeps one path',
    'tour.refGone.title': 'No row for the references',
    'tour.refGone.text': 'The Join\'s row for `out.references` is deleted. `out` ← `in1` is left.',
    'tour.rejected.title': 'Rejected',
    'tour.rejected.text': 'The references were checked, but only the first path\'s data went on. "Decide" found no references and rejected the applicant.',
    'tour.refFix.title': 'How to fix it',
    'tour.refFix.text': 'Take what each path found from its own `inX`: `out.references` ← `in2.references`.',
    'tour.inJoin.title': 'in in a Join',
    'tour.inMarked.title': 'The Designer marks it',
    'tour.inMarked.text': 'The Join\'s code reads `in.name`. The Designer reports: Output code: Variable \'in\' cannot be resolved.',
    'tour.inFix.title': 'How to fix it',
    'tour.inFix.text': 'Say which path the value comes from: `in1.name`.'
  },
  ja: {
    'tour.intro.title': '同時に2つのパス',
    'tour.intro.text': '応募者を、信用と推薦の2つの観点で同時にチェックします。Split が両方のパスを開始し、Join が両方を待って結果をまとめます。その後、パスのデータにかかわる3つの間違いを確認します。',
    'tour.intro.duration': '約4分（音声ありで約5分）',
    'tour.chapter.split': 'Split',
    'tour.chapter.turns': '2つのトークン',
    'tour.chapter.join': 'Join',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.splitShape.title': 'Split',
    'tour.splitShape.text': '+ の付いたひし形が Split です。選ぶのではなく、すべての出口を一度に開始し、それぞれに自分のトークンがあります。',
    'tour.outs.title': 'out1 と out2',
    'tour.outs.text': '「出力」タブには出口ごとに変数が1つあります。`out1` は1つ目のパスのデータ、`out2` は2つ目のパスのデータです。',
    'tour.outIn.title': '各パスがコピーを受け取る',
    'tour.outIn.text': 'どちらも `in` からマッピングされているので、各パスは自分用のデータのコピーで始まります。Designer で新しく作った Split がマッピングするのは `out1` ← `in` だけです。この Split は `out2` もマッピングしています。',

    'tour.secondFirst.title': '2つのトークンが交互に進む',
    'tour.secondFirst.text': '両方のパスが実行中です。トークンは1要素ずつ交互に進みます。Engine でも2つ目のパスが先でした。順序を前提にしないでください。パスは互いに独立している前提です。',
    'tour.joinWaits.title': '先に着いた方が待つ',
    'tour.joinWaits.text': '最初のトークンが Join に到達しました。Join は、入ってくるすべてのコネクターからトークンが来るまで待ちます。',
    'tour.joinGoes.title': '両方そろった',
    'tour.joinGoes.text': '2つ目のトークンが到着しました。Join が2つをまとめ、1つのトークンが先に進みます。',
    'tour.turnsLog.title': '判断は1回',
    'tour.turnsLog.text': 'それぞれのチェックが1行ずつ書き、「Decide」は両方の後に1回だけ実行されました。',

    'tour.ins.title': 'in1 と in2',
    'tour.ins.text': 'Join には `in` がありません。入ってくる各パスが、コネクターの順に `in1`、`in2`、… としてデータを持ってきます。',
    'tour.joinOut.title': 'out ← in1',
    'tour.joinOut.text': '先に進むデータは、1つ目のパスのデータから始まります。新しい Join の既定値です。`references` を設定したのは2つ目のパスで、`in1` にはありません。',
    'tour.joinRef.title': '2つ目のパスの結果',
    'tour.joinRef.text': 'そこでこの行が、2つ目のパスから取ります: `in2.references`。',
    'tour.decided.title': '採用',
    'tour.decided.text': '両方の結果が「Decide」に届きました。信用は1つ目のパスから、推薦は2つ目のパスからです。',

    'tour.secondEmpty.title': 'データのない2つ目のパス',
    'tour.out2Gone.title': 'out2 の行がない',
    'tour.out2Gone.text': '`out2` ← `in` の行を削除しました。Designer で新しく作った Split はこの状態です。マッピングされるのは `out1` だけです。',
    'tour.noName.title': '名前のない応募者',
    'tour.noName.text': '2つ目のパスは空のデータで始まりました: "References of : good"。実行は失敗せず、警告も出ません。',
    'tour.out2Fix.title': '直し方',
    'tour.out2Fix.text': 'Split が開始するすべてのパスをマッピングします: `out2` ← `in`、`out3` ← `in`、…',
    'tour.joinLoses.title': 'Join が1つのパスだけを残す',
    'tour.refGone.title': '推薦の行がない',
    'tour.refGone.text': 'Join の `out.references` の行を削除しました。残っているのは `out` ← `in1` です。',
    'tour.rejected.title': '不採用',
    'tour.rejected.text': '推薦はチェックされたのに、先に進んだのは1つ目のパスのデータだけです。「Decide」は推薦を見つけられず、応募者を不採用にしました。',
    'tour.refFix.title': '直し方',
    'tour.refFix.text': '各パスが見つけたものは、そのパスの `inX` から取ります: `out.references` ← `in2.references`。',
    'tour.inJoin.title': 'Join で in',
    'tour.inMarked.title': 'Designer が指摘する',
    'tour.inMarked.text': 'Join のコードが `in.name` を読んでいます。Designer の報告: Output code: Variable \'in\' cannot be resolved。',
    'tour.inFix.title': '直し方',
    'tour.inFix.text': '値がどのパスから来るのかを書きます: `in1.name`。'
  }
};
