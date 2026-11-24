/**
 * Workflow ツリーのパズル（日本語）。すべてのパズルが共有する名前（`puzzle`: 要素の種類とその
 * 働き、フィールド名、選択肢）と、各パズルの文章（`puzzles`）。構成は puzzles.en.js と同じ。
 * 要素の種類は英語のまま、Designer のフィールド名は Designer の表示どおり。
 */
export const puzzle = {
  kinds: {
    start: 'Request Start', dialog: 'User Dialog', user: 'User Task', script: 'Script', email: 'E-Mail', switch: 'Task Switch Event',
    gateway: 'Task Switch Gateway', alternative: 'Alternative', split: 'Split', join: 'Join', end: 'Process End'
  },
  about: {
    start: 'ユーザーがプロセスを開始する場所です。開始のたびに、新しいケースとその最初のタスクができます。',
    dialog: '実行中のタスクの中でフォームを表示します。自分のタスクは作りません。',
    user: 'フォーム付きの新しいタスクを作ります。担当の誰かが終えるまで、プロセスは待ちます。',
    script: '実行中のタスクの中でコードを実行します。誰の目にも触れません。',
    email: 'メールを送ります。タスクは作らず、誰も待ちません。',
    switch: '実行中のタスクを終え、担当に向けた新しいタスクを作ります。',
    gateway: '出ていくパスごとにタスクを一度に作ります。パスが合流するところでは、すべてを待ちます。',
    alternative: 'トークンを出口の1つへ送ります。条件が最初に true になった出口です。',
    split: 'すべての出口へトークンを送ります。パスは同じタスクの中で並んで進みます。',
    join: 'そこへ入るすべてのパスを待ち、それから1つのトークンを先へ進めます。',
    end: 'プロセスのこのパスはここで終わります。'
  },
  fields: {
    responsible: '担当',
    delay: '遅延',
    expiryTimeout: '有効期限 · タイムアウト',
    expiryResponsible: '有効期限 · 担当',
    expiryPriority: '有効期限 · 優先度',
    anonymous: '権限 · 匿名を許可する',
    role: '権限 · ロール',
    taskTo: '「{0}」へのタスク · 担当',
    condTo: '条件 · 「{0}」への出口',
    mailTo: 'ヘッダー · 宛先',
    splitOut: '出力 · out2（「{0}」へのパス）'
  },
  options: {
    everybody: 'Everybody', employee: 'Employee', manager: 'Manager', hr: 'HR', system: 'SYSTEM', creator: 'CREATOR',
    none: 'なし', h1: '1時間', d1: '1日', h2: '2時間', d2: '2日', low: '低', normal: 'ノーマル', high: '高', on: '☑ はい', off: '☐ いいえ',
    empty: '（空）', approved: 'in.approved', days: 'in.days > 5', in: 'in', managerMail: '<%=in.managerMail%>', requesterMail: '<%=in.requesterMail%>'
  }
};

const everybodyTask = 'Everybody は新しいタスクの既定値です。どのユーザーでもこの承認を開始でき、アンナ本人もできてしまいます。';
const ownRole = 'Employee はアンナ自身のロールです。自分の休暇を自分で承認できてしまいます。';
const firstForm = '開始の後、まずアンナが申請を記入します。';
const noRecipient = '宛先のないメールは送れません。ステップは `ivy:error:email` で失敗します。';

