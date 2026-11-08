import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { Plus } from "lucide-react";

export default function StudyRequest() {
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("online");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/peer-request", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          mode,
          description,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Could not create your study request.",
        );
      }

      setTopic("");
      setMode("online");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  function closeForm() {
    setShowForm(false);
    setError("");
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Study Requests</h2>
          <p className="mt-2 text-sm text-muted">
            Find a study partner or ask your peers for help.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Post Request
        </Button>
      </div>
      <Modal
        open={showForm}
        onClose={closeForm}
        busy={loading}
        title="Post a study request"
        description="Tell your peers what you’re working on and how you’d like to meet."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}
          <fieldset
            disabled={loading}
            className="space-y-5 disabled:opacity-70"
          >
            <Input
              label="Topic"
              id="topic"
              type="text"
              placeholder="e.g. React hooks or C pointers"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              minLength={1}
              maxLength={100}
              required
              autoFocus
            />
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Study mode</legend>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "online", label: "Online" },
                  { value: "insite", label: "On site" },
                ].map(({ value, label }) => (
                  <label key={value} className="relative cursor-pointer">
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="mode"
                      value={value}
                      checked={mode === value}
                      onChange={(e) => setMode(e.target.value)}
                    />
                    <span className="flex items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-muted transition peer-checked:border-highlight peer-checked:bg-selected peer-checked:text-highlight peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                className="input min-h-32 resize-y"
                placeholder="What have you tried, and where are you stuck?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={1}
                maxLength={255}
                required
                aria-describedby="description-count"
              />
              <p
                id="description-count"
                className="text-right text-xs text-muted"
              >
                {description.length}/255
              </p>
            </div>
          </fieldset>
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" disabled={loading} onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? "Posting…" : "Post Request"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
