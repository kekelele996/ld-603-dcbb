import { LocationStateText, LocationStateTone, type LocationState } from "../../constants/LocationState";

export function LocationStateBadge({ value }: { value: LocationState | string }) {
  const state = value as LocationState;
  const text = LocationStateText[state] ?? String(value).replace(/_/g, " ");
  const tone = LocationStateTone[state] ?? "info";
  return <span className={`badge location-${tone}`}>{text}</span>;
}
