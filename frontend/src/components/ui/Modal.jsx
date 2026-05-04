import { useEffect } from "react";

function Modal({isOpen, onClose, title, children,lgWidth,lgHeight}){
    
    useEffect(()=>{
        const handleEsc = (e)=>{
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener("keydown",handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    },[isOpen,onClose])
     if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
                
                <div className={`relative z-50 rounded-2xl bg-[#121820] p-6 lg:max-w-[${lgWidth}] lg:h-[${lgHeight}] w-full`}>
                    <h1>{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;