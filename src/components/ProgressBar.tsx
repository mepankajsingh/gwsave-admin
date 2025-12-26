export function ProgressBar() {
    return (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-100 z-50 overflow-hidden">
            <div className="h-full bg-blue-600 animate-progress origin-left"></div>
        </div>
    )
}
