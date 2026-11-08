import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Groups() {
  const [showForm, setshowForm] = useState(false);
  const [type, setType] = useState("general");
  const [desc, setDesc] = useState("");
  const [name, setName] = useState("");
  const [numMember, setNumMember] = useState(2);
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);

  const handleDesc = (e) => setDesc(e.target.value);
  const handleNumMember = (e) => setNumMember(Number(e.target.value));
  const handleName = (e) => setName(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    seterror("");
    if (type === "team" && !(numMember >= 2 && numMember <= 6)) {
      seterror("The Team must be 2 to 6");
      return;
    }

    let data = {
      name,
      type,
      description: desc,
    };
    if (type === "team") data.memberLimit = numMember;
    setloading(true);
    try {
      const response = await fetch("/groups", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resulte = await response.json();
      if (!response.ok) seterror(resulte.message || "Failed to create group");
      else {
        setshowForm(false);
        setName("");
        setDesc("");
        setNumMember(2);
        seterror("");
      }
    } catch (error) {
      seterror("Can't connect to server");
    } finally {
      setloading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col gap-8 bg-bg px-4 py-12 transition-colors duration-300 sm:px-8 ">
      {/* Header */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-fg ">
            Groups
          </h1>

          <p className="text-sm text-muted ">
            Discover and join your groups and teams.
          </p>
        </div>

        <Button type="button" onClick={() => setshowForm(true)}>
          Create
        </Button>
      </div>

      {/* Groups list */}
      <section className="mx-auto w-full max-w-5xl">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-fg ">
          Your Groups
        </h2>

        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-sm transition-colors duration-300  ">
          <p className="text-sm text-muted ">
            You haven't joined any groups yet.
          </p>
        </div>
      </section>

      {/* Popup */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8   ">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4 ">
              <h2 className="text-xl font-bold tracking-tight text-fg ">
                Create a group
              </h2>

              <Button
                type="button"
                onClick={() => setshowForm(false)}
                // variant="secondary"
              >
                Close
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {error && (
                <p className="rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger   ">
                  {error}
                </p>
              )}
              <fieldset disabled={loading}>
                <legend className="mb-2 text-sm font-medium text-fg">
                  Group type
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "general", label: "General" },
                    { value: "team", label: "Team" },
                  ].map(({ value, label }) => (
                    <label key={value} className="relative cursor-pointer">
                      <input
                        className="peer sr-only"
                        type="radio"
                        name="group-type"
                        value={value}
                        checked={type === value}
                        onChange={(e) => setType(e.target.value)}
                      />
                      <span className="flex items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-muted transition peer-checked:border-highlight peer-checked:bg-selected peer-checked:text-highlight peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Input
                type="text"
                placeholder="Group name"
                minLength={3}
                maxLength={30}
                className="w-full"
                onChange={handleName}
                required
              />

              <Input
                type="text"
                placeholder="Description"
                className="w-full "
                onChange={handleDesc}
                required
              />
              {type === "team" && (
                <Input
                  type="number"
                  min="2"
                  max="6"
                  placeholder="Member Limit"
                  onChange={handleNumMember}
                  required
                  className="w-full"
                />
              )}
              <Button
                className="mt-2 w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
