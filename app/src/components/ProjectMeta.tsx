interface ProjectMetaProps {
  title: string;
  titleLines?: string[];
  disciplines: string[];
  stacked?: boolean;
}

export default function ProjectMeta({ title, titleLines, disciplines, stacked }: ProjectMetaProps) {
  return (
    <div className="project-meta">
      <h1 className={`project-title ${stacked || titleLines ? "project-title--stacked" : ""}`}>
        {titleLines
          ? titleLines.map((line, i) => (
              <span key={i} className="title-line">
                {line}
              </span>
            ))
          : title}
      </h1>
      <p className="project-disciplines">{disciplines.join(" · ")}</p>
    </div>
  );
}