export const puzzles = {
  boss1: {
    title: '承認は 1 回',
    brief: '会社は休暇申請を承認制にしたいと考えています。社員の**アンナ**が申請を記入し、**マネージャー**が承認します。このプロセスを作ってください。',
    names: { start: 'start.ivp', form: '休暇を申請', approve: '休暇を承認', end: '' },
    why: {
      'approve.responsible': { everybody: everybodyTask, employee: ownRole, hr: '課題が求めているのはマネージャーです。HR は別のロールです。' }
    },
    next: {
      start: firstForm,
      form: '申請が記入されたら、次は承認です。',
      approve: '承認の後にすることは残っていません。プロセスは終わります。'
    },
    run: {
      start: 'アンナがプロセスを開始します。Engine は新しい**ケース**と、その最初の**タスク**（アンナのもの）を作ります。',
      form: 'User Dialog は、そのタスクの中でフォームを表示します。アンナが記入して送信します。',
      approve: 'User Task は、ロール **Manager** 向けの新しいタスクを作ります。マックスはそのロールを持っているので、タスクリストから取って承認します。',
      end: 'タスクは残っていないので、ケースは完了です。'
    },
    solved: '開始 1 回、ケース 1 つ、タスク 2 つ。アンナのものとマックスのものです。'
  },

  boss2: {
    title: '承認か却下か',
    brief: '**マネージャー**が休暇申請を判断します。**承認**なら休暇を登録します。そうでなければ、申請した本人に**メール**で知らせます。このプロセスを作ってください。',
    names: { start: 'start.ivp', form: '休暇を申請', decide: '判断', which: '承認？', book: '休暇を登録', booked: '登録済み', mail: '断りの連絡', told: '連絡済み' },
    why: {
      'decide.responsible': { everybody: everybodyTask, employee: ownRole, hr: '課題が求めているのはマネージャーです。HR は別のロールです。' },
      'which.toBook': {
        empty: '空の条件はいつも true で、新しい出口の既定値です。却下された申請も含め、すべてが登録されてしまいます。',
        days: 'ここで決め手になるのは日数ではありません。マネージャーの判断です。'
      },
      'mail.mailTo': { empty: noRecipient, managerMail: '断ったのはマックス自身です。知らせる相手は、申請した本人です。' }
    },
    next: {
      start: firstForm,
      form: '申請が届いたら、マネージャーが判断します。',
      decide: '判断の後、プロセスは進む道を選ばなければなりません。それが Alternative です。',
      which: 'Alternative には両方の出口が必要です。登録へ 1 本、メールへ 1 本です。',
      book: '登録の後、このパスは自分の終了で終わります。',
      mail: 'メールの後、このパスは自分の終了で終わります。'
    },
    run: {
      start: 'アンナがプロセスを開始します。新しいケースです。',
      form: '申請を記入します。',
      decide: 'ロール **Manager** 向けのタスクです。マックスが承認し、ダイアログがプロセスデータに `approved` = true を入れます。',
      which: 'Alternative は行を上から試します。`in.approved` は true なので、トークンは登録への道を進みます。',
      book: 'Script が、マックスのタスクの中で休暇を登録します。',
      booked: 'することは残っていません。このケースは完了です。'
    },
    run2: {
      start: '同じプロセスの、別のケースです。今度はベンが休暇を申請します。',
      form: '申請を記入します。',
      decide: 'またロール Manager 向けのタスクです。今度はマックスが断ります。`approved` は false です。',
      which: '1行目の `in.approved` は false です。もう一方の出口は条件が空で、いつも true です。トークンはそちらへ進みます。',
      mail: 'E-Mail ステップがベンに書きます。タスクは作られず、誰も待ちません。',
      told: 'このケースも完了です。プロセスは 1 つ、ケースは 2 つ、通った道も 2 つです。'
    },
    solved: '判断のためのタスクが 1 つ、2 つの道のための Alternative、そして「いいえ」にはタスクではなくメール。'
  },

  boss3: {
    title: '承認は 2 回',
    brief: '休暇には 2 回の承認が必要になりました。まず**マネージャー**、次に **HR** です。マネージャーが **2 日**たっても決めなければ、そのタスクは優先度「**高**」で **HR** に渡ります。HR 自身の承認は、**1 日後**に初めて現れるようにします。両方の承認の後、休暇は**誰もクリックせずに**登録されます。',
    names: { start: 'start.ivp', form: '休暇を申請', manager: 'マネージャーが承認', hr: 'HR が承認', switch: 'Engine へ', book: '休暇を登録', end: '' },
    why: {
      'manager.responsible': { everybody: everybodyTask, employee: ownRole, hr: 'HR は 2 番目です。最初の承認はマネージャーのものです。' },
      'manager.expiryTimeout': {
        none: 'タイムアウトがなければ、タスクは期限切れになりません。マネージャーをいつまでも待ち続けます。',
        h2: '課題がマネージャーに与えているのは 2 時間ではなく 2 日です。'
      },
      'manager.expiryResponsible': {
        everybody: 'ここでも Everybody が既定値です。2 日後にはどのユーザーでも承認でき、アンナもできてしまいます。',
        manager: 'それでは、期限切れのタスクは反応しなかったマネージャーの手元に残ります。課題では HR に渡します。'
      },
      'manager.expiryPriority': {
        normal: 'ノーマルは既定値です。課題は遅れたタスクを目立たせたいので、「高」です。',
        low: '「低」では、遅れたタスクがリストの下に沈みます。課題は「高」です。'
      },
      'hr.responsible': { everybody: everybodyTask, employee: ownRole, manager: 'マネージャーは前のタスクですでに承認しています。こちらは HR のものです。' },
      'hr.delay': {
        none: '遅延がなければ、タスクはすぐに HR のタスクリストに出ます。課題では 1 日置きます。',
        h1: '課題は 1 時間ではなく 1 日です。'
      },
      'switch.responsible': {
        everybody: 'Everybody 向けのタスクは、誰かが開始するまでタスクリストで待ちます。登録は誰もクリックせずに実行されなければなりません。',
        hr: 'それでは、まず HR の誰かがタスクを開始しなければなりません。登録は誰もクリックせずに実行されなければなりません。'
      }
    },
    next: {
      start: firstForm,
      form: '先に決めるのはマネージャーです。HR が見るのは、マネージャーが承認したものだけです。',
      manager: 'マネージャーの次は HR です。休暇が登録されるのは、両方が承認してからです。',
      hr: '両方の承認の後、仕事は Engine に移ります。そのために、Script の前に Task Switch Event が必要です。',
      switch: 'Task Switch Event の後に来るものは、その新しいタスクの中で実行されます。登録はそこに置きます。',
      book: '登録の後にすることは残っていません。プロセスは終わります。'
    },
    run: {
      start: 'アンナがプロセスを開始します。新しいケースと、その最初のタスク（アンナのもの）ができます。',
      form: '申請を記入して送信します。',
      manager: 'ロール **Manager** 向けのタスクです。マックスが 2 日以内に承認するので、有効期限は働きません。',
      hr: '次の User Task は、遅延付きで **HR** 向けのタスクを作ります。1 日の間、誰のタスクリストにも出ません。その後、ハンナが承認します。',
      switch: 'Task Switch Event はハンナのタスクを終え、**SYSTEM** 向けのタスクを作ります。Engine が自分で開始します。',
      book: 'Script が SYSTEM のタスクの中で休暇を登録します。誰もクリックしていません。',
      end: '最後のタスクが終わったので、ケースも完了です。'
    },
    solved: '2 回の承認、遅延、安全網としての有効期限、そして裏で動く登録。'
  },

  boss4: {
    title: '並んで進む',
    brief: '**マネージャー**が承認したら、2 つのことが**同時に**起きます。どちらにも人は要りません。休暇を**登録**し、申請した本人に**メール**を送ります。**両方**が終わったら、プロセスは終わります。',
    names: { start: 'start.ivp', form: '休暇を申請', approve: '休暇を承認', split: '両方へ', book: '休暇を登録', mail: 'アンナに連絡', join: '両方完了', end: '' },
    why: {
      'approve.responsible': { everybody: everybodyTask, employee: ownRole, hr: '課題が求めているのはマネージャーです。HR は別のロールです。' },
      'split.out2': { empty: '既定では、Split がデータを渡すのは最初のパスだけです: `out1` ← `in`。もう一方のパスは空で始まり、登録は誰の休暇か分からず、メールは送り先が分かりません。' },
      'mail.mailTo': { empty: noRecipient, managerMail: '承認したのはマックス自身です。知らせる相手は、申請した本人です。' }
    },
    next: {
      start: firstForm,
      form: '申請が届いたら、マネージャーが承認します。',
      approve: '承認の後、2 つのことが並んで起きます。そのために Split が必要です。',
      split: 'Split には両方のパスが必要です。登録へ 1 本、メールへ 1 本です。',
      book: 'どちらのパスも Join で終わります。Join は両方を待ちます。',
      mail: 'どちらのパスも Join で終わります。Join は両方を待ちます。',
      join: '両方のパスが到着したら、プロセスは終わります。'
    },
    run: {
      start: 'アンナがプロセスを開始します。新しいケースです。',
      form: '申請を記入します。',
      approve: 'ロール **Manager** 向けのタスクです。マックスが承認します。',
      split: 'Split が両方のパスへトークンを送ります。タスクは作られず、すべてマックスのタスクの中で実行されます。',
      book: '一方のパスが休暇を登録します。',
      mail: 'もう一方がアンナに書きます。`out1` ← `in` と `out2` ← `in` が両方のパスにデータを渡したので、アドレスが分かります。',
      join: 'Join は両方のパスを待っていました。ここで 1 つのトークンが先へ進みます。',
      end: 'タスクは残っていません。ケースは完了です。'
    },
    solved: '同時に 2 つのことをするための Split、2 つ目のパスのためのデータ、そして 1 つに戻す Join。'
  },

  boss5: {
    title: '2 つの確認を同時に',
    brief: 'もっと速く。申請の後、**マネージャー**と **HR** が**同時に**確認します。申請を開始できるのは**社員**だけです。**両方**の確認が終わったら、ケースを開始した本人が日程を確定します。',
    names: { start: 'start.ivp', form: '休暇を申請', split: '確認へ', mcheck: 'マネージャーの確認', hcheck: 'HR の確認', join: '確認済み', confirm: '日程を確定', end: '' },
    why: {
      'start.anonymous': { on: '「匿名を許可する」がオンだと、リンクを知っていれば、サインインしていなくても誰でもプロセスを開始できます。' },
      'start.role': {
        everybody: 'Everybody はすべてのユーザーです。社員でない人も含まれます。',
        manager: 'それでは、休暇を申請できるのはマネージャーだけになります。アンナは Employee で、Manager ではありません。',
        hr: 'それでは、休暇を申請できるのは HR だけになります。アンナは Employee で、HR ではありません。'
      },
      'split.toManager': {
        everybody: 'Everybody は既定値です。どのユーザーでもマネージャーの確認ができ、アンナもできてしまいます。',
        hr: 'このパスはマネージャーの確認に続きます。HR にはもう一方のパスがあります。'
      },
      'split.toHr': {
        everybody: 'Everybody は既定値です。どのユーザーでも HR の確認ができ、アンナもできてしまいます。',
        manager: 'このパスは HR の確認に続きます。マネージャーにはもう一方のパスがあります。'
      },
      'join.responsible': {
        everybody: 'それでは、どのユーザーでもアンナの日程を確定できてしまいます。',
        system: 'SYSTEM は Engine です。課題が求めているのは、ケースを開始した本人です。'
      }
    },
    next: {
      start: firstForm,
      form: '申請が届いたら、2 つの確認が始まります。最初のゲートウェイがそのタスクを作ります。',
      split: '最初のゲートウェイには 2 本のパスが必要です。マネージャーの確認へ 1 本、HR の確認へ 1 本です。',
      mcheck: '確認の後、どちらのパスも 2 つ目のゲートウェイに入ります。そこで両方を待ちます。',
      hcheck: '確認の後、どちらのパスも 2 つ目のゲートウェイに入ります。そこで両方を待ちます。',
      join: '両方の確認が終わったら、日程を確定します。',
      confirm: '確定の後にすることは残っていません。プロセスは終わります。'
    },
    run: {
      start: 'アンナはロール Employee を持っているので、Start を通れます。持っていない人には、プロセスの代わりにエラーが返ります。',
      form: '申請を記入します。',
      split: 'Task Switch Gateway はアンナのタスクを終え、2 つのタスクを一度に作ります。1 つは **Manager** 向け、もう 1 つは **HR** 向けです。',
      mcheck: 'マックスが自分のタスクでマネージャーの確認をします。',
      hcheck: 'ハンナが自分のタスクで HR の確認をします。どちらも相手を待ちません。',
      join: '2 つ目のゲートウェイは両方を待っていました。ここで **CREATOR**、つまりケースを開始したユーザー向けのタスクを 1 つ作ります。',
      confirm: 'それはアンナです。日程を確定します。',
      end: 'すべてのタスクが終わったので、ケースも完了です。'
    },
    solved: '社員だけが使える Start、並んで進む 2 つのタスク、待つゲートウェイ、そして申請した本人のための CREATOR。'
  }
};
