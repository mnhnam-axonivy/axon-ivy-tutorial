/**
 * Walkthrough 3.4 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Alternative ("The conditions are evaluated from
 * the top to the bottom and the exit of the first one that evaluates to true is chosen").
 * What an empty condition, text and = do was read on the Designer's engine 14.0.1, the message
 * from the Designer (PROGRESS.md, "Part 3, checked on the engine").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Two paths, one condition',
    'tour.intro.text': 'An expense of more than 500 CHF goes to the manager, every other one is paid at once. One Alternative decides. You see its Condition tab, two runs that take different paths, and two mistakes in a condition.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.conditions': 'The Condition tab',
    'tour.chapter.small': 'A small expense',
    'tour.chapter.large': 'A large expense',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.alternative.title': 'An Alternative',
    'tour.alternative.text': 'The diamond with the cross is an Alternative. It has one way in and several ways out, and it sends the token down exactly one of them.',
    'tour.conditionTab.title': 'One row per exit',
    'tour.conditionTab.text': 'Its Condition tab has a row for each exit. Type names where the exit leads, Expression holds the condition: an expression that is true or false.',
    'tour.rowYes.title': 'More than 500',
    'tour.rowYes.text': 'The first exit leads to "Ask the manager" and is taken when `in.amount > 500` is true.',
    'tour.rowNo.title': 'An empty condition',
    'tour.rowNo.text': 'The second row is empty. An empty condition is always true, so this exit takes every expense the row above did not take: the "else" of the Alternative.',

    'tour.reached.title': 'Top to bottom',
    'tour.reached.text': 'The token reaches the Alternative. The conditions are tried from the top, and the first one that is true decides.',
    'tour.smallPath.title': '120 is not more than 500',
    'tour.smallPath.text': 'The first condition is false, the empty one is true: the expense is paid at once.',
    'tour.paid.title': 'Paid',
    'tour.paid.text': 'Only this path ran. "Ask the manager" did not run at all.',

    'tour.largePath.title': '800 is more than 500',
    'tour.largePath.text': 'This time the first condition is true. It decides; the row below is not tried at all.',
    'tour.waiting.title': 'Waiting for the manager',
    'tour.waiting.text': 'The same process, other data, another path.',

    'tour.textCondition.title': 'Text as a condition',
    'tour.textMarked.title': 'The Designer marks it',
    'tour.textMarked.text': 'The first condition is now `in.employee`, text and not true or false. The Designer reports: Condition #1: Cannot cast object of type String to type Boolean.',
    'tour.textRan.title': 'Run anyway',
    'tour.textRan.text': 'Run with 800, and the expense is paid at once. On the engine, text in a condition is never true, filled or not, so the empty row takes every expense.',
    'tour.textFix.title': 'How to fix it',
    'tour.textFix.text': 'A condition compares, or reads a Boolean: `in.amount > 500`, `in.employee == "Anna"`, `in.urgent`.',
    'tour.assignment.title': '= instead of ==',
    'tour.assignEdit.title': 'Urgent expenses first',
    'tour.assignEdit.text': 'Urgent expenses should go to the manager, so the first condition becomes `in.urgent = true`. The Designer reports nothing.',
    'tour.assignRan.title': 'Every expense goes to the manager',
    'tour.assignRan.text': 'A 120 CHF expense that was not urgent went to the manager, and `urgent` is now true. A single `=` assigns: the condition sets urgent to true, and its value, true, decides.',
    'tour.assignFix.title': 'How to fix it',
    'tour.assignFix.text': 'Compare with `==`: `in.urgent == true`, or simply `in.urgent`.'
  },
  ja: {
    'tour.intro.title': '2つのパス、1つの条件',
    'tour.intro.text': '500 CHF を超える経費はマネージャーへ、それ以外はすぐに支払われます。決めるのは1つの Alternative です。その「条件」タブ、別々のパスを通る2回の実行、そして条件の2つの間違いを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.conditions': '「条件」タブ',
    'tour.chapter.small': '少額の経費',
    'tour.chapter.large': '高額の経費',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.alternative.title': 'Alternative',
    'tour.alternative.text': '× の付いたひし形が Alternative です。入口は1つ、出口は複数で、トークンをそのうちのちょうど1つに送ります。',
    'tour.conditionTab.title': '出口ごとに1行',
    'tour.conditionTab.text': '「条件」タブには出口ごとに1行があります。「タイプ」は出口の行き先、「式」は条件です。true か false になる式です。',
    'tour.rowYes.title': '500 を超える',
    'tour.rowYes.text': '最初の出口は「Ask the manager」へ続き、`in.amount > 500` が true のときに選ばれます。',
    'tour.rowNo.title': '空の条件',
    'tour.rowNo.text': '2行目は空です。空の条件は常に true なので、上の行が選ばなかった経費をすべてこの出口が引き受けます。Alternative の「それ以外」です。',

    'tour.reached.title': '上から下へ',
    'tour.reached.text': 'トークンが Alternative に到達します。条件は上から順に試され、最初に true になったものが決めます。',
    'tour.smallPath.title': '120 は 500 を超えない',
    'tour.smallPath.text': '最初の条件は false、空の条件は true です。経費はすぐに支払われます。',
    'tour.paid.title': '支払い済み',
    'tour.paid.text': '実行されたのはこのパスだけです。「Ask the manager」はまったく実行されていません。',

    'tour.largePath.title': '800 は 500 を超える',
    'tour.largePath.text': '今度は最初の条件が true です。これで決まり、下の行はまったく試されません。',
    'tour.waiting.title': 'マネージャー待ち',
    'tour.waiting.text': '同じプロセスでも、データが違えば別のパスを通ります。',

    'tour.textCondition.title': '条件にテキスト',
    'tour.textMarked.title': 'Designer が指摘する',
    'tour.textMarked.text': '最初の条件が `in.employee` になりました。true でも false でもなく、テキストです。Designer の報告: Condition #1: Cannot cast object of type String to type Boolean。',
    'tour.textRan.title': 'それでも実行すると',
    'tour.textRan.text': '800 で実行すると、経費はすぐに支払われます。Engine では、条件の中のテキストは入っていてもいなくても true になりません。そのため、空の行がすべての経費を引き受けます。',
    'tour.textFix.title': '直し方',
    'tour.textFix.text': '条件では比較するか、Boolean を読みます: `in.amount > 500`、`in.employee == "Anna"`、`in.urgent`。',
    'tour.assignment.title': '== のつもりで =',
    'tour.assignEdit.title': '急ぎの経費を先に',
    'tour.assignEdit.text': '急ぎの経費はマネージャーに回したいので、最初の条件を `in.urgent = true` にします。Designer は何も報告しません。',
    'tour.assignRan.title': 'すべての経費がマネージャーへ',
    'tour.assignRan.text': '急ぎでない 120 CHF の経費がマネージャーに回り、`urgent` が true になっています。`=` が1つだと代入です。条件が urgent に true を設定し、その値 true で出口が決まります。',
    'tour.assignFix.title': '直し方',
    'tour.assignFix.text': '比較には `==` を使います: `in.urgent == true`、または単に `in.urgent`。'
  }
};
