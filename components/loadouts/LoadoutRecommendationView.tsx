import type { LoadoutRecommendation } from "./loadout-types";

function isRealBuild(
  loadout: LoadoutRecommendation["loadout"]
): loadout is LoadoutRecommendation["loadout"] & {
  primaryWeapon: { name: string; attachments: string[] };
} {
  return "primaryWeapon" in loadout && !!loadout.primaryWeapon;
}

export default function LoadoutRecommendationView({
  recommendation,
}: Readonly<{ recommendation: LoadoutRecommendation }>) {
  if (recommendation.status === "failed" || !isRealBuild(recommendation.loadout)) {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
        Recommendation failed: {recommendation.raw_error ?? "Unknown error."}
      </div>
    );
  }

  const { loadout } = recommendation;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${
            recommendation.personalization_level === "personalized"
              ? "border-teal-400/30 bg-teal-400/10 text-teal-300"
              : "border-slate-500/30 bg-slate-500/10 text-slate-300"
          }`}
        >
          {recommendation.personalization_level === "personalized"
            ? `Personalised · ${recommendation.matches_considered} match${
                recommendation.matches_considered === 1 ? "" : "es"
              } considered`
            : "Generic · no match history yet"}
        </span>
        <span className="text-sm text-slate-400">
          For: &ldquo;{recommendation.requested_goal}&rdquo;
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-bold tracking-wide text-teal-300">
            Primary
          </h4>
          <p className="mt-1 font-semibold text-white">
            {loadout.primaryWeapon.name}
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-400">
            {loadout.primaryWeapon.attachments.map((attachment) => (
              <li key={attachment}>{attachment}</li>
            ))}
          </ul>
        </div>

        {loadout.secondaryWeapon && (
          <div>
            <h4 className="text-sm font-bold tracking-wide text-teal-300">
              Secondary
            </h4>
            <p className="mt-1 font-semibold text-white">
              {loadout.secondaryWeapon.name}
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-slate-400">
              {loadout.secondaryWeapon.attachments.map((attachment) => (
                <li key={attachment}>{attachment}</li>
              ))}
            </ul>
          </div>
        )}

        {loadout.perks.length > 0 && (
          <div>
            <h4 className="text-sm font-bold tracking-wide text-teal-300">
              Perks
            </h4>
            <p className="mt-1 text-sm text-slate-300">
              {loadout.perks.join(", ")}
            </p>
          </div>
        )}

        {(loadout.lethalEquipment || loadout.tacticalEquipment) && (
          <div>
            <h4 className="text-sm font-bold tracking-wide text-teal-300">
              Equipment
            </h4>
            <p className="mt-1 text-sm text-slate-300">
              {[loadout.lethalEquipment, loadout.tacticalEquipment]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        )}
      </div>

      {recommendation.summary && (
        <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-slate-300">
          {recommendation.summary}
        </p>
      )}

      {recommendation.sources.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {recommendation.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:border-teal-400/40 hover:text-teal-300"
            >
              {source.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
