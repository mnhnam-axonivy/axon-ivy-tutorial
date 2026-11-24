package tutorial.guide;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import ch.ivyteam.ivy.cm.ContentObject;
import ch.ivyteam.ivy.cm.ContentObjectValue;
import ch.ivyteam.ivy.environment.Ivy;
import jakarta.annotation.PostConstruct;
import jakarta.faces.view.ViewScoped;
import jakarta.inject.Named;

/**
 * Hands the element documents of the guide to the AxonIvyGuide dialog: every file under
 * /Files/Elements in the CMS (cms/Files/Elements/&lt;name&gt;_en.md, &lt;name&gt;_ja.md), in each
 * language it has. The page script (js/axon-ivy-guide.js) renders them.
 */
@Named
@ViewScoped
public class GuideBean implements Serializable {

  private static final long serialVersionUID = 1L;
  private static final String DOCUMENTS = "/Files/Elements";

  /** One element document in one language. */
  public static class Document implements Serializable {
    private static final long serialVersionUID = 1L;
    private final String name;
    private final String lang;
    private final String text;

    Document(String name, String lang, String text) {
      this.name = name;
      this.lang = lang;
      this.text = text;
    }

    public String getName() {
      return name;
    }

    public String getLang() {
      return lang;
    }

    public String getText() {
      return text;
    }
  }

  private final List<Document> documents = new ArrayList<>();

  @PostConstruct
  public void init() {
    Optional<ContentObject> folder = Ivy.cm().findObject(DOCUMENTS);
    if (folder.isEmpty() || !folder.get().exists()) {
      Ivy.log().warn("The guide found no element documents at " + DOCUMENTS);
      return;
    }
    for (ContentObject document : folder.get().children()) {
      for (ContentObjectValue value : document.values()) {
        Locale locale = value.locale();
        String lang = locale == null || locale.getLanguage().isEmpty() ? "en" : locale.getLanguage();
        try {
          documents.add(new Document(document.name(), lang, value.read().string()));
        } catch (RuntimeException ex) {
          Ivy.log().error("Could not read the element document " + document.uri() + " (" + lang + ")", ex);
        }
      }
    }
    documents.sort(Comparator.comparing(Document::getName).thenComparing(Document::getLang));
  }

  public List<Document> getDocuments() {
    return documents;
  }

  /** "ja" when the session's content language is Japanese, otherwise "en". */
  public String getSessionLang() {
    Locale locale = Ivy.session().getContentLocale();
    return locale != null && "ja".equals(locale.getLanguage()) ? "ja" : "en";
  }
}
