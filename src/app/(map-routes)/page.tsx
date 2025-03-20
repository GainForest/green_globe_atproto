import Map from "./_components/Map";
import Sidebar from "./_components/Sidebar";
import HoveredTreeOverlay from "./_components/HoveredTreeOverlay";

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col">
      <Map />
      <Sidebar />
      <HoveredTreeOverlay />
    </div>
  );
}
