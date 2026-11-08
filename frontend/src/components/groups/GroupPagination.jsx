import Button from "../ui/Button";

export default function GroupPagination({ pagination, loading, onChange }) {
  if (!pagination) return null;
  const { currentPage, totalPages, totalGroups, hasPrevPage, hasNextPage } =
    pagination;
  return (
    <nav
      aria-label="Group pages"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
    >
      <p className="text-xs text-muted">
        {totalGroups} groups · Page {currentPage} of {Math.max(1, totalPages)}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={loading || !hasPrevPage}
          onClick={() => onChange(Number(currentPage) - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={loading || !hasNextPage}
          onClick={() => onChange(Number(currentPage) + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
