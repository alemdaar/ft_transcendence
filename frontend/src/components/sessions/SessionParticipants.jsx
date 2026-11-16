export default function SessionParticipants({ profiles }) {
  return <section className="border-t border-line pt-6" aria-labelledby="participants-title">
    <h3 id="participants-title" className="mb-4 text-lg font-semibold">Participants</h3>
    <dl className="grid gap-4 sm:grid-cols-2">
      <div><dt className="text-xs text-muted">Asker</dt><dd className="mt-1 font-medium">{profiles.askerOne?.name || 'Not available'}</dd></div>
      <div><dt className="text-xs text-muted">Helper</dt><dd className="mt-1 font-medium">{profiles.helperOne?.name || 'Not assigned'}</dd></div>
    </dl>
  </section>;
}
