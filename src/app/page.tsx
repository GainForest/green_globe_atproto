import Mapbox from "./_components/Mapbox";
import Header from "./_components/Header";
import OverlayRenderer from "./_components/OverlayRenderer";
export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col">
      <Mapbox />
      <Header />
      <OverlayRenderer />
    </div>
  );
}
