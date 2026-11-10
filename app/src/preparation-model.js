import { upcomingDeadline } from "./program-timeline.js";
import { programDetailConfigs } from "./program-detail-config.ts";

function stableChecklistId(value, index) {
  return (
    String(value || "item")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || `item-${index + 1}`
  );
}

export function preparationItems(item, variantId = "") {
  if (!item) return [];
  const variant = item.variants?.find((option) => option.id === variantId);
  let records = [];

  if (item.type === "program") {
    const detail = item.detail || programDetailConfigs[item.id];
    const documentInfo = detail?.documents;
    if (
      documentInfo?.value?.length &&
      !["unknown", "not_applicable", "outdated"].includes(documentInfo.status)
    ) {
      records = documentInfo.value;
    } else {
      records = item.documents || [];
    }
  } else {
    records = [...(item.documents || []), ...(variant?.documents || [])];
  }

  const unique = new Map();
  records.forEach((record, index) => {
    const name = typeof record === "string" ? record.trim() : record?.name?.trim();
    if (!name) return;
    const id =
      typeof record === "object" && record.id
        ? String(record.id)
        : stableChecklistId(name, index);
    const canonicalName = name.toLocaleLowerCase("id");
    if (!unique.has(canonicalName)) {
      unique.set(canonicalName, {
        id,
        name,
        note:
          typeof record === "object"
            ? record.condition ||
              (record.alternatives?.length
                ? `Alternatif: ${record.alternatives.join(", ")}`
                : "")
            : "",
      });
    }
  });
  return [...unique.values()];
}

export function hasUpcomingOfficialSchedule(item) {
  const timeline = item?.timeline;
  return (
    item?.type === "program" &&
    Boolean(timeline?.scheduleVerifiedOn && upcomingDeadline(item))
  );
}

export function preparationRoute(item, variantId = "") {
  if (!item) return "/rencanaku";
  const base = `/rencanaku/${item.type}/${item.id}`;
  return variantId ? `${base}/${variantId}` : base;
}
