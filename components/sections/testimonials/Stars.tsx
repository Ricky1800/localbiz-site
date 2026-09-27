export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="text-accent">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}
