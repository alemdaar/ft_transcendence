
import { useState } from "react";

export default function Groups() {
    const [showForm, setshowForm] = useState(false);
    const [type, setType] = useState("general");
    const [desc, setDesc] = useState("");
    const [name, setName] = useState("")
    const [numMember, setNumMember] = useState(2);
    const [error, seterror] = useState("");
    const [loading, setloading] = useState(false);


    const handleDesc = (e) => setDesc(e.target.value);
    const handleNumMember = (e) => setNumMember(Number(e.target.value));
    const handleName = (e) => setName(e.target.value);
    
    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        seterror("");
        if (type === "team" && !(numMember >= 2 && numMember <= 6) )
        {
            seterror("The Team must be 2 to 6");
            return ;
        }
        let data = {
            memberLimit: numMember, 
            name,
            type,
            description: desc
        }
        setloading(true);
        try {
        
            const response = await fetch('/groups', {
                method: "POST",
                headers: {
                    "content-type" : "application/json"
                },
                body: JSON.stringify(data)
            })
            const resulte = await response.json();
            if (!response.ok)
                    seterror(resulte.message || "Failed to create group");
            else {
                setshowForm(false);
                setName("");
                setDesc("");
                setNumMember(2);
                seterror("");
            }

        } catch (error) {
            seterror("Can't connect to server")
        }
        finally {setloading(false)}
    }

    return (
    <main className="flex min-h-screen w-full flex-col gap-8 bg-green-50 px-4 py-8 sm:px-6 dark:bg-black">

        {/* Header */}
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-800 dark:text-white">
            Groups
            </h1>

            <p className="text-gray-600 dark:text-white">
            Discover and join your groups and teams.
            </p>
        </div>

        <button
            type="button"
            onClick={() => setshowForm(true)}
            className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        >
            Create
        </button>
        </div>

        {/* Groups list */}
        <section className="w-full">
        <h2 className="mb-4 text-xl font-semibold text-green-800 dark:text-white">
            Your Groups
        </h2>

        <div className="rounded-xl border border-green-200 bg-white p-6 dark:border-green-800 dark:bg-green-950">
            <p className="text-gray-500 dark:text-gray-300">
            You haven't joined any groups yet.
            </p>
        </div>
        </section>

        {/* Popup */}
        {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6 dark:bg-green-950">

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-green-800 dark:text-white">
                Create a group
                </h2>

                <button
                type="button"
                onClick={() => setshowForm(false)}
                className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-green-900"
                >
                Close
                </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <p className="text-red-500">{error}</p> }
                <button type="button"
                        onClick={() => setType("general")}
                        className={`rounded-xl border p-6 ${
                            type === "general" ? "border-green-600 bg-green-100" : ""}`}
                        >
                        General</button>
                <button type="button"
                        onClick={() => setType("team")}
                        className={`rounded-xl border p-6 ${
                            type === "team" ? "border-green-600 bg-green-100" : ""}`}
                        >
                        Team</button>
                <input type="text"
                        placeholder="Group name" 
                        minLength={3}
                        maxLength={30}
                        className="mt-4 w-full rounded-lg border p-3"
                        onChange={handleName}
                        required
                        />
                <input type="text"
                        placeholder="Description" 
                        className="mt-4 w-full rounded-lg border p-3"
                        onChange={handleDesc}
                        required
                        />
                {
                    (type === "team") && (              
                        <input type="number" min="2" max="6" 
                                placeholder="Member Limit" 
                                onChange={handleNumMember}
                                required
                                className="mt-4 w-full rounded-lg border p-3"/>
                    )
                }
                <button className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
                    type="submit"
                    disabled={loading}
                >{loading ? "Creating..." : "Create"}</button>
            </form>
            </div>
        </div>
        )}

    </main>
    );
}
