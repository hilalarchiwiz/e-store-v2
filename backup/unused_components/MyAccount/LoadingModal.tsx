const LoadingModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
            {/* Replace this with your preferred spinner */}
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-dark font-medium">Logging out, please wait...</p>
        </div>
    </div>
);

export default LoadingModal;