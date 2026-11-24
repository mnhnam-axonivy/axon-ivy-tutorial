/**
 * Walkthrough 3.2 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Script Step (the tip on mapping and code), Common
 * Tabs (Output: the code block); IvyScript → Language, Java Integration, Reference (ivy.log
 * and the Runtime Log). The error message and "CTRL + SPACE" are the Designer's own (14.0.1).
 */
export const strings = {
  en: {
    'tour.intro.title': 'Writing code',
    'tour.intro.text': 'A Script Step that works out the cost of shipping a parcel in its code: a local variable, two conditions, a Java method and a line in the log. Then five Java habits that IvyScript does not share.',
    'tour.intro.duration': 'about 4 min, 5 with the voice',
    'tour.chapter.variables': 'Variables',
    'tour.chapter.conditions': 'Conditions',
    'tour.chapter.java': 'Calling Java',
    'tour.chapter.log': 'Writing to the log',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',
    'tour.switchCase.title': 'A switch',
    'tour.typedList.title': 'A typed ArrayList',
    'tour.lambda.title': 'A lambda',
    'tour.earlyReturn.title': 'return, to stop early',
    'tour.numberFirst.title': 'A number before the text',

    'tour.codeBlock.title': 'The code',
    'tour.codeBlock.text': 'Below the mapping is the code. Simple assignments belong in the mapping table; the code is for what needs more: conditions, loops, several steps.',
    'tour.local.title': 'A local variable',
    'tour.local.text': '`Number price = 8;` declares a variable: its type, its name and a first value. It exists only while this code runs.',
    'tour.assign.title': 'Into the process data',
    'tour.assign.text': '`out.cost = price;` writes the result to the process data, so the elements after this step can use it.',

    'tour.ifWeight.title': 'A condition',
    'tour.ifWeight.text': 'The block after `if (in.weight > 10)` runs only when the parcel weighs more than 10 kg.',
    'tour.ifExpress.title': 'A second condition',
    'tour.ifExpress.text': '`express` is a Boolean, so it is a condition by itself. Express doubles the price.',
    'tour.costLight.title': 'A light parcel',
    'tour.costLight.text': '4 kg, no express: neither condition is true, the cost stays 8.',
    'tour.costHeavy.title': 'A heavy parcel, express',
    'tour.costHeavy.text': '12 kg with express: the price is 15, then doubled, so the cost is 30. Same code, other data.',

    'tour.javaCall.title': 'Java methods',
    'tour.javaCall.text': 'A text in IvyScript is a Java String, so its methods are there: `toUpperCase()` makes the country code upper case. Your own Java classes can be used the same way.',
    'tour.countryUpper.title': 'The result',
    'tour.countryUpper.text': '"ch" came in, "CH" goes out.',

    'tour.logCall.title': 'ivy.log',
    'tour.logCall.text': '`ivy.log.info(…)` writes a line to the Runtime Log. Besides info there are debug, warn and error.',
    'tour.logLine.title': 'In the Runtime Log',
    'tour.logLine.text': 'Here is the line the step wrote, with the text joined by `+`. Logging values is the quickest way to see what a step does.',

    'tour.switchMarked.title': 'IvyScript has no switch',
    'tour.switchMarked.text': 'A surcharge for Germany, written as in Java. The Designer stops at the brace: Unexpected token: \'{\'.',
    'tour.switchFix.title': 'How to fix it',
    'tour.switchFix.text': 'Write it with if and else if: `if (in.country == "de") { price = price + 4; }`. In IvyScript `==` compares the text itself, so it is the right way to compare Strings, unlike in Java.',

    'tour.listMarked.title': 'No ArrayList without an import',
    'tour.listMarked.text': 'A list of labels, created as in Java. The Designer: Class ArrayList<String> not found. IvyScript knows its own List, and java.lang, not java.util.',
    'tour.listFix.title': 'How to fix it',
    'tour.listFix.text': 'Use the Ivy List: `new List<String>()`, or a list literal: `["fragile"]`. An ArrayList works with `import java.util.ArrayList;` or its full name. `new ArrayList<>()` and a Map with two types never work: List is the only generic type IvyScript understands.',

    'tour.lambdaMarked.title': 'IvyScript has no lambdas',
    'tour.lambdaMarked.text': 'forEach with a lambda. The Designer does not get past the arrow: Unexpected token: \'>\'. Streams with lambdas fail the same way.',
    'tour.lambdaFix.title': 'How to fix it',
    'tour.lambdaFix.text': 'Loop over the list: `for (String l : labels) { ivy.log.info("Label: " + l); }`. If the logic needs streams or lambdas, put it into a Java class and call that.',

    'tour.returnMarked.title': 'return is not a keyword',
    'tour.returnMarked.text': 'A parcel over 30 kg should stop the code. IvyScript reads `return` as a name: Variable \'return\' cannot be resolved.',
    'tour.returnRan.title': 'Half of it ran',
    'tour.returnRan.text': 'Run with a 35 kg parcel: the warning was written, then the step failed when it reached `return`. The request ends with ivy:error:script. With a light parcel nothing fails, because `return` is never reached.',
    'tour.returnFix.title': 'How to fix it',
    'tour.returnFix.text': 'IvyScript has no return and no throw. Put the rest of the code into an else. Better: let an Alternative before the step send heavy parcels another way (walkthrough 3.4).',

    'tour.plusMarked.title': 'The cost in the log line',
    'tour.plusMarked.text': 'The line now starts with `out.cost`, a Number, and then + and text. The Designer marks it: Method +(String) for class Number of classloader null not found.',
    'tour.plusFix.title': 'How to fix it',
    'tour.plusFix.text': 'Start with text: `"Cost " + out.cost + " CHF"`. Text on the left of + joins, and the number becomes part of the text. A Number on the left has no + that takes text.'
  },

  ja: {
    'tour.intro.title': 'コードを書く',
    'tour.intro.text': '小包の送料をコードで計算する Script Step です。ローカル変数、2つの条件、Java のメソッド、そしてログへの1行を確認します。その後、IvyScript にはない Java の書き方を5つ見ます。',
    'tour.intro.duration': '約4分（音声ありで約5分）',
    'tour.chapter.variables': '変数',
    'tour.chapter.conditions': '条件',
    'tour.chapter.java': 'Java の呼び出し',
    'tour.chapter.log': 'ログへの出力',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',
    'tour.switchCase.title': 'switch',
    'tour.typedList.title': '型付きの ArrayList',
    'tour.lambda.title': 'ラムダ式',
    'tour.earlyReturn.title': '途中で終えるための return',
    'tour.numberFirst.title': 'テキストの前に数値',

    'tour.codeBlock.title': 'コード',
    'tour.codeBlock.text': 'マッピングの下にコードがあります。単純な代入はマッピングの表に書き、条件、ループ、複数の手順など、それ以上が必要なものをコードに書きます。',
    'tour.local.title': 'ローカル変数',
    'tour.local.text': '`Number price = 8;` は変数を宣言します。タイプ、名前、最初の値です。この変数はこのコードが実行されている間だけ存在します。',
    'tour.assign.title': 'プロセスデータへ',
    'tour.assign.text': '`out.cost = price;` は結果をプロセスデータに書き込みます。これで、このステップより後の要素がその値を使えます。',

    'tour.ifWeight.title': '条件',
    'tour.ifWeight.text': '`if (in.weight > 10)` の後のブロックは、小包が 10 kg より重いときだけ実行されます。',
    'tour.ifExpress.title': '2つ目の条件',
    'tour.ifExpress.text': '`express` は Boolean なので、それだけで条件になります。速達だと料金は2倍です。',
    'tour.costLight.title': '軽い小包',
    'tour.costLight.text': '4 kg、速達なし: どちらの条件も true ではないので、送料は 8 のままです。',
    'tour.costHeavy.title': '重い小包、速達',
    'tour.costHeavy.text': '12 kg で速達: 料金は 15、それが2倍になり、送料は 30 です。同じコードで、データが違います。',

    'tour.javaCall.title': 'Java のメソッド',
    'tour.javaCall.text': 'IvyScript のテキストは Java の String なので、そのメソッドが使えます。`toUpperCase()` は国コードを大文字にします。自分で作った Java クラスも同じように使えます。',
    'tour.countryUpper.title': '結果',
    'tour.countryUpper.text': '"ch" が入り、"CH" が出ていきます。',

    'tour.logCall.title': 'ivy.log',
    'tour.logCall.text': '`ivy.log.info(…)` はランタイムログに1行を書き込みます。info のほかに debug、warn、error があります。',
    'tour.logLine.title': 'ランタイムログの中',
    'tour.logLine.text': 'ステップが書いた行がこれです。テキストは `+` でつなげています。値をログに出すのが、ステップの動きを確認するいちばん早い方法です。',

    'tour.switchMarked.title': 'IvyScript に switch はない',
    'tour.switchMarked.text': 'ドイツ向けの追加料金を、Java と同じように書きました。Designer は波かっこで止まります: Unexpected token: \'{\'',
    'tour.switchFix.title': '直し方',
    'tour.switchFix.text': 'if と else if で書きます: `if (in.country == "de") { price = price + 4; }`。IvyScript の `==` はテキストの中身を比べるので、Java と違い、String を比べる正しい方法です。',

    'tour.listMarked.title': 'import なしでは ArrayList は使えない',
    'tour.listMarked.text': 'ラベルのリストを Java と同じように作りました。Designer: Class ArrayList<String> not found。IvyScript が知っているのは自分の List と java.lang で、java.util ではありません。',
    'tour.listFix.title': '直し方',
    'tour.listFix.text': 'Ivy の List を使います: `new List<String>()`、またはリストのリテラル `["fragile"]`。ArrayList は `import java.util.ArrayList;` か完全な名前なら使えます。`new ArrayList<>()` と、2つの型を持つ Map は決して使えません。IvyScript が理解するジェネリック型は List だけです。',

    'tour.lambdaMarked.title': 'IvyScript にラムダ式はない',
    'tour.lambdaMarked.text': 'ラムダ式を使った forEach です。Designer は矢印の先に進めません: Unexpected token: \'>\'。ラムダ式を使うストリームも同じように失敗します。',
    'tour.lambdaFix.title': '直し方',
    'tour.lambdaFix.text': 'リストをループで回します: `for (String l : labels) { ivy.log.info("Label: " + l); }`。ストリームやラムダ式が必要な処理は Java のクラスに書き、それを呼び出します。',

    'tour.returnMarked.title': 'return はキーワードではない',
    'tour.returnMarked.text': '30 kg を超える小包ではコードを止めたいとします。IvyScript は `return` を名前として読みます: Variable \'return\' cannot be resolved',
    'tour.returnRan.title': '半分だけ実行された',
    'tour.returnRan.text': '35 kg の小包で実行すると、警告は書き込まれ、`return` に達したところでステップが失敗しました。リクエストは ivy:error:script で終わります。軽い小包では `return` に達しないので、何も失敗しません。',
    'tour.returnFix.title': '直し方',
    'tour.returnFix.text': 'IvyScript には return も throw もありません。残りのコードを else に入れます。もっと良いのは、ステップの前の Alternative で重い小包を別の道に送ることです（ウォークスルー 3.4）。',

    'tour.plusMarked.title': 'ログの行に送料',
    'tour.plusMarked.text': '行が Number の `out.cost` で始まり、その後に + とテキストが続きます。Designer は印を付けます: Method +(String) for class Number of classloader null not found',
    'tour.plusFix.title': '直し方',
    'tour.plusFix.text': 'テキストから始めます: `"Cost " + out.cost + " CHF"`。+ の左がテキストならつなげられ、数値はテキストの一部になります。左が Number だと、テキストを受け取る + がありません。'
  }
};
