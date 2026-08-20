import DynamicClueRoom from "../../components/DynamicClueRoom";

export default function ControlRoom() {
  return <DynamicClueRoom roomName="control" title="CONTROL ROOM" subtitle="Monitor the ship's systems for clues" icons={["📹", "🗺️", "📻"]} iconMap={{ Security: "📹", Navigation: "🗺️", Comms: "📻" }} accentClass="text-crewCyan" />;
}
