import Map from "./_components/Map";
import Header from "./_components/Header";
import OverlayRenderer from "./_components/OverlayRenderer";
export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col">
      <Map />
      <Header />
      <OverlayRenderer />
    </div>
  );
}
