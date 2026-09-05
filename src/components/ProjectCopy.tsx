interface ProjectCopyProps {
  headline: string;
  body: string[];
}

export default function ProjectCopy({ headline, body }: ProjectCopyProps) {
  return (
    <div className="project-copy">
      <h2 className="project-headline">{headline}</h2>
      <div className="project-body">
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
