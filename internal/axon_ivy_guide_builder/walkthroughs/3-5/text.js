/**
 * Walkthrough 3.5 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Alternative ("The conditions are evaluated from
 * the top to the bottom and the exit of the first one that evaluates to true is chosen"). What
 * happens when no condition is true, and the Designer's message for `out`, were read on the
 * Designer and its engine 14.0.1 (PROGRESS.md, "Part 3, checked on the engine").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Several conditions',
    'tour.intro.text': 'A shipment goes by freight, as a parcel or as a letter, depending on its weight. One Alternative with three exits decides. You see why the order of its conditions matters, what the empty last row is for, and three mistakes.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.order': 'Top to bottom',
    'tour.chapter.heavy': '35 kg',
    'tour.chapter.light': '1 kg',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.rows.title': 'Three exits, three rows',
    'tour.rows.text': 'One row per exit. The rows are tried from the top, and the first condition that is true decides. The order of the rows is the order of the questions.',
    'tour.first.title': 'Heavy first',
    'tour.first.text': 'More than 30 kg goes by freight.',
    'tour.second.title': 'Then the parcels',
    'tour.second.text': 'More than 2 kg goes as a parcel. This row only gets what the row above did not take: between 2 and 30 kg.',
    'tour.last.title': 'The rest',
    'tour.last.text': 'The last row is empty, so it is always true. Whatever is left goes as a letter. An empty row at the end makes sure some exit is always taken.',

    'tour.tried.title': 'Two conditions are true',
    'tour.tried.text': '35 kg is more than 30 and more than 2. Both rows would hold, but the first one is tried first.',
    'tour.freight.title': 'Freight',
    'tour.freight.text': 'The first true condition decides. The second one is not tried at all.',
    'tour.letter.title': 'None of them, so the empty one',
    'tour.letter.text': '1 kg is neither more than 30 nor more than 2. The empty last row takes it.',
    'tour.carrier.title': 'A letter',
    'tour.carrier.text': 'Every weight gets a carrier, because the last row takes everything.',

    'tour.wrongOrder.title': 'The wider condition first',
    'tour.moved.title': 'Parcels above freight',
    'tour.moved.text': 'The Parcel row is moved above the Freight row. Each condition is still right on its own.',
    'tour.movedRan.title': '35 kg as a parcel',
    'tour.movedRan.text': 'More than 2 kg is now asked first, and 35 kg is more than 2. The Freight row is never reached for any weight.',
    'tour.movedFix.title': 'How to fix it',
    'tour.movedFix.text': 'Put the narrower condition first: more than 30 before more than 2. Or make each row exact on its own: `in.weight > 2 && in.weight <= 30`.',
    'tour.noneTrue.title': 'No row is true',
    'tour.lastEdit.title': 'A condition on the last row',
    'tour.lastEdit.text': 'The last row now asks `in.weight > 0`: letters must weigh something.',
    'tour.noneRan.title': 'The request fails',
    'tour.noneRan.text': 'This request sent no weight, so it is 0, and no row is true. The Runtime Log: Problem while processing request, caused by IllegalStateException: In the alternative all conditions evaluate to false. The Designer warned of nothing.',
    'tour.noneFix.title': 'How to fix it',
    'tour.noneFix.text': 'Keep the last row empty, so that some exit always holds. Check for missing values on a path of their own if they need one.',
    'tour.outCondition.title': 'out in a condition',
    'tour.outMarked.title': 'The Designer marks it',
    'tour.outMarked.text': 'The first condition now reads `out.weight`. The Designer reports: Condition #1: Variable \'out\' cannot be resolved.',
    'tour.outFix.title': 'How to fix it',
    'tour.outFix.text': 'An Alternative does not change the data, it only reads it: its conditions use `in`.'
  },
  ja: {
    'tour.intro.title': '複数の条件',
    'tour.intro.text': '重さによって、貨物便、小包、手紙のどれで送るかが決まります。決めるのは出口が3つある1つの Alternative です。条件の順序がなぜ大切なのか、空の最後の行が何のためにあるのか、そして3つの間違いを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.order': '上から下へ',
    'tour.chapter.heavy': '35 kg',
    'tour.chapter.light': '1 kg',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.rows.title': '3つの出口、3つの行',
    'tour.rows.text': '出口ごとに1行です。行は上から試され、最初に true になった条件が決めます。行の順序が、問いの順序です。',
    'tour.first.title': '重いものから',
    'tour.first.text': '30 kg を超えるものは貨物便です。',
    'tour.second.title': '次に小包',
    'tour.second.text': '2 kg を超えるものは小包です。この行に来るのは、上の行が選ばなかったもの、つまり 2〜30 kg だけです。',
    'tour.last.title': '残り',
    'tour.last.text': '最後の行は空なので、常に true です。残ったものは手紙になります。最後に空の行があれば、必ずどれかの出口が選ばれます。',

    'tour.tried.title': '2つの条件が true',
    'tour.tried.text': '35 kg は 30 を超え、2 も超えます。どちらの行も当てはまりますが、先に試されるのは最初の行です。',
    'tour.freight.title': '貨物便',
    'tour.freight.text': '最初に true になった条件が決めます。2つ目はまったく試されません。',
    'tour.letter.title': 'どれでもないので空の行',
    'tour.letter.text': '1 kg は 30 も 2 も超えません。空の最後の行が引き受けます。',
    'tour.carrier.title': '手紙',
    'tour.carrier.text': '最後の行がすべてを引き受けるので、どの重さにも送り方が決まります。',

    'tour.wrongOrder.title': '広い条件が先',
    'tour.moved.title': '小包を貨物便の上に',
    'tour.moved.text': '小包の行を貨物便の行の上に移しました。それぞれの条件は、単独で見れば正しいままです。',
    'tour.movedRan.title': '35 kg が小包に',
    'tour.movedRan.text': '今は「2 kg を超える」が先に問われ、35 kg は 2 を超えます。どの重さでも、貨物便の行には決して届きません。',
    'tour.movedFix.title': '直し方',
    'tour.movedFix.text': '狭い条件を先に置きます。「30 を超える」を「2 を超える」より前に。または、各行をそれだけで正確にします: `in.weight > 2 && in.weight <= 30`。',
    'tour.noneTrue.title': 'どの行も true にならない',
    'tour.lastEdit.title': '最後の行に条件',
    'tour.lastEdit.text': '最後の行が `in.weight > 0` を問うようになりました。手紙にも重さがあるはず、という考えです。',
    'tour.noneRan.title': 'リクエストが失敗する',
    'tour.noneRan.text': 'このリクエストは重さを送らなかったので 0 になり、どの行も true になりません。ランタイムログ: Problem while processing request、原因は IllegalStateException: In the alternative all conditions evaluate to false。Designer は何も警告していませんでした。',
    'tour.noneFix.title': '直し方',
    'tour.noneFix.text': '最後の行は空のままにして、必ずどれかの出口が選ばれるようにします。値がないときに別の処理が必要なら、そのためのパスを作ります。',
    'tour.outCondition.title': '条件に out',
    'tour.outMarked.title': 'Designer が指摘する',
    'tour.outMarked.text': '最初の条件が `out.weight` を読むようになりました。Designer の報告: Condition #1: Variable \'out\' cannot be resolved。',
    'tour.outFix.title': '直し方',
    'tour.outFix.text': 'Alternative はデータを変えず、読むだけです。条件では `in` を使います。'
  }
};
