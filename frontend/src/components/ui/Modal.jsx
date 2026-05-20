import { useEffect } from "react";

function Modal({ isOpen, onClose, title, children}) {
    
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end max-md:items-center  sm:items-center justify-center sm:p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <div className="relative z-50 rounded-2xl sm:rounded-2xl max-md:w-[80vw] bg-[#121820] p-5 sm:p-6 w-full sm:max-w-lg">
                    <h1 className="text-white font-bold text-lg mb-1">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;