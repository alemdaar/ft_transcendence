export default function Input ({label, id , error, className = "", ...props}) {

    return (
        <div className="space-y-1.5">
            {label && 
            (<label htmlFor={id} className="block text-sm font-medium text-fg">
                {label}
            </label>)}
            <input 
                            // className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-3 pl-4 pr-11 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"

                id={id}
                aria-invalid={!!error}
                className={`
                    rounded-xl border border-zinc-300 bg-zinc-50 py-3 pl-4 pr-11 
                    text-sm text-zinc-900 placeholder-zinc-400 outline-none transition
                    focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20
                    dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500
                    dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20
                    ${error
                        ? "border-red-500 focus:border-red-500"
                        : "border-line focus:border-primary"
                    }
                    ${className}
                `}
                {...props}
            />
            {error &&(
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    )
}
