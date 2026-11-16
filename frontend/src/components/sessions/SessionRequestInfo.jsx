export default function SessionRequestInfo({ request }) {
  return <section className="space-y-4" aria-labelledby="session-topic">
    <div className="flex flex-wrap gap-2"><span className="badge bg-selected text-highlight">{request.status}</span><span className="badge bg-soft text-fg">{request.mode === 'insite' ? 'On site' : 'Online'}</span><span className="badge bg-soft text-muted">{request.campus}</span></div>
    <h2 id="session-topic" className="break-words text-2xl font-bold">{request.topic}</h2>
    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted">{request.description}</p>
  </section>;
}
