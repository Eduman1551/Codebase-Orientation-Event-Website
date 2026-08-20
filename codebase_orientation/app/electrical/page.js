import DynamicClueRoom from "../../components/DynamicClueRoom";

export default function ElectricalRoom() {
  return <DynamicClueRoom roomName="electrical" title="ELECTRICAL ROOM" subtitle="Watch your back and fix the wiring" icons={["⚡", "🛠️", "🔌"]} iconMap={{ "Fuse Box": "⚡", Vent: "🛠️", Wiring: "🔌" }} accentClass="text-crewYellow" />;
}
