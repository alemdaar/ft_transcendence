export default function Input ({label, id , error, className = "", ...props}) {

    return (
        <div className="space-y-1.5">
            {label && 
            (<label htmlFor={id} className="block text-sm font-medium text-fg">
                {label}
            </label>)}
            <input 
                id={id}
                aria-invalid={!!error}
                className={ "w-full rounded-xl border bg-bg px-4 py-4 text-fg outline-none transition" +
                "placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-accent/60" + 
                (error ? "border-red-500" : "border-line") + 
                className
                }
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
