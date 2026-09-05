interface ProjectProgressProps {
  count: number;
  active: number;
  onSelect: (index: number) => void;
}

export default function ProjectProgress({
  count,
  active,
  onSelect,
}: ProjectProgressProps) {
  return (
    <nav className="project-progress" aria-label="Project progress">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          className={`progress-mark ${index === active ? "is-active" : ""}`}
          aria-label={`Go to project ${index + 1}`}
          aria-current={index === active}
          onClick={() => onSelect(index)}
        />
      ))}
    </nav>
  );
}
