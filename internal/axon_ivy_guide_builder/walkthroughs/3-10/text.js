/**
 * Walkthrough 3.10 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Error End ("leave the happy path of a process by
 * throwing an error"), Error Boundary Event ("The execution is then redirected to this Error
 * Boundary Event element"); Error Handling (error codes refined with ":", an empty code
 * "catches every error", "The Error End Event throws the error to the upper process level").
 * What the Runtime Log shows for an error nobody catches, and that a script error is
 * ivy:error:script, were read on the Designer's engine 14.0.1 (PROGRESS.md).
 */
export const strings = {
  en: {
    'tour.intro.title': 'Throwing and catching an error',
    'tour.intro.text': 'A room is booked through a sub process. When the room is too small, the sub process throws an error, and the process that called it catches it and offers another room. You see the Error End, the Error Boundary Event that catches its error, two runs, and two mistakes with error codes.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.thrown': 'Throwing',
    'tour.chapter.caught': 'Catching',
    'tour.chapter.runs': 'Two runs',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.roomCheck.title': 'Room big enough?',
    'tour.roomCheck.text': 'The sub process ReserveRoom checks the room: up to 8 people it reserves it.',
    'tour.errorEnd.title': 'An Error End',
    'tour.errorEnd.text': 'Otherwise it ends here, at an Error End. It ends the process with an error instead of a result: the way off the happy path.',
    'tour.throwCode.title': 'Its error code',
    'tour.throwCode.text': 'The Error tab names the error it throws: `booking:full`. A colon refines a code: `booking` is the topic, `full` what went wrong.',

    'tour.boundary.title': 'An Error Boundary Event',
    'tour.boundary.text': 'In the process that calls, an Error Boundary Event sits on the Call Sub. If the call ends with an error it catches, the token leaves by this event instead of the normal connector.',
    'tour.catchCode.title': 'What it catches',
    'tour.catchCode.text': '`booking` catches every error whose code starts with `booking`: `booking:full` and any other `booking:…`. `*:full` would catch every `…:full`, and an empty code catches every error.',
    'tour.errorVar.title': 'The error itself',
    'tour.errorVar.text': 'Its Output has the variable `error`, the BpmError that was caught. `error.getErrorCode()` gives its code.',

    'tour.booked.title': '4 people: booked',
    'tour.booked.text': 'The room is big enough: the sub process returned a reservation, and the normal path ran.',
    'tour.throws.title': 'The sub process throws',
    'tour.throws.text': '12 people: the sub process reaches its Error End and throws `booking:full` to the process that called it.',
    'tour.caughtHere.title': 'Caught on the Call Sub',
    'tour.caughtHere.text': 'The boundary event on the Call Sub catches the error, and the token goes on from it.',
    'tour.offer.title': 'Another room',
    'tour.offer.text': 'The error path ran. The message was built in the boundary\'s Output, with the error\'s code.',

    'tour.noMatch.title': 'A code that does not match',
    'tour.paymentEdit.title': 'Another code',
    'tour.paymentEdit.text': 'The boundary now catches `payment`. The Designer reports nothing: any text is a code.',
    'tour.uncaught.title': 'Nobody catches it',
    'tour.uncaught.text': 'No handler takes `booking:full`, so the request fails. The Runtime Log: Problem while processing request, caused by BpmError booking:full.',
    'tour.noMatchFix.title': 'How to fix it',
    'tour.noMatchFix.text': 'Catch the code the Error End throws, or a part of it: `booking:full` or `booking`. Keep the codes of a project in one place, so that thrower and catcher agree.',
    'tour.catchAll.title': 'An empty code catches a bug too',
    'tour.emptyEdit.title': 'Catch everything',
    'tour.emptyEdit.text': 'The boundary\'s code is now empty: << Empty >>, which catches all errors.',
    'tour.bugEdit.title': 'A bug in the sub process',
    'tour.bugEdit.text': 'In ReserveRoom, the code now takes 12 characters of the room\'s name. "Matterhorn" has 10.',
    'tour.bugCaught.title': 'A bug that looks like a full room',
    'tour.bugCaught.text': 'The script failed with ivy:error:script, and the empty code caught that too: the person is offered another room for 4 people, and nobody learns about the bug.',
    'tour.catchAllFix.title': 'How to fix it',
    'tour.catchAllFix.text': 'Catch the errors you expect and can handle, by their code. Leave the others to fail, or to one handler that reports them (walkthrough 3.11).'
  },
  ja: {
    'tour.intro.title': 'エラーのスローとキャッチ',
    'tour.intro.text': 'サブプロセスを通じて会議室を予約します。部屋が小さすぎると、サブプロセスはエラーをスローし、呼び出したプロセスがそれをキャッチして別の部屋を提案します。Error End、そのエラーをキャッチする Error Boundary Event、2回の実行、そしてエラーコードにかかわる2つの間違いを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.thrown': 'スロー',
    'tour.chapter.caught': 'キャッチ',
    'tour.chapter.runs': '2回の実行',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.roomCheck.title': '部屋は十分な広さか',
    'tour.roomCheck.text': 'サブプロセス ReserveRoom が部屋を確認します。8人までなら予約します。',
    'tour.errorEnd.title': 'Error End',
    'tour.errorEnd.text': 'それ以外はここ、Error End で終わります。結果の代わりにエラーでプロセスを終えます。正常なパスから外れる道です。',
    'tour.throwCode.title': 'エラーコード',
    'tour.throwCode.text': '「エラー」タブに、スローするエラーの名前があります: `booking:full`。コロンでコードを細かくします。`booking` が話題、`full` が起きたことです。',

    'tour.boundary.title': 'Error Boundary Event',
    'tour.boundary.text': '呼び出す側のプロセスでは、Call Sub に Error Boundary Event が付いています。呼び出しがこのイベントのキャッチするエラーで終わると、トークンは通常のコネクターの代わりにこのイベントから出ます。',
    'tour.catchCode.title': 'キャッチするもの',
    'tour.catchCode.text': '`booking` は、コードが `booking` で始まるエラーをすべてキャッチします。`booking:full` も、ほかの `booking:…` もです。`*:full` ならすべての `…:full` を、空のコードならすべてのエラーをキャッチします。',
    'tour.errorVar.title': 'エラーそのもの',
    'tour.errorVar.text': '「出力」には変数 `error` があります。キャッチした BpmError です。`error.getErrorCode()` でそのコードが分かります。',

    'tour.booked.title': '4人: 予約完了',
    'tour.booked.text': '部屋は十分な広さです。サブプロセスが予約を返し、通常のパスが実行されました。',
    'tour.throws.title': 'サブプロセスがスローする',
    'tour.throws.text': '12人: サブプロセスは Error End に到達し、呼び出したプロセスに `booking:full` をスローします。',
    'tour.caughtHere.title': 'Call Sub でキャッチ',
    'tour.caughtHere.text': 'Call Sub の境界イベントがエラーをキャッチし、トークンはそこから先に進みます。',
    'tour.offer.title': '別の部屋',
    'tour.offer.text': 'エラーのパスが実行されました。メッセージは境界イベントの「出力」で、エラーのコードを使って作られました。',

    'tour.noMatch.title': '合わないコード',
    'tour.paymentEdit.title': '別のコード',
    'tour.paymentEdit.text': '境界イベントは今 `payment` をキャッチします。Designer は何も報告しません。どんなテキストもコードになります。',
    'tour.uncaught.title': '誰もキャッチしない',
    'tour.uncaught.text': '`booking:full` を引き受けるハンドラーがないので、リクエストは失敗します。ランタイムログ: Problem while processing request、原因は BpmError booking:full。',
    'tour.noMatchFix.title': '直し方',
    'tour.noMatchFix.text': 'Error End がスローするコード、またはその一部をキャッチします: `booking:full` または `booking`。プロジェクトのコードは1か所にまとめ、スローする側とキャッチする側で食い違わないようにします。',
    'tour.catchAll.title': '空のコードはバグもキャッチする',
    'tour.emptyEdit.title': 'すべてをキャッチ',
    'tour.emptyEdit.text': '境界イベントのコードが空になりました: << 空白 >>。すべてのエラーをキャッチします。',
    'tour.bugEdit.title': 'サブプロセスのバグ',
    'tour.bugEdit.text': 'ReserveRoom のコードが、部屋の名前から12文字を取り出すようになりました。「Matterhorn」は10文字です。',
    'tour.bugCaught.title': '満室に見えるバグ',
    'tour.bugCaught.text': 'スクリプトは ivy:error:script で失敗し、空のコードはそれもキャッチしました。4人なのに別の部屋が提案され、バグに気づく人はいません。',
    'tour.catchAllFix.title': '直し方',
    'tour.catchAllFix.text': '予想していて処理できるエラーを、そのコードでキャッチします。それ以外は失敗させるか、報告する1つのハンドラーに任せます（ウォークスルー 3.11）。'
  }
};
