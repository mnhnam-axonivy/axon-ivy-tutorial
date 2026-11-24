/**
 * Texts of the simulation in English and Japanese.
 *
 * Three kinds of text, looked up in this order:
 *   1. a walkthrough's own strings (tour.*, …), from its text.js
 *   2. the simulation's strings below
 *   3. "designer:<key>": a label of the real Designer's inscription view, in the Designer's own
 *      words (designer-labels.json, copied from the installed Designer by
 *      tools/extract-designer-labels.mjs). Placeholders are written {{name}} there.
 *
 * Element names ("element.<type>") follow the Process Elements Reference 14.0. The Designer's
 * palette takes them from the server, so no Japanese names could be copied: the Japanese texts
 * keep the English names, as the Japanese Designer shows them in the inscription title.
 */
import labels from './designer-labels.json' with { type: 'json' };

const ELEMENTS = {
  'element.RequestStart': 'Start',
  'element.CallSubStart': 'Sub Process Start',
  'element.SignalStartEvent': 'Signal Start',
  'element.ProgramStart': 'Program Start',
  'element.TaskEnd': 'Process End',
  'element.TaskEndPage': 'Process End Page',
  'element.CallSubEnd': 'Sub Process End',
  'element.ErrorEnd': 'Error End',
  'element.ErrorBoundaryEvent': 'Error Boundary Event',
  'element.Script': 'Script Step',
  'element.DialogCall': 'User Dialog',
  'element.UserTask': 'User Task',
  'element.SubProcessCall': 'Call Sub',
  'element.Alternative': 'Alternative',
  'element.Split': 'Split',
  'element.Join': 'Join',
  'element.ErrorStartEvent': 'Error Start',
  'element.EmbeddedProcess': 'Embedded Subprocess',
  'element.EmbeddedStart': 'Embedded Start',
  'element.EmbeddedEnd': 'Embedded End',
  'element.GenericBpmnElement': 'BPMN Generic Activity',
  'element.UserBpmnElement': 'BPMN User Activity',
  'element.ManualBpmnElement': 'BPMN Manual Activity',
  'element.ScriptBpmnElement': 'BPMN Script Activity',
  'element.ReceiveBpmnElement': 'BPMN Receive Activity',
  'element.RuleBpmnElement': 'BPMN Rule Activity',
  'element.SendBpmnElement': 'BPMN Send Activity',
  'element.ServiceBpmnElement': 'BPMN Service Activity',
  'element.ProcessAnnotation': 'Note'
};

