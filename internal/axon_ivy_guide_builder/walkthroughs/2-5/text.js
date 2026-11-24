/**
 * Walkthrough 2.5 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Start (Request Tab: start per HTTP, start link,
 * start list, name, description, category, Anonymous and its warning, responsible role,
 * violation error), Process End Page (End Page tab: "Pages can be referenced from the content
 * management system or the web content directory", xhtml files in webContent/view); Static
 * JSF Pages ("Even if you use a static JSF page as the workflow end page, it is not possible
 * to access the case and task context").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Who may start it and how it is listed',
    'tour.intro.text': 'A start for booking a parking space at the office. You see the Request tab: the link, how the start is listed for users, who may start it. Then the Process End Page shows its page.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.link': 'Started by a link',
    'tour.chapter.listed': 'How the start is listed',
    'tour.chapter.permission': 'Who may start it',
    'tour.chapter.endPage': 'Process End Page',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.startPerHttp.title': 'Started per HTTP',
    'tour.startPerHttp.text': 'When this is checked, the Start can be started with an HTTP request. Without it, the Start has no link.',
    'tour.link.title': 'The link',
    'tour.link.text': 'The name of the start link. It always ends with .ivp and has to be unique within its process.',

    'tour.startList.title': 'Show on start list',
    'tour.startList.text': 'Whether the start appears in the start list, where users pick the processes they may start.',
    'tour.requestName.title': 'Name',
    'tour.requestName.text': 'The name the start list shows. Write it for the users: what they get when they start it.',
    'tour.requestDescription.title': 'Description',
    'tour.requestDescription.text': 'Shown in the start list too, under the name.',
    'tour.category.title': 'Category',
    'tour.category.text': 'Groups the starts on the start list. All the starts of the facilities team can share one category.',

    'tour.anonymousOff.title': 'Allow anonymous',
    'tour.anonymousOff.text': 'Unchecked here: only users registered on the Axon Ivy Engine may start the process. Checked, anonymous users may start it too.',
    'tour.roles.title': 'The role',
    'tour.roles.text': 'Users who want to start the process must have this role. Everybody means every user. A user without the role gets the violation error, which an Error Start can handle.',

    'tour.pageShown.title': 'A page at the end',
    'tour.pageShown.text': 'The Process End Page terminates the process and displays a page: here, the confirmation of the booking.',
    'tour.pageField.title': 'The End Page tab',
    'tour.pageField.text': 'The page displayed when a case ends with this element. Here it is a file of the project’s web content.',
    'tour.pageWhere.title': 'Where pages come from',
    'tour.pageWhere.text': 'A page can come from the CMS or from the web content directory. An xhtml page has to be in webContent/view.',

    'tour.anonymousOn.title': 'Anonymous left on',
    'tour.anonymousDefault.title': 'The default of a new start',
    'tour.anonymousDefault.text': 'When you create a new process or start, Allow anonymous is checked. Nothing reminds you of it later.',
    'tour.anonymousRisk.title': 'Anyone may start it',
    'tour.anonymousRisk.text': 'With the check, anonymous users may start the process: whoever has the link, without logging in.',
    'tour.anonymousFix.title': 'How to fix it',
    'tour.anonymousFix.text': 'Review and restrict these settings before you deploy to a public or production environment, as the reference warns. Uncheck it, and name the role that may start the process; part 4 is about roles.',

    'tour.dataOnPage.title': 'Case data on the end page',
    'tour.pageNoData.title': 'Which space, which day?',
    'tour.pageNoData.text': 'The page confirms the booking but cannot say which space or which day. Even as the end page of a process, a static page has no access to the case and task.',
    'tour.pageFix.title': 'How to fix it',
    'tour.pageFix.text': 'To show the data of the case to the person, open a User Dialog before the end; part 5 shows how. Keep the end page for what is the same for everybody.'
  },

  ja: {
    'tour.intro.title': '誰が開始でき、どのように一覧に表示されるか',
    'tour.intro.text': 'オフィスの駐車スペースを予約する開始です。「リクエスト」タブのリンク、ユーザー向けの一覧での表示のされ方、誰が開始できるかを確認します。その後、Process End Page がページを表示します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.link': 'リンクで開始する',
    'tour.chapter.listed': '開始の一覧での表示',
    'tour.chapter.permission': '誰が開始できるか',
    'tour.chapter.endPage': 'Process End Page',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.startPerHttp.title': 'HTTP で開始する',
    'tour.startPerHttp.text': 'これがオンのとき、Start は HTTP リクエストで開始できます。オフにすると、Start にリンクはありません。',
    'tour.link.title': 'リンク',
    'tour.link.text': '開始リンクの名前です。必ず .ivp で終わり、プロセスの中で一意でなければなりません。',

    'tour.startList.title': '開始リストに表示する',
    'tour.startList.text': 'ユーザーが開始できるプロセスを選ぶ開始リストに、この開始を表示するかどうかです。',
    'tour.requestName.title': '名前',
    'tour.requestName.text': '開始リストに表示される名前です。ユーザーに向けて、開始すると何が得られるのかを書きます。',
    'tour.requestDescription.title': '説明',
    'tour.requestDescription.text': 'これも開始リストで、名前の下に表示されます。',
    'tour.category.title': 'カテゴリー',
    'tour.category.text': '開始リストで開始をグループにまとめます。施設チームの開始は、すべて同じカテゴリーにできます。',

    'tour.anonymousOff.title': '匿名を許可する',
    'tour.anonymousOff.text': 'ここではオフです。Axon Ivy エンジンに登録されたユーザーだけがプロセスを開始できます。オンにすると、匿名のユーザーも開始できます。',
    'tour.roles.title': 'ロール',
    'tour.roles.text': 'プロセスを開始するユーザーは、このロールを持っている必要があります。Everybody はすべてのユーザーです。ロールのないユーザーには違反エラーが発生し、Error Start で処理できます。',

    'tour.pageShown.title': '最後にページ',
    'tour.pageShown.text': 'Process End Page はプロセスを終了し、ページを表示します。ここでは予約の確認です。',
    'tour.pageField.title': '「終了ページ」タブ',
    'tour.pageField.text': 'ケースがこの要素で終わるときに表示されるページです。ここではプロジェクトの Web コンテンツのファイルです。',
    'tour.pageWhere.title': 'ページはどこから来るか',
    'tour.pageWhere.text': 'ページは CMS からも、Web コンテンツのディレクトリからも参照できます。xhtml のページは webContent/view に置く必要があります。',

    'tour.anonymousOn.title': '匿名が有効なまま',
    'tour.anonymousDefault.title': '新しい開始の既定値',
    'tour.anonymousDefault.text': '新しいプロセスや開始を作ると、「匿名を許可する」はオンになっています。後から気づかせてくれるものはありません。',
    'tour.anonymousRisk.title': '誰でも開始できる',
    'tour.anonymousRisk.text': 'オンのままだと、匿名のユーザーもプロセスを開始できます。リンクを知っていれば、ログインしなくても開始できます。',
    'tour.anonymousFix.title': '直し方',
    'tour.anonymousFix.text': 'リファレンスの警告のとおり、公開環境や本番環境にデプロイする前に設定を見直して制限します。オフにして、プロセスを開始できるロールを指定します。ロールはパート4で扱います。',

    'tour.dataOnPage.title': '終了ページにケースのデータ',
    'tour.pageNoData.title': 'どのスペースで、どの日？',
    'tour.pageNoData.text': 'ページは予約を確認しますが、どのスペースか、どの日かは言えません。プロセスの終了ページとして使っても、静的なページはケースとタスクにアクセスできません。',
    'tour.pageFix.title': '直し方',
    'tour.pageFix.text': 'ケースのデータを人に見せるには、終了の前に User Dialog を開きます。その方法はパート5で説明します。終了ページは、誰にとっても同じ内容に使います。'
  }
};
