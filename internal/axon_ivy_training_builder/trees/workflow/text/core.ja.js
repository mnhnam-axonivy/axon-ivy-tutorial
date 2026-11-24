/**
 * The Workflow tree in Japanese: the tree's own page texts (ui), the labels every film shares
 * (film), and the root and the bosses (nodes).
 *
 * Per skill: its name, a hook, the skill in one sentence (def), its film's title and subtitles
 * (show), the film's own labels, its myths (three of { myth, fact }: what people think, and what is true) and the check (q, options, why; the right
 * option is `answer` in nodes.js). In texts: **bold**, `code`, and [[id]] or [[id|words]] for a
 * link to another skill.
 */
export const ui = {
  kicker: 'Axon Ivy トレーニング · ワークフロー',
  introTitle: '要素、タスク、ケース、そして人: プロセスが仕事を進めるしくみ。',
  introBody: '4つのブランチ、5つのレベル。各スキルは短い動画、めくって確かめる3つの誤解、そして次を解放する1問でできています。同じレベルの中では、ブランチをどの順で進めてもかまいません。レベルの最後のボスには4つすべてが必要で、自分で組み立てるプロセスが待っています。',
  branch_element: '要素',
  branch_task: 'タスク',
  branch_case: 'ケース',
  branch_people: '人',
  level1: 'レベル 1 · 最初のプロセス',
  level2: 'レベル 2 · 判断と連絡',
  level3: 'レベル 3 · 時間と引き継ぎ',
  level4: 'レベル 4 · 並行',
  level5: 'レベル 5 · 詳細',
  complete: 'ツリー完成 🏆',
  completeBody: 'プロセスが何でできているか、そして Axon Ivy が仕事を人に渡すしくみが分かりました。要素、タスクとケースとは何か、ユーザーとは誰か、そしてロールが誰に何を渡すかを決めること。',
  disclaimer: 'Axon Ivy 14.0.1 で確認済み: 公式ドキュメント、Designer、そして Engine 上のプローブプロセス。'
};

export const film = {
  anna: 'アンナ',
  max: 'マックス',
  hanna: 'ハンナ',
  ben: 'ベン',
  chloe: 'クロエ',
  lea: 'レア',
  developer: 'Developer',
  taskList: 'タスクリスト',
  open: 'オープン',
  inProgress: '作業中',
  done: '完了',
  delayed: '遅延中',
  high: '高',
  normal: 'ノーマル',
  low: '低',
  everybody: 'Everybody',
  manager: 'Manager',
  hr: 'HR',
  system: 'SYSTEM',
  responsible: '担当',
  priority: '優先度',
  delay: '遅延',
  expiry: '有効期限',
  timeout: 'タイムアウト',
  taskTab: 'タスク',
  name: '名前',
  roles: 'ロール',
  userFromAttr: '属性からのユーザー',
  roleFromAttr: '属性からのロール',
  category: 'カテゴリー',
  customFields: 'カスタムフィールド',
  notification: '通知',
  membersFromAttr: '属性からのメンバー',
  leaveOf: '休暇: {0}',
  output: '出力',
  userTask: 'User Task',
  taskSwitch: 'Task Switch Event',
  taskSwitchGateway: 'Task Switch Gateway',
  approveLeave: '休暇の承認: アンナ',
  contract: '契約書の確認',
  days: '日数',
  from: '開始日',
  monday: '月曜日',
  threeDays: '3日間',
  caseOf: 'ケース: {0}',
  employee: 'Employee',
  taskWord: 'タスク',
  caseWord: 'ケース',
  userWord: 'ユーザー',
  roleWord: 'ロール',
  elementWord: '要素',
  peopleWord: '人',
  creator: 'CREATOR',
  start: 'Start',
  requestTab: 'リクエスト',
  sessionUser: 'セッションユーザー: {0}'
};

