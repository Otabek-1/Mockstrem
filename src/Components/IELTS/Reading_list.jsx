import IeltsModuleList from "./IeltsModuleList";

export default function IELTSReadingList({ isPremium = false }) {
  return <IeltsModuleList module="reading" isPremium={isPremium} />;
}

