/**
 * Walkthrough 3.9 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Embedded Subprocess ("folds a part of a process
 * into a box"), BPMN Activities ("behave similar to a Embedded Subprocess, but their purpose
 * is different"), Error Handling ("Each process - including the embedded subprocess - is a
 * separate process level"). The tabs are the Designer's (General only, no tags). That the
 * same data goes in and out, and that an empty box keeps the token, were read on the Designer's
 * engine 14.0.1 (PROGRESS.md, "Part 3, checked on the engine").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Folding part of a process into a box',
    'tour.intro.text': 'An order is checked, priced and packed. Each of the three steps is a box with a small process inside: an Embedded Subprocess and two BPMN activities. You jump into a box, watch the token go in and out, and see why an empty box stops a process without a word.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.box': 'A box with a process inside',
    'tour.chapter.run': 'In and out',
    'tour.chapter.bpmn': 'BPMN activities',
    'tour.chapter.mistakes': 'Common mistake',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': 'One mistake',

    'tour.embedded.title': 'An Embedded Subprocess',
    'tour.embedded.text': '"Check the order" is an Embedded Subprocess: part of the process folded into a box. The small square with the plus says there is more inside.',
    'tour.inside.title': 'Inside the box',
    'tour.inside.text': 'The box opens like a process of its own; the line above the canvas shows where you are and leads back up. Inside: two steps between an Embedded Start and an Embedded End.',
    'tour.ends.title': 'One start, one end per connector',
    'tour.ends.text': 'Each connector into the box has its Embedded Start ("in 1"), each connector out of it its Embedded End ("out 1"). They are the doors of the box.',

    'tour.goesIn.title': 'Into the box',
    'tour.goesIn.text': 'The token reaches the box and goes in, at the Embedded Start of the connector it came by.',
    'tour.sameData.title': 'The same data',
    'tour.sameData.text': 'Inside, the steps work on the same process data as outside. The box is part of the process, not another one: nothing is passed, nothing is returned.',
    'tour.comesOut.title': 'Out again',
    'tour.comesOut.text': 'At the Embedded End the token leaves by the connector of that end and goes on outside.',
    'tour.done.title': 'Checked, priced, packed',
    'tour.done.text': 'The two BPMN activities ran their insides the same way: 6 chairs at 12.50 CHF, 75 CHF.',

    'tour.bpmnScript.title': 'A BPMN Script Activity',
    'tour.bpmnScript.text': '"Calculate the total" is a box like the one before, but its icon tells what kind of work it is: the engine itself does it.',
    'tour.bpmnManual.title': 'A BPMN Manual Activity',
    'tour.bpmnManual.text': '"Pack the parcel" is done by a person, without IT. The box shows that in the diagram; what the process does at that point is inside it.',
    'tour.generalOnly.title': 'Only General',
    'tour.generalOnly.text': 'A box has nothing to configure but its name and description; it has no tags either. What it does is the process inside.',
    'tour.eight.title': 'Eight kinds',
    'tour.eight.text': 'Generic, User, Manual, Script, Receive, Rule, Send and Service: eight BPMN activities in the palette. All behave like an Embedded Subprocess; they differ in what they say to the reader of the diagram.',

    'tour.emptyBox.title': 'An empty box',
    'tour.emptyInside.title': 'Nothing inside',
    'tour.emptyInside.text': '"Pack the parcel" is now empty, as a BPMN activity is when it comes from the palette.',
    'tour.emptyRan.title': 'In, and never out',
    'tour.emptyRan.text': 'The token went into the empty box and did not come out: the process end is never reached. No error, nothing in the Runtime Log. The engine does the same.',
    'tour.emptyFix.title': 'How to fix it',
    'tour.emptyFix.text': 'A box on its own does nothing. Model what happens inside it, from its Embedded Start to its Embedded End, or leave the box out.'
  },
  ja: {
    'tour.intro.title': 'プロセスの一部をボックスにまとめる',
    'tour.intro.text': '注文をチェックし、価格を計算し、梱包します。3つのステップはそれぞれ、中に小さなプロセスを持つボックスです: Embedded Subprocess が1つと BPMN アクティビティが2つ。ボックスの中に入り、トークンが出入りする様子を見て、空のボックスがなぜ何も言わずにプロセスを止めるのかを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.box': '中にプロセスがあるボックス',
    'tour.chapter.run': '入って出る',
    'tour.chapter.bpmn': 'BPMN アクティビティ',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い 1 件',

    'tour.embedded.title': 'Embedded Subprocess',
    'tour.embedded.text': '「Check the order」は Embedded Subprocess です。プロセスの一部をボックスにまとめたものです。+ の付いた小さな四角は、中にまだあることを示します。',
    'tour.inside.title': 'ボックスの中',
    'tour.inside.text': 'ボックスは1つのプロセスのように開きます。キャンバスの上の行が現在の場所を示し、そこから上に戻れます。中には、Embedded Start と Embedded End の間に2つのステップがあります。',
    'tour.ends.title': 'コネクターごとに開始と終了が1つ',
    'tour.ends.text': 'ボックスに入るコネクターごとに Embedded Start（「in 1」）が、出るコネクターごとに Embedded End（「out 1」）があります。ボックスの扉です。',

    'tour.goesIn.title': 'ボックスの中へ',
    'tour.goesIn.text': 'トークンがボックスに到達し、通ってきたコネクターの Embedded Start から中に入ります。',
    'tour.sameData.title': '同じデータ',
    'tour.sameData.text': '中のステップは、外と同じプロセスデータで動きます。ボックスは別のプロセスではなく、このプロセスの一部です。何かを渡すことも、返すこともありません。',
    'tour.comesOut.title': 'また外へ',
    'tour.comesOut.text': 'Embedded End で、トークンはその終了のコネクターから出て、外で先に進みます。',
    'tour.done.title': 'チェック、価格、梱包',
    'tour.done.text': '2つの BPMN アクティビティも、同じように中を実行しました。椅子 6 脚、1 脚 12.50 CHF で 75 CHF です。',

    'tour.bpmnScript.title': 'BPMN Script Activity',
    'tour.bpmnScript.text': '「Calculate the total」は前のものと同じようなボックスですが、アイコンが作業の種類を示します。Engine 自身が行う作業です。',
    'tour.bpmnManual.title': 'BPMN Manual Activity',
    'tour.bpmnManual.text': '「Pack the parcel」は、IT を使わずに人が行います。ボックスはそれを図の中で示し、その時点でプロセスが行うことはボックスの中にあります。',
    'tour.generalOnly.title': '「一般」だけ',
    'tour.generalOnly.text': 'ボックスで設定するのは名前と説明だけで、タグもありません。何をするかは、中のプロセスで決まります。',
    'tour.eight.title': '8種類',
    'tour.eight.text': 'Generic、User、Manual、Script、Receive、Rule、Send、Service。パレットには8つの BPMN アクティビティがあります。どれも Embedded Subprocess と同じように動き、図を読む人に伝える意味が違います。',

    'tour.emptyBox.title': '空のボックス',
    'tour.emptyInside.title': '中に何もない',
    'tour.emptyInside.text': '「Pack the parcel」が空になりました。パレットから置いたばかりの BPMN アクティビティはこの状態です。',
    'tour.emptyRan.title': '入ったまま出てこない',
    'tour.emptyRan.text': 'トークンは空のボックスに入り、出てきませんでした。プロセスの終了には決して届きません。エラーもなく、ランタイムログにも何もありません。Engine でも同じです。',
    'tour.emptyFix.title': '直し方',
    'tour.emptyFix.text': 'ボックスだけでは何も起こりません。中で起こることを Embedded Start から Embedded End までモデル化するか、ボックスを置かないようにします。'
  }
};
