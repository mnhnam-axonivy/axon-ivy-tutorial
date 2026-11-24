/**
 * The Workflow tree, E-Mail: its skills in English.
 * Keys per skill as described in text/core.en.js.
 */
export default {
  email: {
    name: 'E-Mail',
    hook: 'Not everything is a task. Sometimes a process only has to tell someone.',
    def: 'An **E-Mail** step sends a mail from the process. Its Header says to whom and with which subject, its Content is the message, and data goes into both with `<%= %>`.',
    show: {
      title: 'The process writes a mail',
      tell: 'Anna’s leave is approved. Nobody has to do anything any more, but Anna should hear of it.',
      header: 'An E-Mail step sends her a mail. On its Header tab: Subject and To. An empty From becomes the engine’s own address.',
      data: 'Put data into the texts with <%= %>: Leave of <%=in.name%> arrives as “Leave of Anna”.',
      content: 'The Content tab holds the message. Its texts can come from the CMS, and its Type is plain text or HTML.',
      server: 'The mail is handed to the mail server, which is set in ivy.yaml. The step waits until the server has taken it, not for anyone to read it: then the token goes on.'
    },
    labels: { approve: 'Approve', tell: 'Tell Anna', headerTab: 'Header', contentTab: 'Content', subject: 'Subject', to: 'To', message: 'Message', type: 'Type', subjectSent: 'Leave of Anna', bodyCode: 'Hello <%=in.name%>, …', bodySent: 'Hello Anna, …', server: 'Mail server' },
    myths: [
      { myth: 'An E-Mail step creates a task for the person who gets the mail.', fact: 'It creates no task and waits for nobody. The mail is sent, and the token goes on in the task that is running.' },
      { myth: 'A mail’s text is fixed: every case sends the same words.', fact: 'Data goes into the Subject and the Message with `<%= %>`: `Leave of <%=in.name%>` arrives as “Leave of Anna”. The texts can come from the CMS too.' },
      { myth: 'To holds exactly one address.', fact: 'Several recipients go into To, separated by a comma or a semicolon. And there are CC and BCC.' }
    ],
    q: 'What does a process do at an E-Mail step?',
    options: ['It waits until the mail has been read', 'It sends the mail and goes on', 'It creates a task for the recipient'],
    why: 'An E-Mail step only sends. It creates no task and does not wait for anyone.'
  },

  mailerror: {
    name: 'When a mail fails',
    hook: 'A mail server can be down. A recipient can be missing.',
    def: 'If an [[email|E-Mail]] step cannot send its mail, it throws the error `ivy:error:email`. Uncaught, the process fails there. An **Error Boundary Event** on the step catches it and takes the process another way.',
    show: {
      title: 'The mail that did not go out',
      fail: 'The E-Mail step wants to send. But no mail server answers. A mail without a recipient ends the same way.',
      error: 'The step throws an error: ivy:error:email. Nobody catches it, so the process fails there. The leave is never booked.',
      catch: 'Put an Error Boundary Event on the E-Mail step, with that error code. Now the error is caught.',
      path: 'The process goes on along the boundary event’s own path: here a task for HR, to call Anna instead.',
      designer: 'In the Designer for VS Code, too, a mail needs a server that answers: by default it tries localhost:25. Until one is set in ivy.yaml, expect this error.'
    },
    labels: { tell: 'Tell Anna', book: 'Book leave', call: 'Call Anna', server: 'Mail server', noAnswer: 'No answer' },
    myths: [
      { myth: 'If a mail cannot be sent, the process goes on without it.', fact: 'The E-Mail step throws `ivy:error:email`. If nothing catches it, the process fails there, and what comes after does not run.' },
      { myth: 'A mail without a recipient is simply not sent.', fact: 'It is an error like any other: “No recipient addresses”, thrown as `ivy:error:email`. The Designer does not warn about an empty To.' },
      { myth: 'In the Designer, a mail step cannot fail.', fact: 'In the Designer for VS Code the engine sends to the server set in ivy.yaml (`EMail.Server.Host`, `Port`, …), localhost:25 by default. Without one there, the step fails with `ivy:error:email`.' }
    ],
    q: 'An E-Mail step fails because the mail server is down. An Error Boundary Event with `ivy:error:email` sits on it. What happens?',
    options: ['The error is caught, and the process goes on along the boundary event’s path', 'The process fails', 'The process waits until the server is back'],
    why: 'The boundary event catches the step’s error. Without it, the process would fail at the E-Mail step.'
  }
};
