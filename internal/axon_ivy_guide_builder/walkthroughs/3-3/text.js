/**
 * Walkthrough 3.3 — texts in English and Japanese.
 *
 * Sources: Process Elements Reference 14.0 — Script Step ("The entered code will be executed
 * after the execution of the output tab"; Disable Permission Checks and its warning);
 * IvyScript → Language ("Strings are initialized to an empty String").
 */
export const strings = {
  en: {
    'tour.intro.title': 'Mapping first, then code',
    'tour.intro.text': 'A Script Step whose mapping sets the usual discount and whose code changes it for large orders. You watch the two run one after the other, look at the option for permission checks, and meet two mistakes that come from the order.',
    'tour.intro.duration': 'about 2 min, 3 with the voice',
    'tour.chapter.order': 'Mapping first, then code',
    'tour.chapter.lastWord': 'The code has the last word',
    'tour.chapter.sudo': 'Disable Permission Checks',
    'tour.chapter.mistakes': 'Common mistakes',
    'tour.screen.mistake': 'Mistake {n} of {total}',
    'tour.count.mistake': '{n} mistakes',

    'tour.mapFirst.title': 'First the mapping',
    'tour.mapFirst.text': 'The mapping gives every order a discount of 5 and the level "standard".',
    'tour.codeAfter.title': 'Then the code',
    'tour.codeAfter.text': 'The code runs after the mapping. For an order over 1000 it sets the discount to 10 and the level to "gold".',
    'tour.afterMapping.title': 'After the mapping',
    'tour.afterMapping.text': 'The mapping has run, the code not yet: the discount is 5, the level "standard".',
    'tour.afterCode.title': 'After the code',
    'tour.afterCode.text': 'The order is worth 1500, so the code changed both: 10 and "gold". What the code sets last is what leaves the step.',
    'tour.smallOrder.title': 'A small order',
    'tour.smallOrder.text': 'An order of 400: the condition is false, the code changes nothing, and the values of the mapping leave the step.',

    'tour.sudo.title': 'Disable Permission Checks',
    'tour.sudo.text': 'With this option, the mapping and the code of this step run without permission checks, as SYSTEM. They never throw a PermissionDeniedException.',
    'tour.sudoWarning.title': 'Use it with care',
    'tour.sudoWarning.text': 'You have to make sure that only authorized users can reach this Script Step. The option has no effect in this simulation.',

    'tour.tooEarly.title': 'A mapping that needs the code',
    'tour.tooEarlyEdit.title': 'A message from the level',
    'tour.tooEarlyEdit.text': 'The mapping now builds a message from `in.level`.',
    'tour.tooEarlyResult.title': 'The level is missing',
    'tour.tooEarlyResult.text': 'The level is "gold", but the message says "Customer level: standard". The mapping ran before the code set the level: it saw only what the rows above it had set.',
    'tour.tooEarlyFix.title': 'How to fix it',
    'tour.tooEarlyFix.text': 'Build the message in the code, after the condition, from `out.level`.',
    'tour.tooEarlyFixed.title': 'Now it is there',
    'tour.tooEarlyFixed.text': '"Customer level: gold". Whatever depends on the code belongs in the code, below the line it depends on.',

    'tour.nullCheck.title': 'Checking text for null',
    'tour.nullEdit.title': 'An order without a customer',
    'tour.nullEdit.text': 'This check is meant to catch an order without a customer.',
    'tour.nullResult.title': 'Nothing is caught',
    'tour.nullResult.text': 'The customer is empty, yet the message was not set. In IvyScript a String is never null: an attribute starts as an empty String, and even `= null` leaves it empty. So `== null` is always false.',
    'tour.nullFix.title': 'How to fix it',
    'tour.nullFix.text': '`in.customer.isEmpty()` asks the right question: is there any text? `in.customer is initialized` asks another one: whether a value was ever assigned to it.',
    'tour.nullFixed.title': 'Now it is caught',
    'tour.nullFixed.text': 'The empty customer is found, and the message is set.'
  },

  ja: {
    'tour.intro.title': 'マッピングが先、コードが後',
    'tour.intro.text': 'マッピングで通常の割引を設定し、大口の注文ではコードがそれを変える Script Step です。2つが順に実行される様子、権限チェックのオプション、そして実行順序から生まれる2つの間違いを確認します。',
    'tour.intro.duration': '約2分（音声ありで約3分）',
    'tour.chapter.order': 'マッピングが先、コードが後',
    'tour.chapter.lastWord': '最後に決めるのはコード',
    'tour.chapter.sudo': '権限チェックの無効化',
    'tour.chapter.mistakes': 'よくある間違い',
    'tour.screen.mistake': '間違い {n} / {total}',
    'tour.count.mistake': '間違い {n} 件',

    'tour.mapFirst.title': 'まずマッピング',
    'tour.mapFirst.text': 'マッピングは、すべての注文に割引 5 とレベル "standard" を設定します。',
    'tour.codeAfter.title': '次にコード',
    'tour.codeAfter.text': 'コードはマッピングの後に実行されます。1000 を超える注文では、割引を 10、レベルを "gold" にします。',
    'tour.afterMapping.title': 'マッピングの後',
    'tour.afterMapping.text': 'マッピングは実行済みで、コードはまだです。割引は 5、レベルは "standard" です。',
    'tour.afterCode.title': 'コードの後',
    'tour.afterCode.text': '注文額は 1500 なので、コードが両方を 10 と "gold" に変えました。最後にコードが設定した値が、ステップから出ていきます。',
    'tour.smallOrder.title': '小口の注文',
    'tour.smallOrder.text': '400 の注文: 条件は false で、コードは何も変えず、マッピングの値がそのままステップから出ていきます。',

    'tour.sudo.title': '権限チェックの無効化',
    'tour.sudo.text': 'このオプションを有効にすると、このステップのマッピングとコードは権限チェックなしに、システムとして実行されます。PermissionDeniedException がスローされることはありません。',
    'tour.sudoWarning.title': '注意して使う',
    'tour.sudoWarning.text': 'この Script Step に到達できるのが権限のあるユーザーだけであることを、自分で保証する必要があります。このシミュレーションでは、このオプションは効果がありません。',

    'tour.tooEarly.title': 'コードの結果を必要とするマッピング',
    'tour.tooEarlyEdit.title': 'レベルからメッセージを作る',
    'tour.tooEarlyEdit.text': '今度はマッピングで、`in.level` からメッセージを作ります。',
    'tour.tooEarlyResult.title': 'レベルが入っていない',
    'tour.tooEarlyResult.text': 'レベルは "gold" なのに、メッセージは "Customer level: standard" です。マッピングは、コードがレベルを設定する前に実行されました。見えたのは、上の行が設定した値だけです。',
    'tour.tooEarlyFix.title': '直し方',
    'tour.tooEarlyFix.text': 'メッセージはコードの中で、条件の後に `out.level` から作ります。',
    'tour.tooEarlyFixed.title': '今度は入っている',
    'tour.tooEarlyFixed.text': '"Customer level: gold"。コードの結果に依存するものはコードの中に、依存する行より下に書きます。',

    'tour.nullCheck.title': 'テキストを null と比べる',
    'tour.nullEdit.title': '顧客のいない注文',
    'tour.nullEdit.text': 'このチェックは、顧客のいない注文を見つけるためのものです。',
    'tour.nullResult.title': '何も見つからない',
    'tour.nullResult.text': '顧客は空なのに、メッセージは設定されていません。IvyScript の String は null になりません。属性は空の String から始まり、`= null` としても空のままです。そのため `== null` は常に false です。',
    'tour.nullFix.title': '直し方',
    'tour.nullFix.text': '`in.customer.isEmpty()` なら正しく問えます。テキストが入っているかどうか、です。`in.customer is initialized` が問うのは別のこと、値が一度でも代入されたかどうかです。',
    'tour.nullFixed.title': '今度は見つかる',
    'tour.nullFixed.text': '空の顧客が見つかり、メッセージが設定されます。'
  }
};
