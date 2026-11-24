/**
 * Walkthrough 3.6 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Alternative (used "to build loops in the process
 * flow"), Join ("waits until all of the parallel incoming process paths have finished and
 * reached this element"). That nothing stops a loop on the engine (a probe ran 10 000 rounds)
 * and that a Join reached by one path keeps the token were read on the Designer's engine
 * 14.0.1 (PROGRESS.md, "Part 3, checked on the engine").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Coming back together, and loops',
    'tour.intro.text': 'Reminders go out for an invoice until it is paid, or until the third one has gone out unpaid. An Alternative sends the token back to repeat a step, and another one brings two paths together again. Then two mistakes: a loop that never ends, and a Join where an Alternative belongs.',
    'tour.intro.duration': 'about 3 min, 4 with the voice',
    'tour.chapter.loop': 'Going back',
    'tour.chapter.rounds': 'Two rounds',
    'tour.chapter.together': 'Coming back together',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.loopShape.title': 'An exit that goes back',
    'tour.loopShape.text': '"Paid?" has three exits. The last one, "again", leads back to "Send a reminder": a loop.',
    'tour.paidRow.title': 'The way out: paid',
    'tour.paidRow.text': 'First question: has the customer paid by now? This request tells after which reminder they pay.',
    'tour.collectionRow.title': 'The way out: enough reminders',
    'tour.collectionRow.text': 'After three unpaid reminders the invoice goes to collection. This row makes sure the loop ends.',
    'tour.againRow.title': 'Otherwise, once more',
    'tour.againRow.text': 'The empty row takes everything else: back to "Send a reminder", which counts one more.',

    'tour.again.title': 'Back again',
    'tour.again.text': 'Not paid after the first reminder: the token went back, and the step runs a second time with the same data.',
    'tour.paidNow.title': 'Paid',
    'tour.paidNow.text': 'After the second reminder, the first condition is true and the token leaves the loop.',
    'tour.roundsLog.title': 'Two reminders',
    'tour.roundsLog.text': 'The Runtime Log has one line per round, then the archive line.',

    'tour.collection.title': 'Three reminders, not paid',
    'tour.collection.text': 'This customer never pays. After the third reminder the second condition is true.',
    'tour.merge.title': 'The paths meet again',
    'tour.merge.text': 'Both ways out of the loop lead to this Alternative. It has one exit with an empty condition: whichever path the token comes by, it goes on to "Archive".',
    'tour.archive.title': 'One step for both',
    'tour.archive.text': 'What both outcomes need is modelled once, after the paths have met.',

    'tour.endless.title': 'A loop that never ends',
    'tour.counterGone.title': 'The counter is gone',
    'tour.counterGone.text': 'The line that counts the reminders is deleted. The step still logs a reminder, but `in.reminders` stays 0.',
    'tour.endlessRan.title': 'Round after round',
    'tour.endlessRan.text': 'Neither way out ever becomes true, so the token goes round and round. The simulation stops the run; on the engine nothing does: a probe ran 10 000 rounds without being stopped.',
    'tour.endlessFix.title': 'How to fix it',
    'tour.endlessFix.text': 'In every round, change what the conditions read, here the counter, and give the loop a way out that is sure to come, here the third reminder.',
    'tour.joinMerge.title': 'A Join to bring paths together',
    'tour.joinPlaced.title': 'A Join instead of the Alternative',
    'tour.joinPlaced.text': 'The element where the two ways out meet is now a Join.',
    'tour.joinRan.title': 'Waiting for ever',
    'tour.joinRan.text': 'A Join waits until a token has come in on every incoming connector. Only one path was taken, so it waits for the other: "Archive" never runs, and the Runtime Log reports no error.',
    'tour.joinFix.title': 'How to fix it',
    'tour.joinFix.text': 'Bring alternative paths together with an Alternative. A Join only closes paths that a Split has opened (walkthrough 3.7).'
  },
  ja: {
    'tour.intro.title': '合流とループ',
    'tour.intro.text': '請求書が支払われるまで、または未払いのまま3回目の督促が出るまで、督促を送ります。Alternative がトークンを戻してステップを繰り返させ、別の Alternative が2つのパスを再び1つにします。最後に2つの間違い: 終わらないループと、Alternative の代わりに置いた Join です。',
    'tour.intro.duration': '約3分（音声ありで約4分）',
    'tour.chapter.loop': '戻る',
    'tour.chapter.rounds': '2周',
    'tour.chapter.together': '合流',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.loopShape.title': '戻る出口',
    'tour.loopShape.text': '「Paid?」には出口が3つあります。最後の「again」は「Send a reminder」に戻ります。ループです。',
    'tour.paidRow.title': '出口: 支払われた',
    'tour.paidRow.text': '最初の問い: 顧客はもう支払ったか。このリクエストは、何回目の督促の後に支払うかを伝えます。',
    'tour.collectionRow.title': '出口: 督促が十分',
    'tour.collectionRow.text': '3回督促しても未払いなら、請求書は回収に回ります。この行があるので、ループは必ず終わります。',
    'tour.againRow.title': 'それ以外は、もう一度',
    'tour.againRow.text': '空の行がそれ以外をすべて引き受けます。「Send a reminder」に戻り、そこで1回数えます。',

    'tour.again.title': 'また戻る',
    'tour.again.text': '1回目の督促の後は未払いでした。トークンが戻り、同じデータでステップが2回目の実行をします。',
    'tour.paidNow.title': '支払われた',
    'tour.paidNow.text': '2回目の督促の後、最初の条件が true になり、トークンはループを出ます。',
    'tour.roundsLog.title': '督促2回',
    'tour.roundsLog.text': 'ランタイムログには1周ごとに1行、最後にアーカイブの行があります。',

    'tour.collection.title': '督促3回、未払い',
    'tour.collection.text': 'この顧客は支払いません。3回目の督促の後、2つ目の条件が true になります。',
    'tour.merge.title': 'パスが再び出会う',
    'tour.merge.text': 'ループを出る2つの道は、どちらもこの Alternative に続きます。出口は1つで条件は空です。トークンがどのパスから来ても、「Archive」に進みます。',
    'tour.archive.title': '両方に1つのステップ',
    'tour.archive.text': 'どちらの結果にも必要なことは、パスが合流した後に1回だけモデル化します。',

    'tour.endless.title': '終わらないループ',
    'tour.counterGone.title': 'カウンターがない',
    'tour.counterGone.text': '督促を数える行を削除しました。ステップは督促をログに書きますが、`in.reminders` は 0 のままです。',
    'tour.endlessRan.title': '何周も',
    'tour.endlessRan.text': 'どちらの出口も true にならないので、トークンは回り続けます。シミュレーションは実行を止めますが、Engine では何も止めません。プローブでは 10 000 周しても止まりませんでした。',
    'tour.endlessFix.title': '直し方',
    'tour.endlessFix.text': '1周ごとに、条件が読むもの（ここではカウンター）を変え、必ず来る出口（ここでは3回目の督促）を用意します。',
    'tour.joinMerge.title': 'パスを合流させる Join',
    'tour.joinPlaced.title': 'Alternative の代わりに Join',
    'tour.joinPlaced.text': '2つの出口が出会う要素を Join にしました。',
    'tour.joinRan.title': 'いつまでも待つ',
    'tour.joinRan.text': 'Join は、入ってくるすべてのコネクターからトークンが来るまで待ちます。通ったのは1つのパスだけなので、もう1つを待ち続けます。「Archive」は実行されず、ランタイムログにもエラーは出ません。',
    'tour.joinFix.title': '直し方',
    'tour.joinFix.text': '分かれた別々のパスは Alternative で合流させます。Join が閉じるのは、Split が開いたパスだけです（ウォークスルー 3.7）。'
  }
};
