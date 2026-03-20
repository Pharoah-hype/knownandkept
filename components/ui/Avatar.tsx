export default function Avatar({
  handle,
  size = 32,
}: {
  handle: string;
  size?: number;
}) {
  const letter = handle.charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full bg-surface-elevated flex items-center justify-center font-serif text-text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  );
}
