/**
 * Walkthrough 2.2 — texts in English and Japanese.
 *
 * Sources: Data Modeling → Data Classes ("A Data Class generally holds the data that flows
 * through your business or User Dialog process"); Process Elements Reference 14.0 — Process
 * (Process Data tab: "Each process must be associated with a data class", "It is legal for two
 * processes to specify the same data class", "strongly recommended that you only set data
 * classes that are defined in the same project"); IvyScript → Language (start values of
 * String and Number). That a Number has no leading zeros is how numbers work.
 */
export const strings = {
  en: {
    'tour.intro.title': 'Data classes and process data',
    'tour.intro.text': 'A holiday request and the data it carries. You see the data class with its attributes, how the process names it, how every element sees the data as in, and what a new case starts with.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.dataClass': 'The data class',
    'tour.chapter.processData': 'The data class of a process',
    'tour.chapter.asIn': 'Every element sees it as in',
    'tour.chapter.startValues': 'Values a new case starts with',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.attributes.title': 'Attributes',
    'tour.attributes.text': 'A data class holds the data that flows through a process. Each attribute is one value of it: here the personnel number, the number of days, and the answer.',
    'tour.types.title': 'A type for each',
    'tour.types.text': '`days` is a Number, `employeeId` a String, `approved` a Boolean. The type decides what an attribute can hold and what you can do with it.',
    'tour.comment.title': 'A comment',
    'tour.comment.text': 'Each attribute can have a comment. Say what the value means; the next person who reads the process will thank you.',

    'tour.oneClass.title': 'One data class per process',
    'tour.oneClass.text': 'With no element selected, the Process Data tab names the data class of this process. Each process must be associated with one.',
    'tour.shared.title': 'Shared, but from the same project',
    'tour.shared.text': 'Two processes may use the same data class. The reference strongly recommends data classes defined in the same project as the process.',

    'tour.afterStart.title': 'The Start fills it',
    'tour.afterStart.text': 'The Start has mapped its parameters: `days` is 5, `employeeId` is "00731". Every element after it sees this data as `in`.',
    'tour.approvedSet.title': 'A step changes it',
    'tour.approvedSet.text': 'The mapping of “Check the days” sets `approved` to true, because 5 is not more than 10.',
    'tour.sameData.title': 'And passes it on',
    'tour.sameData.text': 'The next element gets the same data, with the change. Data that leaves an element as `out` comes into the next one as `in`.',
    'tour.inCode.title': 'Read as in',
    'tour.inCode.text': '“Log the answer” reads `in.employeeId` and `in.approved`: the values the steps before it left in the process data.',

    'tour.defaults.title': 'Starts as',
    'tour.defaults.text': 'A new case starts with every attribute at a first value: Strings as an empty text, Numbers as 0.',
    'tour.neverNull.title': 'Never null',
    'tour.neverNull.text': 'So a String attribute is never null. To ask whether text is missing, ask whether it is empty: `in.employeeId.isEmpty()`.',

    'tour.leadingZeros.title': 'A number that is not an amount',
    'tour.retyped.title': 'employeeId as a Number',
    'tour.retyped.text': 'Someone changes the type of `employeeId` to Number, because a personnel number looks like a number. The parameter of the Start follows.',
    'tour.zerosLost.title': 'The zeros are gone',
    'tour.zerosLost.text': 'The request still brings "00731". As a Number it is 731: numbers have no leading zeros. Whatever looks the person up by "00731" will not find them.',
    'tour.zerosFix.title': 'How to fix it',
    'tour.zerosFix.text': 'Personnel numbers, postal codes and phone numbers are not amounts: keep them Strings. Use Number for values you calculate with.',

    'tour.localVariable.title': 'A local variable instead of an attribute',
    'tour.localSet.title': 'The answer in a local variable',
    'tour.localSet.text': 'The mapping row is gone, and the code keeps the answer in a local variable `approved`. The Designer reports nothing: the code is correct.',
    'tour.localLost.title': 'The next step never sees it',
    'tour.localLost.text': 'The log says the request is not approved, although 5 days are allowed. A local variable exists only while its code runs; `in.approved` was never set.',
    'tour.localFix.title': 'How to fix it',
    'tour.localFix.text': 'What a later element needs belongs in the process data: assign it to `out.approved`, in the mapping or in the code. If the attribute does not exist yet, add it to the data class.'
  },

  ja: {
    'tour.intro.title': 'データクラスとプロセスデータ',
    'tour.intro.text': '休暇の申請と、それが運ぶデータです。属性を持つデータクラス、プロセスがそれをどう指定するか、どの要素もデータを in として参照すること、新しいケースが何から始まるかを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.dataClass': 'データクラス',
    'tour.chapter.processData': 'プロセスのデータクラス',
    'tour.chapter.asIn': 'どの要素も in として参照する',
    'tour.chapter.startValues': '新しいケースの初期値',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.attributes.title': '属性',
    'tour.attributes.text': 'データクラスは、プロセスを流れるデータを保持します。属性はその1つ1つの値で、ここでは社員番号、日数、そして回答です。',
    'tour.types.title': 'それぞれにタイプ',
    'tour.types.text': '`days` は Number、`employeeId` は String、`approved` は Boolean です。タイプによって、属性が何を保持でき、それで何ができるかが決まります。',
    'tour.comment.title': 'コメント',
    'tour.comment.text': '属性ごとにコメントを付けられます。値が何を意味するかを書いておくと、次にプロセスを読む人の助けになります。',

    'tour.oneClass.title': 'プロセスごとに1つのデータクラス',
    'tour.oneClass.text': '要素を選択していないとき、「プロセスデータ」タブにこのプロセスのデータクラスが表示されます。どのプロセスにも1つ関連付ける必要があります。',
    'tour.shared.title': '共有できるが、同じプロジェクトのものを',
    'tour.shared.text': '2つのプロセスが同じデータクラスを使っても構いません。リファレンスは、プロセスと同じプロジェクトで定義されたデータクラスを使うことを強く勧めています。',

    'tour.afterStart.title': 'Start が値を入れる',
    'tour.afterStart.text': 'Start がパラメーターをマッピングしました。`days` は 5、`employeeId` は "00731" です。Start より後のすべての要素は、このデータを `in` として参照します。',
    'tour.approvedSet.title': 'ステップが変更する',
    'tour.approvedSet.text': '「Check the days」のマッピングが `approved` を true にします。5 は 10 より大きくないからです。',
    'tour.sameData.title': 'そして次へ渡す',
    'tour.sameData.text': '次の要素は、変更を含めた同じデータを受け取ります。要素から `out` として出ていくデータが、次の要素に `in` として入ってきます。',
    'tour.inCode.title': 'in として読む',
    'tour.inCode.text': '「Log the answer」は `in.employeeId` と `in.approved` を読みます。それより前のステップがプロセスデータに残した値です。',

    'tour.defaults.title': '初期値',
    'tour.defaults.text': '新しいケースでは、すべての属性が最初の値から始まります。String は空のテキスト、Number は 0 です。',
    'tour.neverNull.title': 'null にはならない',
    'tour.neverNull.text': 'そのため、String の属性が null になることはありません。テキストがないかどうかは、空かどうかで確認します: `in.employeeId.isEmpty()`。',

    'tour.leadingZeros.title': '金額ではない数字',
    'tour.retyped.title': 'Number になった employeeId',
    'tour.retyped.text': '社員番号は数字に見えるので、誰かが `employeeId` のタイプを Number に変えます。Start のパラメーターもそれに合わせます。',
    'tour.zerosLost.title': 'ゼロが消える',
    'tour.zerosLost.text': 'リクエストは相変わらず "00731" を運んできますが、Number としては 731 です。数値には先頭のゼロがありません。"00731" でその人を探す処理は、見つけられません。',
    'tour.zerosFix.title': '直し方',
    'tour.zerosFix.text': '社員番号、郵便番号、電話番号は金額ではありません。String のままにします。Number は計算に使う値に使います。',

    'tour.localVariable.title': '属性の代わりにローカル変数',
    'tour.localSet.title': '回答をローカル変数に',
    'tour.localSet.text': 'マッピングの行はなくなり、コードは回答をローカル変数 `approved` に入れます。コードは正しいので、Designer は何も報告しません。',
    'tour.localLost.title': '次のステップには見えない',
    'tour.localLost.text': '5日は認められるのに、ログには承認されていないと出ます。ローカル変数はそのコードの実行中だけ存在し、`in.approved` は一度も設定されていません。',
    'tour.localFix.title': '直し方',
    'tour.localFix.text': '後の要素が必要とするものはプロセスデータに入れます。マッピングかコードで `out.approved` に代入します。その属性がまだなければ、データクラスに追加します。'
  }
};
