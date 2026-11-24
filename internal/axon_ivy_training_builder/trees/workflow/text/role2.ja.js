/**
 * The Workflow tree, role level 2: its skills in Japanese.
 * Keys per skill as described in text/core.ja.js.
 */
export default {
  roletree: {
    name: 'ロールツリー',
    hook: 'ロールには親がいる。',
    def: 'ロールは**木**になっています。プロジェクトは `config/roles.yaml` でロールを定義します。Id、名前、そして必要なら Parent。親のないロールは Everybody のすぐ下に入ります。',
    show: {
      title: '木になったロール',
      file: 'プロジェクトのロールは roles.yaml に並びます。それぞれに Id があります。',
      parent: 'ロールは Parent で親を指定できます。ここでは Manager と HR が Employee の子です。',
      root: 'Employee のように親のないロールは、組み込みの根 Everybody の下に入ります。',
      why: 'この木は飾りではありません。あるロールのタスクをほかに誰が受け取るかを決めます。それが次のスキルです。'
    },
    labels: { file: 'roles.yaml' },
    myths: [
      { myth: 'ロールは名前を並べただけのリストだ。', fact: '[[everybody|Everybody]] の下の木です。木の中の位置には意味があります。子ロールのユーザーは、その親ロールのユーザーでもあります。' },
      { myth: 'どのロールにも、親を指定しなければならない。', fact: 'Parent は書かなくてもかまいません。Employee のように親のないロールは、組み込みの根である Everybody のすぐ下に入ります。' },
      { myth: 'roles.yaml に書く順番で、親子が決まる。', fact: '順番に意味はありません。親は `Parent` で指定します。Manager に `Parent: Employee` と書きます。' }
    ],
    q: 'roles.yaml で HR を Employee の子にするには、どうしますか？',
    options: ['HR を Employee より先に書く', 'ロール HR に `Parent: Employee` を書く', '両方に同じ Id を付ける'],
    why: 'ロールは `Parent` で親を指定します。指定しなければ、Everybody のすぐ下に入ります。'
  },

  inherited: {
    name: '受け継ぐロール',
    hook: 'マネージャーも従業員だ。',
    def: 'ロールを持つユーザーは、そのロールのすべての**親**のユーザーでもあります。マックスは Employee の子である Manager を持つので、Employee 向けのタスクも開始できます。',
    show: {
      title: 'マネージャーも従業員',
      tree: 'Manager と HR は Employee の子です。マックスのロールは Manager だけ、ハンナは HR だけです。',
      up: 'でも、ロールには親が付いてきます。マックスとハンナは Employee でもあります。',
      task: 'だから Employee 向けのタスクは、アンナもマックスもハンナも開始できます。',
      down: '下向きには働きません。Manager 向けのタスクは、Employee でしかないアンナのものではありません。'
    },
    labels: { forEmployee: 'Employee 向け', forManager: 'Manager 向け', plus: '+ Employee' },
    myths: [
      { myth: 'Employee 向けのタスクは、ちょうどロール Employee を持つユーザーだけのものだ。', fact: 'その子ロールのユーザーのものでもあります。マネージャーも HR の人も従業員です。親ロールにタスクを渡せば、子ロールはすべて含まれます。' },
      { myth: 'Manager 向けのタスクは、Employee なら誰でも開始できる。', fact: '下の方向には働きません。Manager 向けのタスクは、Employee でしかないアンナのものではありません。' },
      { myth: '受け継ぐのは、すぐ上の親までだ。', fact: 'いちばん上まで続きます。Manager を持つマックスは、Manager、Employee、Everybody のユーザーです。' }
    ],
    q: 'Manager は Employee の子ロールです。タスクは Employee 向けです。Manager しか持たないマックスは開始できますか？',
    options: ['はい。ロールには親が付いてくる', 'いいえ。Employee も必要', 'ほかの人が先に開始しなければ'],
    why: '子ロールを持つ人は、その親ロールのユーザーでもあります。マックスは Manager なので、Employee でもあります。'
  },

  userroles: {
    name: 'ユーザーのロール',
    hook: '1人で、いくつもの帽子。',
    def: 'ユーザーはいくつものロールを持てます。テストユーザーの場合は users.yaml の `Roles` に並べます。Everybody は、書かなくても付いてきます。',
    show: {
      title: 'いくつもの帽子',
      one: 'users.yaml で、ハンナのロールは HR の1つです。HR 向けのタスクを開始できます。',
      two: 'ハンナはチームも率いることになりました。ロールに Manager を追加すると、マネージャーのタスクも開始できます。',
      all: 'ロールの親も合わせると、ハンナは HR、Manager、Employee、Everybody です。',
      table: 'Developer Workflow UI のログイン表には、どのユーザーもロール付きで表示されます。'
    },
    labels: { forHr: 'HR 向け', forManager: 'Manager 向け', all: 'hanna のすべてのロール', loginTable: 'ログイン' },
    myths: [
      { myth: 'ユーザーが持つロールは、ちょうど1つだ。', fact: '必要なだけ持てて、それぞれの[[inherited|親]]も付いてきます。タスクリストには、そのすべてのロールのタスクが並びます。' },
      { myth: 'Everybody は、users.yaml でユーザーごとに書く必要がある。', fact: 'Everybody は、書かなくても付いてきます。' },
      { myth: 'テストユーザーのロールを知るには、users.yaml を開くしかない。', fact: 'Developer Workflow UI のログイン表に、すべてのユーザーがロール付きで並んでいます。' }
    ],
    q: 'ハンナはロール HR と Manager を持っています。どのタスクを開始できますか？',
    options: ['最初のロール HR 向けのタスクだけ', 'どれも開始できない。2つのロールは打ち消し合う', 'HR 向けのタスクと Manager 向けのタスク'],
    why: 'ユーザーが持つロールはどれも有効です。2つのロールがあれば、両方のタスクを開始できます。'
  },

  severalroles: {
    name: '複数のロール',
    hook: 'どちらでもいい。',
    def: '[[responsible|担当]]には、2つ以上のロールを指定できます。そのとき、ユーザーはそのうち1つを持っていればタスクを開始できます。',
    show: {
      title: 'どちらでもいい',
      one: 'ロール Manager 向けのタスクです。開始できるのはマネージャーだけです。',
      add: '「担当」に HR を追加します。タスクのロールは2つになりました。',
      either: 'マックスも、ハンナも開始できます。必要なのはどちらか1つのロールで、両方ではありません。',
      still: 'タスクは1つのままです。最初に開始した人が行います。'
    },
    labels: { approve: '休暇の承認' },
    myths: [
      { myth: '「担当」にロールが2つあれば、ユーザーは両方を持っている必要がある。', fact: '1つで十分です。ロールを2つにすると範囲が広がり、どちらのロールのユーザーにもタスクが表示されます。' },
      { myth: '「担当」にロールが2つあると、ロールごとに1つ、タスクが2つできる。', fact: 'タスクは1つのままです。最初に開始した人が行います。' },
      { myth: 'HR にマネージャーのタスクをさせるには、HR のユーザーにロール Manager を与えるしかない。', fact: 'タスクの「担当」に HR を足せば済みます。タスクのロールが2つになり、誰のロールも変わりません。' }
    ],
    q: 'タスクの「担当」は Manager と HR です。ハンナが持っているのは HR だけです。開始できますか？',
    options: ['いいえ。Manager も必要', 'はい。ロールは1つで十分', 'マネージャーが見た後でだけ'],
    why: 'ユーザーは、担当ロールのうち1つを持っていれば十分です。ハンナは HR を持つので、タスクはハンナのリストにあります。'
  },

  roleattr: {
    name: '属性からのロール',
    hook: 'どのチーム？申請しだいだ。',
    def: '**属性からのロール**を使うと、[[responsible|担当]]のロールがプロセスデータから決まります。実行中に求めたロール名です。',
    show: {
      title: '実行時に決まるロール',
      fixed: '固定のロールでは、どの申請も同じ人たちに届きます。ここではマネージャーです。',
      data: 'でも、給与についての質問は HR のものです。タスクの前のステップでロールを決めます: in.team = "HR"。',
      attr: '「タスク」タブで「属性からのロール」、in.team。このタスクは HR に届きます。',
      next: '次の申請は in.team = "Manager" で、マネージャーに届きます。要素は1つ、ロールはさまざまです。'
    },
    labels: { team: 'in.team' },
    myths: [
      { myth: 'ロールごとに、別々のタスク要素が必要だ。', fact: '要素は1つで足ります。「属性からのロール」は、ケースごとにデータからロール名を取ります。' },
      { myth: '「属性からのロール」には、ユーザーの名前を渡す。', fact: '渡すのは `HR` のようなロール名です。ユーザー名には「属性からのユーザー」を使います。' },
      { myth: '「属性からのロール」では、ユーザーがロールを選ぶ。', fact: '誰も選びません。タスクの前のステップが `in.team = "HR"` のようにロール名をデータに入れ、タスクはそこから読み取ります。' }
    ],
    q: '前のステップがロール名 "HR" を `in.team` に入れました。そのロールにタスクを届ける「担当」はどれですか？',
    options: ['属性からのロール: `in.team`', 'ロール: in.team', '属性からのユーザー: `in.team`'],
    why: '「属性からのロール」はデータからロール名を読みます。「属性からのユーザー」だと、HR という名前のユーザーを探してしまいます。'
  },

  system: {
    name: 'SYSTEM',
    hook: '誰も開かなくていいタスク。',
    def: '[[task|タスク]]をロール **SYSTEM** に渡すと、作られたらすぐに Engine が自分で作業します。人が開くことはありません。',
    show: {
      title: 'Engine の仕事',
      approved: 'マックスがアンナの休暇を承認します。人事システムへの登録に、人は要りません。',
      system: 'そこで次の Task Switch は、タスクをロール SYSTEM に渡します。',
      runs: 'Engine が自分でタスクを開始します。その後のステップが実行され、誰も何もクリックしません。',
      user: 'ログを見ると、そのタスクのユーザーは SYSTEM です。',
      retry: '失敗すると、Engine は後でやり直します。1、2、4、8 分後、最長 23 時間後まで。'
    },
    labels: { approve: '承認', book: '登録', log: '休暇の登録 · user=SYSTEM', retry: '1、2、4、8 分後に再試行 …' },
    myths: [
      { myth: 'タスクの切り替えの後のステップには、いつも誰かの「続行」クリックが必要だ。', fact: '新しいタスクを SYSTEM に渡せば、Engine が自分で開始します。人のタスクの後を、裏で続けるための方法です。' },
      { myth: 'SYSTEM のタスクは、管理者のタスクリストで待つ。', fact: '誰のリストにもありません。作られたらすぐ、Engine が自分で開始します。' },
      { myth: 'SYSTEM のタスクが失敗したら、それで終わりだ。', fact: 'Engine が後でやり直します。1、2、4、8 分後というように、最長 23 時間まで。' }
    ],
    q: 'Task Switch が次のタスクを SYSTEM に渡しました。誰が作業しますか？',
    options: ['Engine 自身。誰も開かなくてよい', '管理者', '誰も。永遠に待つ'],
    why: 'SYSTEM は Engine です。タスクを自分で開始します。'
  }
};
