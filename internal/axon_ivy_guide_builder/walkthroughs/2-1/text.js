/**
 * Walkthrough 2.1 — texts in English and Japanese. Labels of the Designer are quoted as the
 * Designer shows them in each language (runtime/designer-labels.json); element names and the
 * kinds of process stay English in both (see runtime/i18n.js).
 *
 * Sources: Process Elements Reference 14.0 — Common Tabs (General Tab: name, description,
 * means/documents, tags and their tip "Give each element a name, always"), Process (General,
 * Process Data, Permissions tabs), Start, Process End; Process Modeling → Process Kinds. The
 * tabs of a process per kind and the Process Data message are the Designer's own (14.0.1).
 */
export const strings = {
  en: {
    'tour.intro.title': 'A process and its elements',
    'tour.intro.text': 'An order process with four elements. You see what elements and connectors are, how the inscription view shows one element, what the General tab holds, and the process itself with its four kinds.',
    'tour.intro.duration': 'about 3 min, 4 with the voice',
    'tour.chapter.elements': 'Elements and connectors',
    'tour.chapter.inscription': 'The inscription view',
    'tour.chapter.general': 'The General tab',
    'tour.chapter.kinds': 'The process itself, and its kinds',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.start.title': 'A Start',
    'tour.start.text': 'A process begins at a start event, the circle on the left. This Start is called with a link; part 2.3 shows how.',
    'tour.activity.title': 'Activities',
    'tour.activity.text': 'The boxes are activities: steps that do something. These two are Script Steps, which change the process data.',
    'tour.processEnd.title': 'A Process End',
    'tour.processEnd.text': 'The thick circle on the right is a Process End. It terminates the current process.',
    'tour.token.title': 'Connectors and the token',
    'tour.token.text': 'The arrows are connectors: they give the order of the elements. When the process runs, a token follows them from one element to the next.',

    'tour.inscription.title': 'The inscription view',
    'tour.inscription.text': 'Select an element and the inscription view shows its configuration. Every element has the General tab; a Script Step also has Output.',
    'tour.otherTabs.title': 'The tabs depend on the type',
    'tour.otherTabs.text': 'A Start has six tabs: General, Start, Request, Trigger, Task and Case. The parts of this guide go through them element by element.',

    'tour.name.title': 'Display name',
    'tour.name.text': 'The name of the element in the process, shown in the process editor. The reference has one tip for it: give each element a name, always.',
    'tour.nameCanvas.title': 'On the canvas at once',
    'tour.nameCanvas.text': 'Say what the step does. The canvas shows the new name right away.',
    'tour.description.title': 'Description',
    'tour.description.text': 'Describes what the element does. It may be formatted with Markdown.',
    'tour.tooltip.title': 'As a tooltip',
    'tour.tooltip.text': 'Rest the mouse on the element, and the description appears as a tooltip. Whoever reads the process gets the details without opening anything.',
    'tour.docs.title': 'Means / Documents',
    'tour.docs.text': 'References to things that belong to this step: documentation, templates, example forms.',
    'tour.tags.title': 'Tags',
    'tour.tags.text': 'Keywords for the element; any word can be a tag. A few have a meaning: DEMO marks a Start as a demonstration process, DEPRECATED marks a start as deprecated.',

    'tour.processItself.title': 'The process itself',
    'tour.processItself.text': 'With no element selected, the inscription view shows the process. A business process has three tabs: General, Process Data and Permissions.',
    'tour.displayName.title': 'The name of the file',
    'tour.displayName.text': 'The name of a process is the name of its file, here ProcessElements. It cannot be changed in this field.',
    'tour.dataClass.title': 'Process Data',
    'tour.dataClass.text': 'Each process must be associated with a data class: it defines the data that flows through the process. Walkthrough 2.2 is about it.',
    'tour.viewer.title': 'Permissions',
    'tour.viewer.text': 'Whether workflow users may view the process on the Engine. Allowed by default for business processes, not for User Dialog logic processes.',
    'tour.kinds.title': 'Four kinds of process',
    'tour.kinds.text': 'Business processes are the regular kind, with starts that users select. Callable sub processes are called by other processes. Web service processes offer a web service. User Dialog logic processes are the behaviour of a dialog.',
    'tour.otherKinds.title': 'You meet them all',
    'tour.otherKinds.text': 'Callable sub processes come in part 3, User Dialog logic in part 5, web service processes in part 7. A web service process has a fourth tab, a User Dialog logic process has no Process Data tab.',

    'tour.noName.title': 'An element without a name',
    'tour.noNameCanvas.title': 'A box without words',
    'tour.noNameCanvas.text': 'Only the icon of a Script Step is left. Whoever reads the process, and the title of the inscription view, can no longer tell what this step does.',
    'tour.noNameFix.title': 'How to fix it',
    'tour.noNameFix.text': 'Give each element a name, always: "Confirm the order", not "Script". Put the details in the description.',

    'tour.dataClassChange.title': 'Changing the data class',
    'tour.changeWarning.title': 'The Designer warns',
    'tour.changeWarning.text': 'The note under the field: if the process data class changes, all fields already used must exist in the new data class. Otherwise existing mappings and scripts are removed.',
    'tour.changeFix.title': 'How to fix it',
    'tour.changeFix.text': 'Before choosing another data class, make sure it has every attribute the process uses. To add or rename an attribute, change the data class itself. Use a data class of the same project, as the reference recommends.'
  },

  ja: {
    'tour.intro.title': 'プロセスとその要素',
    'tour.intro.text': '4つの要素からなる注文のプロセスです。要素とコネクターとは何か、インスクリプションビューが1つの要素をどう表示するか、「一般」タブに何があるか、そしてプロセスそのものと4つの種類を確認します。',
    'tour.intro.duration': '約3分（音声ありで約4分）',
    'tour.chapter.elements': '要素とコネクター',
    'tour.chapter.inscription': 'インスクリプションビュー',
    'tour.chapter.general': '「一般」タブ',
    'tour.chapter.kinds': 'プロセスそのものと、その種類',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.start.title': 'Start',
    'tour.start.text': 'プロセスは開始イベント、左の円から始まります。この Start はリンクで呼び出されます。その方法はウォークスルー 2.3 で説明します。',
    'tour.activity.title': 'アクティビティ',
    'tour.activity.text': '四角はアクティビティで、何かを行うステップです。この2つは Script Step で、プロセスデータを変更します。',
    'tour.processEnd.title': 'Process End',
    'tour.processEnd.text': '右の太い円が Process End です。現在のプロセスを終了します。',
    'tour.token.title': 'コネクターとトークン',
    'tour.token.text': '矢印はコネクターで、要素の順序を表します。プロセスが実行されると、トークンがコネクターに沿って要素から要素へ進みます。',

    'tour.inscription.title': 'インスクリプションビュー',
    'tour.inscription.text': '要素を選択すると、インスクリプションビューにその設定が表示されます。どの要素にも「一般」タブがあり、Script Step にはさらに「出力」があります。',
    'tour.otherTabs.title': 'タブは種類によって違う',
    'tour.otherTabs.text': 'Start には「一般」「開始」「リクエスト」「トリガー」「タスク」「ケース」の6つのタブがあります。このガイドの各パートで、要素ごとに順に見ていきます。',

    'tour.name.title': '表示名',
    'tour.name.text': 'プロセスの中での要素の名前で、プロセスエディターに表示されます。リファレンスにはこれについて1つのヒントがあります。どの要素にも必ず名前を付けること。',
    'tour.nameCanvas.title': 'すぐにキャンバスに表示される',
    'tour.nameCanvas.text': 'ステップが何をするかを書きます。キャンバスにはすぐに新しい名前が表示されます。',
    'tour.description.title': '説明',
    'tour.description.text': '要素が何をするかを説明します。Markdown で書式を付けられます。',
    'tour.tooltip.title': 'ツールチップとして',
    'tour.tooltip.text': 'マウスを要素の上に置くと、説明がツールチップとして表示されます。プロセスを読む人は、何も開かずに詳しい内容がわかります。',
    'tour.docs.title': '手段／ドキュメント',
    'tour.docs.text': 'このステップに関係するものへの参照です。ドキュメント、テンプレート、フォームの例など。',
    'tour.tags.title': 'タグ',
    'tour.tags.text': '要素のキーワードで、どんな語でもタグにできます。意味を持つタグもあります。DEMO は Start をデモ用のプロセスとして、DEPRECATED は開始を非推奨として示します。',

    'tour.processItself.title': 'プロセスそのもの',
    'tour.processItself.text': '要素を選択していないとき、インスクリプションビューはプロセスを表示します。ビジネスプロセスには「一般」「プロセスデータ」「権限」の3つのタブがあります。',
    'tour.displayName.title': 'ファイルの名前',
    'tour.displayName.text': 'プロセスの名前はファイルの名前で、ここでは ProcessElements です。このフィールドでは変更できません。',
    'tour.dataClass.title': 'プロセスデータ',
    'tour.dataClass.text': 'どのプロセスにもデータクラスを1つ関連付ける必要があります。データクラスはプロセスを流れるデータを定義します。ウォークスルー 2.2 で詳しく見ます。',
    'tour.viewer.title': '権限',
    'tour.viewer.text': 'ワークフローユーザーがエンジンでプロセスを表示できるかどうかです。既定では、ビジネスプロセスでは許可され、User Dialog ロジックのプロセスでは許可されません。',
    'tour.kinds.title': '4種類のプロセス',
    'tour.kinds.text': 'ビジネスプロセスは通常の種類で、ユーザーが選んで開始できる Start を持ちます。呼び出し可能なサブプロセスは、ほかのプロセスから呼び出されます。Web サービスプロセスは Web サービスを提供します。User Dialog ロジックのプロセスは、ダイアログの振る舞いです。',
    'tour.otherKinds.title': 'すべて登場します',
    'tour.otherKinds.text': '呼び出し可能なサブプロセスはパート3、User Dialog ロジックはパート5、Web サービスプロセスはパート7で扱います。Web サービスプロセスには4つ目のタブがあり、User Dialog ロジックのプロセスには「プロセスデータ」タブがありません。',

    'tour.noName.title': '名前のない要素',
    'tour.noNameCanvas.title': '言葉のない四角',
    'tour.noNameCanvas.text': '残っているのは Script Step のアイコンだけです。プロセスを読む人にも、インスクリプションビューのタイトルからも、このステップが何をするのかもうわかりません。',
    'tour.noNameFix.title': '直し方',
    'tour.noNameFix.text': 'どの要素にも必ず名前を付けます。「Script」ではなく「注文を確定する」のように。詳しいことは説明に書きます。',

    'tour.dataClassChange.title': 'データクラスを変更する',
    'tour.changeWarning.title': 'Designer の警告',
    'tour.changeWarning.text': 'フィールドの下の注意書きです: プロセスデータクラスが変更された場合、すでに使用しているフィールドはすべて新しいデータクラスに存在しなければなりません。存在しない場合、既存のマッピングとスクリプトは削除されます。',
    'tour.changeFix.title': '直し方',
    'tour.changeFix.text': 'ほかのデータクラスを選ぶ前に、プロセスが使うすべての属性がそこにあることを確かめます。属性を追加したり名前を変えたりするなら、データクラスそのものを変更します。リファレンスが勧めるとおり、同じプロジェクトのデータクラスを使います。'
  }
};
