import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, Search, X } from "lucide-react";
import {
  getContextEntries,
  getHandbookEntry,
  handbookCategories,
  handbookEntries,
  type HandbookCategoryId,
  type HandbookContext,
  type HandbookEntry,
} from "../handbook";

type HandbookMode = "context" | "index";
type CategoryFilter = "all" | HandbookCategoryId;

export function HandbookPage({
  context,
  mode,
  onOpenIndex,
  onOpenContext,
}: {
  context: HandbookContext;
  mode: HandbookMode;
  onOpenIndex: () => void;
  onOpenContext: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return handbookEntries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (!normalizedQuery) return true;
      return `${entry.title} ${entry.summary}`.toLocaleLowerCase().includes(normalizedQuery);
    });
  }, [category, query]);

  const selectedEntry = selectedEntryId ? getHandbookEntry(selectedEntryId) : undefined;

  if (selectedEntry) {
    return (
      <HandbookArticle
        entry={selectedEntry}
        backLabel={mode === "context" ? `Back to ${context.title}` : "Back to all topics"}
        onBack={() => setSelectedEntryId(null)}
        onOpenEntry={setSelectedEntryId}
      />
    );
  }

  if (mode === "index") {
    return (
      <section className="handbook-page handbook-index" aria-label="Full Handbook">
        <header className="handbook-index-heading">
          <span>Complete Wiki</span>
          <h2>All Topics</h2>
          <p>Browse every rule, progression system, reward source, and account mechanic.</p>
          <button className="context-return" onClick={onOpenContext}>
            <ArrowLeft size={15} />
            <span>Return to {context.title}</span>
          </button>
        </header>

        <label className="handbook-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the Handbook"
            aria-label="Search the Handbook"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </label>

        <div className="handbook-category-tabs" aria-label="Handbook categories">
          <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>All</button>
          {handbookCategories.map((item) => (
            <button
              key={item.id}
              className={category === item.id ? "active" : ""}
              onClick={() => setCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="handbook-list-heading">
          <h3>{category === "all" ? "Entries" : handbookCategories.find((item) => item.id === category)?.name}</h3>
          <span>{filteredEntries.length}</span>
        </div>

        {filteredEntries.length > 0 ? (
          <HandbookEntryList entries={filteredEntries} onOpenEntry={setSelectedEntryId} />
        ) : (
          <div className="handbook-empty">
            <Search size={22} />
            <strong>No matching entries</strong>
            <span>Try another name or category.</span>
          </div>
        )}
      </section>
    );
  }

  const contextEntries = getContextEntries(context);

  return (
    <section className="handbook-page handbook-context" aria-label={`${context.title} Handbook guide`}>
      <header className="handbook-context-intro">
        <span>Context Guide</span>
        <h2>{context.title}</h2>
        <p>{context.intro}</p>
      </header>

      <div className="handbook-list-heading">
        <h3>Relevant Topics</h3>
        <span>{contextEntries.length}</span>
      </div>
      <HandbookEntryList entries={contextEntries} onOpenEntry={setSelectedEntryId} />

      <button className="handbook-index-action" onClick={onOpenIndex}>
        <BookOpen size={18} />
        <span>
          <strong>Browse Full Handbook</strong>
          <small>{handbookEntries.length} entries across {handbookCategories.length} categories</small>
        </span>
        <ChevronRight size={17} />
      </button>
    </section>
  );
}

function HandbookEntryList({
  entries,
  onOpenEntry,
}: {
  entries: HandbookEntry[];
  onOpenEntry: (id: string) => void;
}) {
  return (
    <div className="handbook-entry-list">
      {entries.map((entry) => (
        <button key={entry.id} className="handbook-entry-row" onClick={() => onOpenEntry(entry.id)}>
          <span>
            <strong>{entry.title}</strong>
            <small>{entry.summary}</small>
          </span>
          <ChevronRight size={17} />
        </button>
      ))}
    </div>
  );
}

function HandbookArticle({
  entry,
  backLabel,
  onBack,
  onOpenEntry,
}: {
  entry: HandbookEntry;
  backLabel: string;
  onBack: () => void;
  onOpenEntry: (id: string) => void;
}) {
  const categoryName = handbookCategories.find((category) => category.id === entry.category)?.name ?? "Handbook";
  const relatedEntries = entry.relatedEntryIds?.flatMap((id) => {
    const related = getHandbookEntry(id);
    return related ? [related] : [];
  }) ?? [];

  return (
    <article className="handbook-page handbook-article" aria-label={entry.title}>
      <button className="handbook-article-back" onClick={onBack}>
        <ArrowLeft size={15} />
        <span>{backLabel}</span>
      </button>

      <header>
        <span>{categoryName}</span>
        <h2>{entry.title}</h2>
        <p>{entry.summary}</p>
      </header>

      <div className="handbook-article-body">
        {entry.sections.map((section, index) => (
          <section key={`${entry.id}-${index}`}>
            {section.heading && <h3>{section.heading}</h3>}
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      {relatedEntries.length > 0 && (
        <section className="handbook-related">
          <h3>Related Topics</h3>
          <HandbookEntryList entries={relatedEntries} onOpenEntry={onOpenEntry} />
        </section>
      )}
    </article>
  );
}
