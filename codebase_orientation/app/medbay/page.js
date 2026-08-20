import DynamicClueRoom from "../../components/DynamicClueRoom";

export default function MedBayRoom() {
  return <DynamicClueRoom roomName="medbay" title="MEDICAL BAY" subtitle="Analyze the biology and check the scanners" icons={["🛏️", "🧪", "➕"]} iconMap={{ Scanner: "🛏️", Samples: "🧪", MedKit: "➕" }} accentClass="text-crewLime" />;
}
