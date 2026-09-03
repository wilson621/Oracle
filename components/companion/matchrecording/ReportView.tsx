import type { CoachingReport, CoachingScores } from "./report-types";
import styles from "./match-recording.module.css";

export default function ReportView({
  report,
}: Readonly<{ report: CoachingReport }>) {
  const scores: CoachingScores | null =
    report.positioning === null
      ? null
      : {
          positioning: report.positioning ?? 0,
          aim: report.aim ?? 0,
          movement: report.movement ?? 0,
          decision_making: report.decision_making ?? 0,
          game_sense: report.game_sense ?? 0,
        };

  return (
    <div className={styles.report}>
      {report.verdict && <p className={styles.verdict}>{report.verdict}</p>}
      {report.summary && <p className={styles.summary}>{report.summary}</p>}

      {scores && (
        <div className={styles.scores}>
          <ScoreBar label="Positioning" value={scores.positioning} />
          <ScoreBar label="Aim" value={scores.aim} />
          <ScoreBar label="Movement" value={scores.movement} />
          <ScoreBar label="Decision making" value={scores.decision_making} />
          <ScoreBar label="Game sense" value={scores.game_sense} />
        </div>
      )}

      {report.deaths && report.deaths.length > 0 && (
        <div className={styles.deaths}>
          <h3 className={styles.subheading}>Death by death</h3>
          {report.deaths.map((death, index) => (
            <div key={index} className={styles.deathCard}>
              <p className={styles.deathWhen}>{death.whenInMatch}</p>
              <p>{death.whatHappened}</p>
              <p className={styles.deathSightline}>
                {death.enemySightlineAssessment}
              </p>
              <p>
                <strong>
                  {death.couldHaveActedSooner
                    ? "Could have acted sooner: "
                    : "Reaction time looked reasonable: "}
                </strong>
                {death.whatToDoDifferently}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
}: Readonly<{ label: string; value: number }>) {
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreTrack}>
        <div
          className={styles.scoreFill}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className={styles.scoreValue}>{value}</span>
    </div>
  );
}
