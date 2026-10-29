import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
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
            name,
            type,
            description: desc
        }
        if (type === "team")
                data.memberLimit =  numMember; 
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
    <main className="flex min-h-screen w-full flex-col gap-8 bg-zinc-50 px-4 py-12 transition-colors duration-300 sm:px-8 dark:bg-zinc-950">

        {/* Header */}
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Groups
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Discover and join your groups and teams.
            </p>
        </div>

        <Button
            type="button"
            onClick={() => setshowForm(true)}> 
            Create</Button>
        </div>

        {/* Groups list */}
        <section className="mx-auto w-full max-w-5xl">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Your Groups
        </h2>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You haven't joined any groups yet.
            </p>
        </div>
        </section>

        {/* Popup */}
        {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/60">

            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Create a group
                </h2>

                <Button
                type="button"
                onClick={() => setshowForm(false)}
                variant="secondary"
                >
                Close
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">{error}</p> }
                <Button type="button"
                        onClick={() => setType("general")}
                        className={`rounded-xl border p-4 text-sm font-semibold transition-all ${
                            type === "general"
                                ? "border-teal-600 bg-teal-50/80 text-teal-800 ring-2 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-500/20"
                                : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                        }`}
                        >
                        General</Button>
                <Button type="button"
                        onClick={() => setType("team")}
                        className={`rounded-xl border p-4 text-sm font-semibold transition-all ${
                            type === "team"
                                ? "border-teal-600 bg-teal-50/80 text-teal-800 ring-2 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-500/20"
                                : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                        }`}
                        >
                        Team</Button>
                <input type="text"
                        placeholder="Group name" 
                        minLength={3}
                        maxLength={30}
                        className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"
                        onChange={handleName}
                        required
                        />
                
                <input type="text"
                        placeholder="Description" 
                        className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"
                        onChange={handleDesc}
                        required
                        />
                {
                    (type === "team") && (              
                        <input type="number" min="2" max="6" 
                                placeholder="Member Limit" 
                                onChange={handleNumMember}
                                required
                                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"/>
                    )
                }
                <Button className="mt-2 w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus:ring-offset-zinc-900"
                    type="submit"
                    disabled={loading}
                >{loading ? "Creating..." : "Create"}</Button>
            </form>
            </div>
        </div>
        )}

    </main>
    );
}