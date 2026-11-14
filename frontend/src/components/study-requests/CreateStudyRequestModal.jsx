import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import StudyModeSelector from "./StudyModeSelector";
import { createStudyRequest } from "../../services/studyRequests";

export default function CreateStudyRequestModal({ open, onClose, onCreated }) {
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
      await createStudyRequest({ topic, mode, description });

      setTopic("");
      setMode("online");
      setDescription("");
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  function closeForm() {
    setError("");
    onClose();
  }

  return (
    <Modal
      open={open}
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
        <fieldset disabled={loading} className="space-y-5 disabled:opacity-70">
          <Input
            label="Topic"
            id="topic"
            type="text"
            placeholder="e.g. React hooks or C pointers"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            minLength={5}
            maxLength={100}
            required
            autoFocus
          />
          <StudyModeSelector mode={mode} onChange={setMode} />
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              className="input min-h-32 resize-y"
              placeholder="What have you tried, and where are you stuck?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={255}
              required
              aria-describedby="description-count"
            />
            <p id="description-count" className="text-right text-xs text-muted">
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
  );
}
