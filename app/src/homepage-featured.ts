import type { Profile, ProgramMetadata } from "./models";
import { profileState, recommendPrograms } from "./recommendations.ts";
import { programDetailConfigs } from "./program-detail-config.ts";

// Homepage-only selection: keep the general catalog and recommendation page
// untouched. Never mutate the canonical records or annotate carousel cards.
export function selectHomepagePrograms<
  T extends ProgramMetadata & { id: string; name: string },
>(
  programs: T[],
  profile?: Profile | null,
  temporary: Record<string, string> = {},
) {
  const general = programs.slice(0, 6);
  if (!profile) return { mode: "guest" as const, items: general };
  if (profileState(profile) !== "Cukup untuk rekomendasi awal")
    return { mode: "incomplete" as const, items: general };
  const byId = new Map(programs.map((program) => [program.id, program]));
  const eligible = recommendPrograms(programs, profile, temporary)
    .filter((recommendation) => {
      const program = byId.get(recommendation.id)!;
      const config = program.detail || programDetailConfigs[program.id];
      if (["legacy", "discontinued"].includes(config?.lifecycle?.value || ""))
        return false;
      return !recommendation.rules.some(
        (result) =>
          result.state === "not-met" &&
          program.eligibilityRules.find((rule) => rule.id === result.id)
            ?.required !== false,
      );
    })
    .sort(
      (left, right) =>
        right.rules.filter((rule) => rule.state === "met").length -
        left.rules.filter((rule) => rule.state === "met").length,
    );
  const items = eligible.map((result) => byId.get(result.id)!).slice(0, 6);
  return items.length
    ? { mode: "personal" as const, items }
    : { mode: "general" as const, items: general };
}
