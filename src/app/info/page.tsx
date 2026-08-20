import SiteBackgroundVideo from "@/components/SiteBackgroundVideo";
import SitePageFooter from "@/components/SitePageFooter";
import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_MAILTO,
  SITE_INSTAGRAM_DANIEL_DERRO,
  SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS,
} from "@/lib/site-contact";
import { INFO_ABOUT, INFO_SERVICES, SITE_CLIENTS } from "@/lib/site-content";

const CLIENTS_SORTED = [...SITE_CLIENTS].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: "base" }),
);
const CLIENTS_SPLIT = Math.ceil(CLIENTS_SORTED.length / 2);
const CLIENTS_FIRST = CLIENTS_SORTED.slice(0, CLIENTS_SPLIT);
const CLIENTS_NEXT = CLIENTS_SORTED.slice(CLIENTS_SPLIT);
const SERVICE_ITEMS = INFO_SERVICES.flatMap((group) => group.items);

const CONTACT_SECTIONS = [
  {
    title: "Contact",
    lines: [
      { href: SITE_CONTACT_MAILTO, value: SITE_CONTACT_EMAIL },
    ],
  },
  {
    title: "Based",
    lines: [{ label: "New York and Los Angeles", value: "International project capabilities" }],
  },
  {
    title: "Follow",
    lines: [
      { label: "Daniel Derro", href: SITE_INSTAGRAM_DANIEL_DERRO, value: "@danielderro_" },
      {
        label: "No School Studio Records",
        href: SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS,
        value: "@noschoolstudiorecords",
      },
    ],
  },
] as const;

function InfoSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="info-section">
      <p className="text-caption info-section-label">{label}</p>
      <div className="info-section-body">{children}</div>
    </section>
  );
}

export default function InfoPage() {
  return (
    <div className="info-page-shell layout-full site-page-bottom-padding max-w-full min-w-0">
      <SiteBackgroundVideo fixed dimmed />

      <div className="info-page-foreground">
        <div className="info-page layout-grid">
          <InfoSection label="About">
            {INFO_ABOUT.map((paragraph, index) => (
              <p key={paragraph} className="text-small info-about">
                {index === 0 ? (
                  <>
                    <span className="info-lead-name">Daniel Derro</span>
                    {paragraph.replace(/^Daniel Derro/, "")}
                  </>
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </InfoSection>

          <InfoSection label="Services">
            {SERVICE_ITEMS.map((item) => (
              <p key={item} className="text-small">
                {item}
              </p>
            ))}
          </InfoSection>

          <InfoSection label="Clients">
            <div className="info-clients">
              <div className="info-clients-aisle">
                {CLIENTS_FIRST.map((client) => (
                  <p key={client} className="text-small">
                    {client}
                  </p>
                ))}
              </div>
              <div className="info-clients-aisle">
                {CLIENTS_NEXT.map((client) => (
                  <p key={client} className="text-small">
                    {client}
                  </p>
                ))}
              </div>
            </div>
          </InfoSection>

          {CONTACT_SECTIONS.map((group) => (
            <InfoSection key={group.title} label={group.title}>
              {group.lines.map((line) => (
                <p key={line.value} className="text-small info-section-pair">
                  {"label" in line && line.label ? (
                    <>
                      {line.label}
                      <br />
                    </>
                  ) : null}
                  {"href" in line && line.href ? (
                    <a
                      href={line.href}
                      className="hover-smooth no-underline"
                      {...(line.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {line.value}
                    </a>
                  ) : (
                    <span>{line.value}</span>
                  )}
                </p>
              ))}
            </InfoSection>
          ))}
        </div>

        <SitePageFooter onDark />
      </div>
    </div>
  );
}
