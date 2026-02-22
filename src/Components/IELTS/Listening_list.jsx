import IeltsModuleList from "./IeltsModuleList";

export default function IELTSListeningList({ isPremium = false }) {
  return <IeltsModuleList module="listening" isPremium={isPremium} />;
}

