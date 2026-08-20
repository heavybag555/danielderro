import type { RadioTrack } from "@/lib/site-content";

type RadioTracklistDropdownProps = {
  id: string;
  open: boolean;
  tracks: readonly RadioTrack[];
  episodeTitle?: string;
  /** Desktop: always expanded, not a control. */
  alwaysOpen?: boolean;
  onToggle?: () => void;
};

function formatTrackNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export default function RadioTracklistDropdown({
  id,
  open,
  tracks,
  episodeTitle,
  alwaysOpen = false,
  onToggle,
}: RadioTracklistDropdownProps) {
  const isOpen = alwaysOpen || open;
  const listId = `${id}-list`;

  const episodePrefix = episodeTitle ? (
    <span className="radio-tracklist-bar-prefix">
      <span className="radio-tracklist-bar-episode">{episodeTitle}</span>
      <span className="radio-tracklist-bar-slash" aria-hidden="true">
        /
      </span>
    </span>
  ) : null;

  return (
    <div
      id={id}
      className={
        alwaysOpen
          ? "radio-tracklist-dropdown radio-tracklist-dropdown--static"
          : "radio-tracklist-dropdown"
      }
      data-open={isOpen ? "true" : "false"}
    >
      {alwaysOpen ? (
        <p className="text-fine radio-tracklist-bar">
          {episodePrefix}
          <span className="radio-tracklist-bar-label" data-on="true">
            Tracklist
          </span>
        </p>
      ) : (
        <button
          type="button"
          className="text-fine radio-tracklist-bar"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-label={isOpen ? "Close tracklist" : "View Tracklist"}
          onClick={onToggle}
        >
          {episodePrefix}
          <span className="radio-tracklist-bar-swap">
            <span
              className="radio-tracklist-bar-label"
              data-on={isOpen ? "false" : "true"}
            >
              View Tracklist
            </span>
            <span
              className="radio-tracklist-bar-label"
              data-on={isOpen ? "true" : "false"}
            >
              Close
            </span>
          </span>
        </button>
      )}
      <div className="radio-tracklist-dropdown-clip">
        <ol id={listId} className="radio-tracklist-dropdown-inner">
          {tracks.map((track, index) => (
            <li
              key={`${track.artist}-${track.title}-${index}`}
              className="radio-tracklist-dropdown-item"
            >
              <span className="text-fine radio-tracklist-dropdown-number">
                {formatTrackNumber(index)}
              </span>
              <span className="text-fine radio-tracklist-dropdown-copy">
                <span className="radio-tracklist-dropdown-title">{track.title}</span>
                <span className="radio-tracklist-dropdown-artist">{track.artist}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
