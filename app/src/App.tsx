import CustomCursor from "./components/CustomCursor";
import PortfolioShell from "./components/PortfolioShell";
import { projects } from "./data/projects";

export default function App() {
  return (
    <>
      <PortfolioShell projects={projects} />
      <CustomCursor />
    </>
  );
}
