function arrival(onWay, arrived) {
  if (arrived) return "Arrived";
  if (onWay) return "On the way";
  return "Not on the way yet";
}

export default function SessionMeetup({ meetup }) {
  const date = new Date(meetup.meetTime);
  const time = Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
  return (
    <section
      className="border-t border-line pt-6"
      aria-labelledby="meetup-title"
    >
      <h3 id="meetup-title" className="mb-4 text-lg font-semibold">
        Meetup
      </h3>
      <dl className="grid gap-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Meeting spot</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words font-medium">
            {meetup.specificSpot}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Meeting time</dt>
          <dd className="mt-1 font-medium">{time}</dd>
        </div>
        <div>
          <dt className="text-muted">Asker status</dt>
          <dd className="mt-1 font-medium">
            {arrival(meetup.asker_on_way, meetup.asker_arrived)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Helper status</dt>
          <dd className="mt-1 font-medium">
            {arrival(meetup.helper_on_way, meetup.helper_arrived)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
