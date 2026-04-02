export default function SiteNavComingSoonLabel({ label }: { label: string }) {
  return (
    <span className="inline-grid min-w-0 grid-cols-1 grid-rows-1 place-items-start">
      <span className="col-start-1 row-start-1 opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:opacity-0">
        {label}
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap opacity-0 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:opacity-100">
        Coming Soon
      </span>
    </span>
  );
}
