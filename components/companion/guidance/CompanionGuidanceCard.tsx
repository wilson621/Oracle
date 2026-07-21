import {
  BookMarked,
  Clock3,
  ExternalLink,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import type {
  CompanionGuidanceCardViewModel,
} from "@/lib/oracle/applications/companion";
import styles from "./companion-guidance.module.css";

type CompanionGuidanceCardProps =
  Readonly<{
    card:
      CompanionGuidanceCardViewModel;
    headingId: string;
  }>;

export default function CompanionGuidanceCard({
  card,
  headingId,
}: CompanionGuidanceCardProps) {
  return (
    <article
      className={styles.card}
      aria-labelledby={headingId}
    >
      <div className={styles.cardMeta}>
        <span className={styles.category}>
          {card.category.label}
        </span>
        <span className={styles.type}>
          {card.type.label}
        </span>
      </div>

      <h3
        id={headingId}
        className={styles.cardTitle}
      >
        {card.title}
      </h3>
      <p className={styles.cardSummary}>
        {card.summary}
      </p>

      <section
        className={styles.recommendation}
        aria-label="Recommendation"
      >
        <Lightbulb
          size={18}
          aria-hidden="true"
        />
        <div>
          <p
            className={
              styles.recommendationLabel
            }
          >
            Consider next
          </p>
          <p
            className={
              styles.recommendationText
            }
          >
            {card.recommendation}
          </p>
        </div>
      </section>

      <dl className={styles.metrics}>
        <Metric
          label="Confidence"
          value={`${card.confidence.level.label} · ${Math.round(card.confidence.score * 100)}%`}
          level={card.confidence.level.id}
        />
        <Metric
          label="Priority"
          value={card.priority.label}
          level={card.priority.id}
        />
        <Metric
          label="Spoilers"
          value={card.spoiler.label}
          level={card.spoiler.id}
        />
      </dl>

      <details className={styles.details}>
        <summary>
          Why this guidance
        </summary>
        <div className={styles.detailsBody}>
          <p>{card.rationale}</p>
          {card.detailedExplanation && (
            <p>
              {card.detailedExplanation}
            </p>
          )}

          {card.evidence.length > 0 && (
            <div>
              <h4 className={styles.detailTitle}>
                Evidence
              </h4>
              <ul
                className={styles.evidenceList}
              >
                {card.evidence.map(
                  (evidence) => (
                    <li key={evidence.id}>
                      {evidence.summary}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </details>

      {card.sources.length > 0 && (
        <section
          className={styles.sources}
          aria-labelledby={`${headingId}-sources`}
        >
          <h4
            id={`${headingId}-sources`}
            className={styles.detailTitle}
          >
            <BookMarked
              size={15}
              aria-hidden="true"
            />
            Reviewed sources
          </h4>
          <ul className={styles.sourceList}>
            {card.sources.map((source) => (
              <li key={source.id}>
                {source.uri ? (
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.sourceLink}
                  >
                    <span>
                      {source.title}
                      {source.publisher && (
                        <small>
                          {source.publisher}
                        </small>
                      )}
                    </span>
                    <ExternalLink
                      size={14}
                      aria-label="Opens in a new window"
                    />
                  </a>
                ) : (
                  <span
                    className={
                      styles.sourceText
                    }
                  >
                    {source.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className={styles.cardFooter}>
        {card.reassessmentTrigger && (
          <span>
            <RefreshCw
              size={14}
              aria-hidden="true"
            />
            {card.reassessmentTrigger}
          </span>
        )}
        <span>
          <Clock3
            size={14}
            aria-hidden="true"
          />
          Prepared{" "}
          <time dateTime={card.createdAt}>
            {formatTimestamp(
              card.createdAt
            )}
          </time>
        </span>
      </footer>
    </article>
  );
}

function Metric({
  label,
  value,
  level,
}: Readonly<{
  label: string;
  value: string;
  level: string;
}>) {
  return (
    <div
      className={styles.metric}
      data-level={level}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatTimestamp(
  timestamp: string
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }
  ).format(new Date(timestamp));
}
