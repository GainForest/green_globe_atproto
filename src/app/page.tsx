import Mapbox from "./_components/Mapbox";
import ProjectOverlay from "./_components/ProjectOverlay";
import Header from "./_components/Header";
export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col">
      <Mapbox />
      <Header />
      <ProjectOverlay />
    </div>
  );
}
