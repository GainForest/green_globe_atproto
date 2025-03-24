import RouteSynchronizer from "./_components/RouteSynchronizer";

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteSynchronizer />
      {children}
    </>
  );
}
