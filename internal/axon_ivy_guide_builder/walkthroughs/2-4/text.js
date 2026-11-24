/**
 * Walkthrough 2.4 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Script Step, Common Tabs (Output); IvyScript →
 * Reference (ivy.log). The layout of a Runtime Log line is the Designer's own: the "Axon Ivy
 * Runtime Log" output channel writes [project] [category] [process element] message after the
 * time and the level (vscode-designer, extension/src/views/runtimelog-view.ts). The command
 * names are the Designer's (package.nls.json, package.nls.ja.json).
 */
export const strings = {
  en: {
    'tour.intro.title': 'A first Script Step: run it and read the log',
    'tour.intro.text': 'A process that greets a person. One Script Step changes one value and writes one line to the log. You watch the data at each step of the run, and see two mistakes that only the log shows.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.oneValue': 'Changing one value',
    'tour.chapter.log': 'Writing one line to the log',
    'tour.chapter.eachStep': 'The data at each step',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.row.title': 'One row of the mapping',
    'tour.row.text': 'The Output tab of the Script Step has one row per attribute. The row of `greeting` has an expression; the row of `name` has none, so `name` stays as it is.',
    'tour.expression.title': 'Text and an attribute',
    'tour.expression.text': '"Hello " is text in quotes, `in.name` is the name that came in. `+` joins them.',
    'tour.greetingSet.title': 'The new value',
    'tour.greetingSet.text': 'After the mapping, `greeting` is "Hello Anna".',

    'tour.logCode.title': 'One line of code',
    'tour.logCode.text': 'Below the mapping, the code writes the greeting to the Runtime Log. The code runs after the mapping, so `out.greeting` already has its value.',
    'tour.logLine.title': 'In the Runtime Log',
    'tour.logLine.text': 'Here is the line. In the Designer it is in the Output view, channel Axon Ivy Runtime Log; the command Open Axon Ivy Runtime Log opens it.',
    'tour.logParts.title': 'What a line says',
    'tour.logParts.text': 'The time, the level (info), the project, the category, the element that wrote it (the id of the process and of the element), then the message.',

    'tour.stepStart.title': 'After the Start',
    'tour.stepStart.text': '`name` is "Anna", `greeting` is still empty: the Start only maps its parameter.',
    'tour.stepEnter.title': 'The token arrives',
    'tour.stepEnter.text': 'The Script Step gets the data as `in`, exactly as the Start left it.',
    'tour.stepMapped.title': 'After the mapping',
    'tour.stepMapped.text': '`greeting` has its value. The code runs next and writes it to the log.',
    'tour.stepEnd.title': 'At the end',
    'tour.stepEnd.text': 'The Process End terminates the process; this is the data the run ended with.',
    'tour.stepButton.title': 'One element at a time',
    'tour.stepButton.text': 'In this simulation, Step runs the process one element at a time, so you can look at the data in between. In the Designer, breakpoints do the same.',

    'tour.noSpace.title': 'A missing space',
    'tour.noSpaceEdit.title': 'No space after Hello',
    'tour.noSpaceEdit.text': 'The space inside the quotes is gone. The Designer reports nothing: the expression is correct.',
    'tour.noSpaceLog.title': 'Only the log shows it',
    'tour.noSpaceLog.text': '"HelloAnna". `+` joins exactly what it gets and adds nothing.',
    'tour.noSpaceFix.title': 'How to fix it',
    'tour.noSpaceFix.text': 'Put the space inside the text: `"Hello " + in.name`. Logging a value you build is the quickest way to see what it really is.',

    'tour.quotedAttribute.title': 'The attribute inside the quotes',
    'tour.quotedEdit.title': 'All of it in quotes',
    'tour.quotedEdit.text': 'Now `in.name` stands inside the quotes. That is valid text, so again the Designer reports nothing.',
    'tour.quotedLog.title': 'The words, not the value',
    'tour.quotedLog.text': '"Hello in.name": inside quotes, in.name is just letters.',
    'tour.quotedFix.title': 'How to fix it',
    'tour.quotedFix.text': 'Close the quotes before the attribute and join it with `+`: `"Hello " + in.name`.'
  },

  ja: {
    'tour.intro.title': '最初の Script Step: 実行してログを読む',
    'tour.intro.text': '人にあいさつするプロセスです。1つの Script Step が1つの値を変え、ログに1行を書き込みます。実行の各ステップでデータを確認し、ログにしか現れない2つの間違いを見ます。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.oneValue': '1つの値を変える',
    'tour.chapter.log': 'ログに1行を書く',
    'tour.chapter.eachStep': '各ステップのデータ',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.row.title': 'マッピングの1行',
    'tour.row.text': 'Script Step の「出力」タブには属性ごとに1行があります。`greeting` の行には式があり、`name` の行にはないので、`name` はそのままです。',
    'tour.expression.title': 'テキストと属性',
    'tour.expression.text': '"Hello " は引用符で囲んだテキスト、`in.name` は入ってきた名前です。`+` がそれをつなげます。',
    'tour.greetingSet.title': '新しい値',
    'tour.greetingSet.text': 'マッピングの後、`greeting` は "Hello Anna" です。',

    'tour.logCode.title': '1行のコード',
    'tour.logCode.text': 'マッピングの下で、コードがあいさつをランタイムログに書き込みます。コードはマッピングの後に実行されるので、`out.greeting` にはもう値があります。',
    'tour.logLine.title': 'ランタイムログの中',
    'tour.logLine.text': 'これがその行です。Designer では「出力」ビューのチャネル Axon Ivy Runtime Log にあり、コマンド「Axon Ivy ランタイムログを開く」で開きます。',
    'tour.logParts.title': '1行が表すもの',
    'tour.logParts.text': '時刻、レベル（info）、プロジェクト、カテゴリー、書き込んだ要素（プロセスと要素の ID）、そしてメッセージです。',

    'tour.stepStart.title': 'Start の後',
    'tour.stepStart.text': '`name` は "Anna"、`greeting` はまだ空です。Start はパラメーターをマッピングするだけです。',
    'tour.stepEnter.title': 'トークンが到着する',
    'tour.stepEnter.text': 'Script Step は、Start が残したとおりのデータを `in` として受け取ります。',
    'tour.stepMapped.title': 'マッピングの後',
    'tour.stepMapped.text': '`greeting` に値が入りました。次にコードが実行され、それをログに書き込みます。',
    'tour.stepEnd.title': '最後に',
    'tour.stepEnd.text': 'Process End がプロセスを終了します。これが、実行が終わったときのデータです。',
    'tour.stepButton.title': '1要素ずつ',
    'tour.stepButton.text': 'このシミュレーションでは「ステップ」でプロセスを1要素ずつ実行でき、その間にデータを確認できます。Designer ではブレークポイントで同じことができます。',

    'tour.noSpace.title': 'スペースの抜け',
    'tour.noSpaceEdit.title': 'Hello の後にスペースがない',
    'tour.noSpaceEdit.text': '引用符の中のスペースがなくなりました。式としては正しいので、Designer は何も報告しません。',
    'tour.noSpaceLog.title': 'ログにだけ現れる',
    'tour.noSpaceLog.text': '"HelloAnna"。`+` は受け取ったものをそのままつなげ、何も付け加えません。',
    'tour.noSpaceFix.title': '直し方',
    'tour.noSpaceFix.text': 'スペースはテキストの中に入れます: `"Hello " + in.name`。組み立てた値をログに出すのが、その値が本当はどうなっているかを確かめるいちばん早い方法です。',

    'tour.quotedAttribute.title': '引用符の中の属性',
    'tour.quotedEdit.title': '全部が引用符の中',
    'tour.quotedEdit.text': '今度は `in.name` が引用符の中にあります。テキストとしては正しいので、やはり Designer は何も報告しません。',
    'tour.quotedLog.title': '値ではなく文字',
    'tour.quotedLog.text': '"Hello in.name"。引用符の中では、in.name はただの文字です。',
    'tour.quotedFix.title': '直し方',
    'tour.quotedFix.text': '属性の前で引用符を閉じ、`+` でつなげます: `"Hello " + in.name`。'
  }
};
