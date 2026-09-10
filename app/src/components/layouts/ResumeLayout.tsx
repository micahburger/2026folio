import type { ResumeProject } from "../../data/types";

/**
 * Resume: the one chapter that scrolls (every other chapter is a single
 * fixed screen). Deliberately its own thing rather than a fourth variant of
 * the pill/title/body/media deck pattern the other three share — no
 * headline pill, no media gallery.
 */
export default function ResumeLayout({ project }: { project: ResumeProject }) {
  const { workHistory, contact } = project;

  return (
    <div className="layout layout-resume" style={{ backgroundColor: project.backgroundColor, color: project.textColor }}>
      <div className="resume-content">
        <section className="resume-work">
          <h2 className="project-title">
            <span className="title-line">Work</span>
            <span className="title-line">history</span>
          </h2>
          <div className="work-history-list">
            {workHistory.map((item) => (
              <div className="work-history-row" key={item.id}>
                <img className="work-history-logo" src={item.logo} alt={`${item.company} logo`} />
                <div className="work-history-text">
                  <p className="work-history-company">{item.company}</p>
                  <p className="work-history-role">{item.role}</p>
                  <p className="work-history-meta">
                    {item.dateRange}
                    <br />
                    {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="resume-contact">
          <div className="resume-contact-intro">
            <h2 className="project-title">Contact</h2>
            <p className="resume-contact-subtitle">Let’s chat.</p>
          </div>

          {/* Grouped so this whole side starts at the same x as the work
              history logos — see .resume-contact's grid in global.css. */}
          <div className="resume-contact-details">
            {contact.photo ? (
              <img className="resume-contact-photo" src={contact.photo} alt="Micah Lindenberger" />
            ) : (
              <div className="resume-contact-photo resume-contact-photo--placeholder" aria-hidden="true">
                Photo pending
              </div>
            )}

            <div className="resume-contact-links">
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="is-underlined">
                linkedin
              </a>
              <a href={contact.store} target="_blank" rel="noreferrer" className="is-underlined">
                {contact.storeLabel}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