export const STRINGS = {
  en: {
    ...ELEMENTS,
    'badge': 'Simulation',
    'about.title': 'About this simulation',
    'about.p1': 'A simplified Axon Ivy Designer that runs entirely in your browser. Nothing is sent anywhere and no engine is needed.',
    'about.p2': 'The process, its elements and their configuration are read from {file} in the guide project. Open that file in the Designer to see the same process.',
    'about.p3': 'A run follows the documented behaviour of each element. What the simulation cannot do, it says instead of guessing.',
    'about.close': 'Close',

    'run': 'Run',
    'run.tip': 'Start the process',
    'stop': 'Stop',
    'step': 'Step',
    'step.tip': 'Run one element at a time',
    'continue': 'Continue',
    'reset': 'Reset',
    'reset.tip': 'Clear the run and restore the original process',
    'zoom.in': 'Zoom in',
    'zoom.out': 'Zoom out',
    'zoom.fit': 'Fit to screen',
    'toggle.inscription': 'Show or hide the inscription view',
    'canvas.label': 'Process canvas of {file}. Arrow keys select the next or previous element, Enter opens its inscription view, plus and minus zoom.',
    'quick.inert': 'Not part of this simulation',

    'status.idle': 'Ready',
    'status.running': 'Running…',
    'status.paused': 'Paused before “{name}”',
    'status.completed': 'Completed',
    'status.failed': 'Failed at “{name}”',
    'status.incomplete': 'Stopped — the process is incomplete',
    'status.cancelled': 'Stopped',
    'status.stopped.join': 'Waiting at “{name}”',
    'status.stopped.empty': 'The token stays in “{name}”',
    'status.stopped.loop': 'Stopped — the loop did not end',

    'request.label': 'Request',
    'request.title': 'Start {link} with these parameters',
    'request.note': 'The values travel in the start link, as text: …/{link}?name=value',
    'request.send': 'Send request',
    'endpage.none': 'no page',
    'endpage.close': 'Close the page',
    'endpage.notSimulated': 'This page is not part of the simulation.',
    'endpage.empty': 'No page is set on the End Page tab.',
    // the kinds of process, as the Designer's commands name them (New Business Process, …; package.nls.json)
    'process.kind.NORMAL': 'Business Process',
    'process.kind.CALLABLE_SUB': 'Callable Sub Process',
    'process.kind.WEB_SERVICE': 'Web Service Process',
    'process.kind.HTML_DIALOG': 'User Dialog Logic',

    'note.start': 'A new case starts with fresh process data ({dataClass}).',
    'note.script': '“{name}” runs: first the mapping, then the code.',
    'note.end': 'The process has ended.',
    'note.end-page': 'The process ends and shows its end page.',
    'note.gateway': '{condition} is true, so the process continues with “{target}”.',
    'note.gateway-default': 'No condition before it is true, so the process continues with “{target}”.',
    'note.passthrough': '“{name}” is not simulated here; the token passes through.',
    'note.incomplete': 'An element is missing, so the process cannot continue.',
    'note.script.failed': 'Stopped with an error: {message}',
    'note.split': '“{name}” starts its paths. Each path has data of its own.',
    'note.join-wait': '“{name}” waits for the other paths.',
    'note.join': 'Every path has arrived: “{name}” goes on with one token.',
    'note.join-waits': 'The token waits at “{name}” for a path that never comes. Nothing after it runs.',
    'note.empty-box': '“{name}” has nothing inside: the token goes in and does not come out.',
    'note.call': '“{name}” calls “{target}”. The sub process starts with data of its own.',
    'note.sub-start': 'The sub process starts with new process data ({dataClass}).',
    'note.call-back': 'Back from the sub process: “{name}” maps its result into the process data.',
    'note.caught': '“{name}” catches the error {condition}.',
    'note.error-end': '“{name}” throws the error {condition} to the level above.',
    'note.error-uncaught': 'Nobody catches {condition}: the request fails.',
    'note.loop': 'The run went on for {count} elements, so the simulation stops it. On the engine nothing stops a loop.',

    'inscription.orientation': 'Shown as in the Designer. These settings have no effect in this simulation.',
    'inscription.notSimulated': 'Not simulated: has no effect here.',
    'inscription.default': 'default',
    'inscription.noParams': 'No input parameters.',
    'inscription.emptyCode': 'No code.',
    'inscription.signature': 'Signature: {signature}',

    'panel.log': 'Runtime Log',
    'panel.data': 'Process data',
    'panel.clear': 'Clear',
    'panel.toggle': 'Show or hide the panel',
    'log.empty': 'Run the process to see what it writes to the Runtime Log.',
    'data.empty': 'Process data appears here while the process runs.',
    'data.field': 'Attribute',
    'data.type': 'Type',
    'data.value': 'Value',
    'data.unset': 'empty',
    'data.param': 'Request parameters (param)',
    'data.in': 'Process data (in)',

    'dataclass.title': 'Data class {name}',
    'dataclass.text': 'Every element of the process sees this data as in. A new case starts with every attribute at its default.',
    'dataclass.attribute': 'Attribute',
    'dataclass.type': 'Type',
    'dataclass.comment': 'Comment',
    'dataclass.default': 'Starts as',

    'tour.kicker': 'Walkthrough',
    'tour.play': 'Play walkthrough',
    'tour.skip': 'Skip the walkthrough',
    'tour.pause': 'Pause',
    'tour.resume': 'Resume',
    'tour.back': 'Replay this chapter',
    'tour.backPart': 'Replay this part (twice: the one before)',
    'tour.next': 'Next',
    'tour.voice.on': 'Turn the voice on',
    'tour.voice.off': 'Turn the voice off',
    'tour.voice.none': 'No English voice in this browser',
    'tour.exit': 'Skip walkthrough',
    'tour.chapter': 'Chapter {n} of {total}',
    'tour.replay': 'Walkthrough',
    'tour.replay.all': 'Play from the start',
    'tour.replay.chapters': 'Or one chapter',
    'tour.quote.wrong': '(wrong)',
    'tour.end.title': 'End of the walkthrough',
    'tour.end.text': 'The process is back to how the guide ships it. Click an element to look at its fields again, change them, and run it yourself.',
    'tour.end.start': 'Close'
  },

  ja: {
    ...ELEMENTS,
    'badge': 'シミュレーション',
    'about.title': 'このシミュレーションについて',
    'about.p1': 'ブラウザー内だけで動作する、簡略化した Axon Ivy Designer です。外部には何も送信されず、Engine も不要です。',
    'about.p2': 'プロセス、要素、その設定はガイドプロジェクトの {file} から読み込んでいます。Designer でこのファイルを開くと、同じプロセスを確認できます。',
    'about.p3': '実行時の動きは、各要素のドキュメントに記載された動作に従います。シミュレーションできないことは、推測せずにそのことを表示します。',
    'about.close': '閉じる',

    'run': '実行',
    'run.tip': 'プロセスを開始します',
    'stop': '停止',
    'step': 'ステップ',
    'step.tip': '要素を1つずつ実行します',
    'continue': '続行',
    'reset': 'リセット',
    'reset.tip': '実行結果を消去し、プロセスを元に戻します',
    'zoom.in': '拡大',
    'zoom.out': '縮小',
    'zoom.fit': '全体を表示',
    'toggle.inscription': 'インスクリプションビューの表示／非表示',
    'canvas.label': '{file} のプロセスキャンバス。矢印キーで前後の要素を選択、Enter でインスクリプションビューを開き、プラス／マイナスで拡大・縮小します。',
    'quick.inert': 'このシミュレーションでは使用できません',

    'status.idle': '準備完了',
    'status.running': '実行中…',
    'status.paused': '「{name}」の手前で一時停止中',
    'status.completed': '完了',
    'status.failed': '「{name}」で失敗',
    'status.incomplete': '停止 — プロセスが未完成です',
    'status.cancelled': '停止しました',
    'status.stopped.join': '「{name}」で待機中',
    'status.stopped.empty': 'トークンは「{name}」の中に残っています',
    'status.stopped.loop': '停止 — ループが終わりませんでした',

    'request.label': 'リクエスト',
    'request.title': '次のパラメーターで {link} を開始',
    'request.note': '値はテキストとして開始リンクで渡されます: …/{link}?name=value',
    'request.send': 'リクエストを送信',
    'endpage.none': 'ページなし',
    'endpage.close': 'ページを閉じる',
    'endpage.notSimulated': 'このページはシミュレーションに含まれていません。',
    'endpage.empty': '「終了ページ」タブにページが設定されていません。',
    // プロセスの種類: Designer のコマンド名（新しいビジネスプロセス など, package.nls.ja.json）から
    'process.kind.NORMAL': 'ビジネスプロセス',
    'process.kind.CALLABLE_SUB': '呼び出し可能なサブプロセス',
    'process.kind.WEB_SERVICE': 'Web サービスプロセス',
    'process.kind.HTML_DIALOG': 'User Dialog ロジック',

    'note.start': '新しいケースが、初期状態のプロセスデータ（{dataClass}）で開始されます。',
    'note.script': '「{name}」を実行します。まずマッピング、次にコードです。',
    'note.end': 'プロセスが終了しました。',
    'note.end-page': 'プロセスが終了し、終了ページが表示されます。',
    'note.gateway': '{condition} が true のため、プロセスは「{target}」に進みます。',
    'note.gateway-default': 'それより前の条件がどれも true でないため、プロセスは「{target}」に進みます。',
    'note.passthrough': '「{name}」はここではシミュレーションされないため、トークンは通過します。',
    'note.incomplete': '要素が不足しているため、プロセスを続行できません。',
    'note.script.failed': 'エラーで停止しました: {message}',
    'note.split': '「{name}」がパスを開始します。各パスは自分のデータを持ちます。',
    'note.join-wait': '「{name}」はほかのパスを待ちます。',
    'note.join': 'すべてのパスがそろいました。「{name}」は1つのトークンで先に進みます。',
    'note.join-waits': 'トークンは「{name}」で、来ることのないパスを待っています。その後には何も実行されません。',
    'note.empty-box': '「{name}」の中には何もありません。トークンは入ったまま出てきません。',
    'note.call': '「{name}」が「{target}」を呼び出します。サブプロセスは自分のデータで開始します。',
    'note.sub-start': 'サブプロセスが新しいプロセスデータ（{dataClass}）で開始します。',
    'note.call-back': 'サブプロセスから戻りました。「{name}」が結果をプロセスデータにマッピングします。',
    'note.caught': '「{name}」がエラー {condition} をキャッチします。',
    'note.error-end': '「{name}」がエラー {condition} を上のレベルにスローします。',
    'note.error-uncaught': '{condition} をキャッチするものがないため、リクエストは失敗します。',
    'note.loop': '{count} 個の要素を実行しても終わらないため、シミュレーションが停止しました。Engine ではループを止めるものはありません。',

    'inscription.orientation': 'Designer と同じ表示です。これらの設定はこのシミュレーションでは効果がありません。',
    'inscription.notSimulated': 'シミュレーション対象外です。ここでは効果がありません。',
    'inscription.default': '既定値',
    'inscription.noParams': '入力パラメーターはありません。',
    'inscription.emptyCode': 'コードはありません。',
    'inscription.signature': 'シグネチャ: {signature}',

    'panel.log': 'ランタイムログ',
    'panel.data': 'プロセスデータ',
    'panel.clear': 'クリア',
    'panel.toggle': 'パネルの表示／非表示',
    'log.empty': 'プロセスを実行すると、ランタイムログへの出力がここに表示されます。',
    'data.empty': 'プロセスの実行中、ここにプロセスデータが表示されます。',
    'data.field': '属性',
    'data.type': 'タイプ',
    'data.value': '値',
    'data.unset': '空',
    'data.param': 'リクエストパラメーター（param）',
    'data.in': 'プロセスデータ（in）',

    'dataclass.title': 'データクラス {name}',
    'dataclass.text': 'プロセスのすべての要素は、このデータを in として参照します。新しいケースでは、すべての属性が既定値から始まります。',
    'dataclass.attribute': '属性',
    'dataclass.type': 'タイプ',
    'dataclass.comment': 'コメント',
    'dataclass.default': '初期値',

    'tour.kicker': 'ウォークスルー',
    'tour.play': 'ウォークスルーを再生',
    'tour.skip': 'ウォークスルーをスキップ',
    'tour.pause': '一時停止',
    'tour.resume': '再開',
    'tour.back': 'このチャプターをもう一度',
    'tour.backPart': 'この部分をもう一度（2回で前の部分へ）',
    'tour.next': '次へ',
    'tour.voice.on': '音声をオンにする',
    'tour.voice.off': '音声をオフにする',
    'tour.voice.none': 'このブラウザーには日本語の音声がありません',
    'tour.exit': 'ウォークスルーをスキップ',
    'tour.chapter': 'チャプター {n} / {total}',
    'tour.replay': 'ウォークスルー',
    'tour.replay.all': '最初から再生',
    'tour.replay.chapters': 'チャプターを選ぶ',
    'tour.quote.wrong': '（誤り）',
    'tour.end.title': 'ウォークスルーは以上です',
    'tour.end.text': 'プロセスはガイドの初期状態に戻っています。要素をクリックしてフィールドを確認し、変更して、自分で実行してみてください。',
    'tour.end.start': '閉じる'
  }
};

