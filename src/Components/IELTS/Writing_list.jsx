import IeltsModuleList from "./IeltsModuleList";

export default function IELTSWritingList({ isPremium = false }) {
  return <IeltsModuleList module="writing" isPremium={isPremium} />;
}

