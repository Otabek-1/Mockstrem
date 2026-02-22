import IeltsModuleList from "./IeltsModuleList";

export default function IELTSSpeakingList({ isPremium = false }) {
  return <IeltsModuleList module="speaking" isPremium={isPremium} />;
}