/** The guide calls Japanese "ja" or "jp"; everything else falls back to English. */
export function normalizeLanguage(lang) {
  const l = String(lang || 'en').toLowerCase();
  return l === 'jp' || l.startsWith('ja') ? 'ja' : 'en';
}

/** A label of the Designer by its dotted key, e.g. part.output.title; null when there is none. */
export function designerLabel(language, key) {
  let node = labels[language];
  for (const part of key.split('.')) node = node && typeof node === 'object' ? node[part] : undefined;
  return typeof node === 'string' ? node : null;
}

/**
 * @param {string} lang
 * @param {{en?:Object, ja?:Object}} [own]  a walkthrough's strings, looked up first
 * @returns {(key: string, params?: Object) => string}
 */
export function createTranslator(lang, own = {}) {
  const language = normalizeLanguage(lang);
  const sources = [own[language], STRINGS[language], own.en, STRINGS.en].filter(Boolean);
  return (key, params) => {
    let text = key;
    if (key.startsWith('designer:')) {
      const name = key.slice(9);
      text = designerLabel(language, name) || designerLabel('en', name) || name;
      if (params) text = text.replace(/\{\{(\w+)\}\}/g, (m, p) => (params[p] === undefined ? m : params[p]));
      return text;
    }
    for (const source of sources) {
      if (source[key] !== undefined) { text = source[key]; break; }
    }
    if (!params) return text;
    return String(text).replace(/\{(\w+)\}/g, (m, name) => (params[name] === undefined ? m : params[name]));
  };
}
