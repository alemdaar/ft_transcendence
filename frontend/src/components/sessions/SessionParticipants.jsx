import SessionParticipant from "./SessionParticipant";

export default function SessionParticipants({ profiles }) {
  return (
    <section
      className="border-t border-line pt-6"
      aria-labelledby="participants-title"
    >
      <h3 id="participants-title" className="mb-4 text-lg font-semibold">
        Participants
      </h3>
      <dl className="grid gap-4 sm:grid-cols-2">
        <SessionParticipant label="Asker" profile={profiles?.asker} />
        <SessionParticipant label="Helper" profile={profiles?.helper} />
      </dl>
    </section>
  );
}
