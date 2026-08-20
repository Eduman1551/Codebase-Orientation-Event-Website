import DynamicClueRoom from "../../components/DynamicClueRoom";

export default function EngineRoom() {
  return <DynamicClueRoom roomName="engine" title="ENGINE ROOM" subtitle="Search the room for clues" icons={["☢️", "⚙️", "🧰"]} iconMap={{ Reactor: "☢️", Valve: "⚙️", Toolbox: "🧰" }} accentClass="text-crewYellow" />;
}
