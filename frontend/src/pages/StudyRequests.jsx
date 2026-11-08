import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function StudyRequest() {
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("online");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
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
              : "Could not create your study request."
          );
        }

      
        setTopic("");
        setMode("online");
        setDescription("");
        setShowForm(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="p-6">
      <h1>Study Requests</h1>

      <Button
        type="button"
        onClick={() => setShowForm(true)}
      >
        + Post Request
      </Button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-md space-y-4"
        >
          <h2>Post a study request</h2>
          {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Post Request
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => {
              setShowForm(false);
              setError("");
            }}
          >
            Cancel
          </Button>
        </div>
          <Input
            label="Topic"
            id="topic"
            type="text"
            placeholder="What do you want to study?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            minLength={1}
            maxLength={100}
            required
          />

          <div>
            <label htmlFor="mode" className="mb-2 block">
              Study mode
            </label>

            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-lg border p-2"
            >
              <option value="online">Online</option>
              <option value="insite">On site</option>
            </select>
          </div>

          <Input
            label="Description"
            id="description"
            type="text"
            placeholder="Describe what you need help with"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={1}
            maxLength={255}
            required
          />

          <div className="flex gap-3">
            <Button type="submit">
              Test values
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}