export const nodes = {
  workflow: {
    name: 'ワークフロー',
    hook: '人が必要なプロセス。',
    def: '**ワークフロー**は、人に仕事を渡し、その人を待つプロセスです。要素から組み立てられ、ケースとタスクとして動き、ふさわしいロールを持つユーザーが作業します。',
    show: {
      title: '動いていく仕事',
      process: 'プロセスは計画です。ステップが順番に並び、その多くは Engine が自分で実行します。',
      people: 'でも、人が必要な仕事もあります。ワークフローはそれを人に渡し、待ちます。',
      four: '必要なものは4つです。要素: プロセスを組み立てる部品。タスク: 仕事のひとまとまり。ケース: プロセスの1回分の実行。そして人: ユーザーと、その人たちが持つロール。',
      tree: 'これがこのツリーの4つのブランチです。レベルは5つ。どのレベルも最後はボス、つまり自分で組み立てるプロセスです。レベル 1 の好きなブランチから始めましょう。'
    },
    labels: { check: 'チェック', approve: '承認', book: '登録', waits: '人を待っている' },
    myths: [
      { myth: 'ワークフローはプロセスと同じものだ。', fact: 'プロセスは計画です。ワークフローは動いている計画です。ケースが開始され、タスクが待ち、ふさわしいロールを持つユーザーがそれを行います。' },
      { myth: 'ワークフローでは、すべてのステップを人が行う。', fact: '多くのステップは Engine が自分で行います。ワークフローは、人が必要な仕事だけを人に渡し、待ちます。' },
      { myth: 'ワークフローを理解するには、何十もの概念が要る。', fact: '始めるには4つで足ります。タスクは1つの仕事、ケースはプロセスの1回分の実行、ユーザーは1人の人、ロールは同じ仕事をするグループです。' }
    ],
    q: 'プロセスをワークフローにするものは何ですか？',
    options: ['ステップが10個より多いこと', '人に仕事を渡し、その人を待つこと', 'Designer で描かれていること'],
    why: 'ワークフローの中心は人です。人のためにタスクを作り、終わったら先へ進みます。'
  },

  boss1: {
    name: '最初の承認',
    hook: 'レベル 1 のボス: 4つのブランチを1つのプロセスで。',
    def: 'レベル 1 のまとめ: [[onestart|開始]]が[[case|ケース]]と最初の[[task|タスク]]を作り、[[usertask|User Task]] が仕事を[[role|ロール]]に渡し、そのロールを持つ[[user|ユーザー]]が行います。',
    show: {
      title: '最初の承認',
      start: 'アンナが休暇プロセスを開始します。ケースと、その最初のタスクができます。フォームに入力して送信します。',
      usertask: 'User Task が次のタスクを、ロール Manager 向けに作ります。ケースは RUNNING、タスクはオープンです。',
      max: 'マックスはロール Manager を持っています。タスクリストでタスクを見つけ、開始します。作業中です。',
      done: 'マックスが承認します。タスクは完了し、それが最後のタスクなので、ケースも完了です。'
    },
    labels: { request: '申請', approve: '承認', approveCard: '承認: アンナ', running: 'RUNNING', caseDone: 'DONE' },
    myths: [
      { myth: '仕事を動かすのはプロセス。ユーザーとロールは別の人の仕事だ。', fact: 'プロセスはロールの名前を挙げるだけです。実際に誰が仕事を受け取るかは、どのユーザーがそのロールを持つかで決まります。両方が合っている必要があります。' },
      { myth: 'アンナが申請を送信したら、ケースは完了だ。', fact: '送信で終わるのは、アンナのタスクだけです。User Task が Manager 向けのタスクをもう1つ作り、マックスが終えるまでケースは RUNNING のままです。' },
      { myth: 'マックスに承認が届くのは、アンナがマックスを選んだからだ。', fact: '誰も選んでいません。タスクはロール Manager 向けで、マックスがそのロールを持っているので、自分のタスクリストで見つけます。' }
    ],
    q: 'アンナが申請を送信しました。次はロール Manager 向けの User Task で、マックスはそのロールを持っています。ケースが完了するには、何が起きる必要がありますか？',
    options: ['マックスがタスクを開始し、終える', 'アンナが自分で承認する', '何も。ひとりでに終わる'],
    why: 'タスクは Manager 向けなので、そのロールを持つユーザーを待ちます。マックスが終えると最後のタスクが完了し、ケースも完了します。'
  },

  boss2: {
    name: '承認か却下か',
    hook: 'レベル 2 のボス: 判断し、知らせるプロセス。',
    def: 'レベル 2 のまとめ: [[userdialog|ダイアログ]]が判断を[[data|プロセスデータ]]に入れ、[[alternative|Alternative]] が進む道を選び、答えが「いいえ」なら [[email|E-Mail]] が申請した本人に知らせます。',
    show: {
      title: '「はい」か、メール付きの「いいえ」',
      request: 'アンナが休暇を申請します。これまでどおり、タスクはロール Manager 向けで、マックスに届きます。',
      decide: 'マックスがダイアログで判断します。その結果がプロセスデータに入ります。approved が true か false か。',
      yes: 'Alternative がそれを見ます。承認なら休暇が登録され、アンナのケースは完了です。',
      no: '別のケース、ベンの申請です。マックスは却下し、同じ Alternative がトークンをもう一方へ送ります。',
      mail: 'そこで E-Mail ステップがベンに書きます。タスクはなく、誰も待ちません。ベンのケースも完了です。'
    },
    labels: { request: '申請', decide: '判断', book: '休暇の登録', sayNo: '断りの連絡', yes: 'はい', no: 'いいえ', annaCase: 'アンナのケース', benCase: 'ベンのケース', approvedTrue: 'approved: true', approvedFalse: 'approved: false', approveBtn: '承認', rejectBtn: '却下', done: 'ケース完了' },
    myths: [
      { myth: '判断には、承認用と却下用の2つのタスクが必要だ。', fact: 'タスクは1つで足ります。判断はプロセスデータの値で、タスクの後の [[alternative|Alternative]] が進む道を選びます。' },
      { myth: '誰かに知らせるには、その人にタスクを渡すしかない。', fact: '[[email|E-Mail]] ステップなら、タスクなしで知らせられます。メールが送られ、プロセスは先へ進みます。' },
      { myth: 'Alternative の後は両方のパスが実行され、違うほうは何もしないだけだ。', fact: '1つのケースで実行されるパスは1つだけです。条件が最初に true になった出口です。別のケースでは、もう一方かもしれません。' }
    ],
    q: 'マックスがベンの申請を却下しました。Alternative の行は 1. `in.approved` → 休暇の登録、2.（空）→ 断りの連絡 です。何が起きますか。',
    options: ['休暇が登録される', 'メールが送られ、ケースが完了する', 'プロセスが失敗する: どの条件も true でない'],
    why: '1行目は false です。2行目は空なので true です。トークンは E-Mail ステップへ進み、その後にすることは残っていません。'
  },

  boss3: {
    name: '承認ワークフロー',
    hook: 'レベル 3 のボス: 途中で止まらない承認。',
    def: 'レベル 3 のまとめ: [[userattr|ふさわしい人]]への [[usertask|User Task]]、不在のときの[[expiry|有効期限]]、そして誰の手も借りずに仕上げる [[system|SYSTEM]]。',
    show: {
      title: '休暇: 申請から登録まで',
      start: 'アンナが休暇申請を開始します。新しいケースです。アンナがフォームに入力します。',
      approve: 'プロセスデータから、アンナのマネージャー max 向けの User Task。プロセスは待ちます。',
      away: 'マックスは不在です。2日後にタスクは期限切れになり、優先度「高」で HR に渡ります。',
      hr: 'ハンナが承認します。',
      system: 'SYSTEM 向けの Task Switch が、人事システムに休暇を登録します。誰もクリックしません。',
      done: '最後のタスクが完了し、ケースも完了です。アンナの休暇は登録されました。'
    },
    labels: { request: '申請', approve: '承認', book: '登録', approveCard: '承認: アンナ', done: 'ケース完了' },
    myths: [
      { myth: 'ワークフローは、正常なパスが動けば完成だ。', fact: 'ほかの問いにも答えましょう。誰がタスクを見られるか（[[responsible|担当]]）、その人が不在なら誰がやるか（[[expiry|有効期限]]）、誰も要らずに動くのは何か（[[system|SYSTEM]]）。' },
      { myth: '優先度を「高」にすれば、タスクが放置されることはない。', fact: '優先度はリストの順番を決めるだけで、遅延はタスクを隠すだけです。待っているタスクを期限内に別の人へ渡すのは、有効期限です。' },
      { myth: '休暇の登録には、HR の誰かのクリックが必要だ。', fact: 'Task Switch がそのタスクを SYSTEM に渡します。Engine が自分で休暇を登録し、誰もクリックしません。' }
    ],
    q: 'マックスは3週間不在です。アンナの申請が、その間ずっとマックスを待たないようにするのはどれですか？',
    options: ['優先度「高」', '3週間の遅延', 'タスクを HR に渡す有効期限'],
    why: '優先度はリストの順番を決めるだけで、遅延はタスクを隠すだけです。有効期限なら、間に合ううちに別の人に渡せます。'
  },

  boss4: {
    name: '並んで進む',
    hook: 'レベル 4 のボス: 一度に2つ以上のこと。',
    def: 'レベル 4 のまとめ: 人が並んで行うことには [[gateway|Task Switch Gateway]]、結果を申請した本人に返すには [[creator|CREATOR]]、Engine が並んで行うことには [[split|Split]] と [[joinpaths|Join]]。',
    show: {
      title: '2種類の「同時に」',
      people: 'アンナの申請には確認が2つ必要です。Task Switch Gateway が2つのタスクを作り、マックスとハンナが並んで作業します。',
      joinTasks: '2つ目のゲートウェイは両方を待ちます。それから CREATOR、つまりケースを開始したアンナ向けのタスクを1つ作ります。',
      engine: 'アンナが確定します。残りに人は要りません。休暇を登録し、アンナにメールを送ります。',
      split: 'Split は、同じタスクの中で両方のパスへトークンを送ります。Join がふたたび1つにします。',
      point: 'タスクを並べるなら Task Switch Gateway。ステップを並べるなら Split と Join。どちらも、すべてのパスを待ちます。'
    },
    labels: { mgr: 'マネージャーの確認', hr: 'HR の確認', confirm: '確定', book: '休暇の登録', tell: 'アンナに連絡', tasksWord: 'タスクを並べる: Task Switch Gateway', stepsWord: 'ステップを並べる: Split と Join' },
    myths: [
      { myth: '同時に仕事をするとは、いつもタスクが複数あるということだ。', fact: '人が並んで作業するときだけです。[[gateway|Task Switch Gateway]] がパスごとにタスクを作ります。Engine のステップは、[[split|Split]] の後、1つのタスクの中で並んで進みます。' },
      { myth: '並行するパスのどれか1つが終われば、プロセスは先へ進む。', fact: 'どちらも、すべてのパスを待ちます。[[joinpaths|Join]] はすべてのトークンを、[[join|合流する Task Switch Gateway]] はすべてのタスクを待ちます。' },
      { myth: '確認の後のタスクは、ロールに渡すしかない。', fact: 'プロセスが自分で見つける1人に渡せます。[[creator|CREATOR]] は、ケースを開始したユーザーです。' }
    ],
    q: '承認の後、休暇の登録とメールの送信を、どちらも Engine が並んで行います。どの要素を使いますか。',
    options: ['Split と Join', '2つの Task Switch Gateway', 'Alternative'],
    why: 'Split は同じタスクの中ですべてのパスを進め、Join がそれを1つにします。Task Switch Gateway はタスクを作ってしまい、Alternative は1つのパスしか選びません。'
  },

  boss5: {
    name: 'ビジネスケース全体',
    hook: '最後のボス: すべてを、1つの物語で。',
    def: 'すべてを合わせます。従業員だけが使える[[permission|開始]]、[[join|並行する確認]]、不在のときの[[substitute|代理]]、そして同じ[[businesscase|ビジネスケース]]の中で[[trigger|トリガー]]されるワークフロー。',
    show: {
      title: '休暇、物語の全体',
      start: 'アンナが休暇申請を開始します。開始できるのは従業員だけ。Start の権限がそう決めています。',
      parallel: '2つの確認が同時に進みます。アンナの上司マックスだけに宛てた確認と、HR の確認。合流するゲートウェイが両方を待ちます。',
      away: 'マックスは不在です。そのタスクはマックスだけに宛てたものなので、代理のレアが代わりに開始します。',
      trigger: '承認されました。Trigger Step が登録を始めます。同じビジネスケースの中の、2つ目のケースです。',
      system: '登録のタスクは SYSTEM のものです。ひとりでに実行されます。',
      done: '2つのケースが完了しました。ビジネスケースが、アンナの休暇の物語全体を持っています。'
    },
    labels: { request: '申請', mgr: 'Manager', hr: 'HR', trig: 'Trigger', leaveCase: '休暇', bookingCase: '登録', bc: 'ビジネスケース', absent: '不在', subst: '代理' },
    myths: [
      { myth: '大きなワークフローには、小さなものにはない特別な技が要る。', fact: '同じ少数のものの組み合わせです。タスク、ケース、ユーザー、ロール。そのどれも、もう1つずつ見てきました。' },
      { myth: '登録は、休暇のケースの一部だ。', fact: 'Trigger Step が、2つ目のケースとして始めます。2つは同じビジネスケースに属し、そこに全体の流れが残ります。' },
      { myth: 'マックスが不在なら、マネージャーの確認はマックスの帰りを待つしかない。', fact: 'マックスだけに宛てたタスクなので、本来は待ちます。でも代理のレアが、マックスの不在中は開始できます。' }
    ],
    q: 'このワークフローで、登録が誰もタスクを開かずに実行できるのはなぜですか？',
    options: ['優先度が「高」だから', 'そのタスクが SYSTEM のものだから', 'アンナが作成者だから'],
    why: 'SYSTEM 向けのタスクは、Engine 自身が開始します。誰も開く必要はありません。'
  }
};
