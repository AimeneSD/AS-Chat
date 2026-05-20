import { useState } from "react";
import Modal from "../ui/Modal";
import { userService } from "../../services/api";



function SettingsModal({ isOpen, onClose, user }) {
    // Mais pour la simplicité de l'exemple on peut juste recharger la page ou mettre à jour un state local.
    // L'idéal est d'avoir une fonction de raffraichissement passée en prop ou depuis le hook.

    const [activeView, setActiveView] = useState('main'); // 'main', 'edit_username', 'edit_email', 'edit_password'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // États Username
    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    
    // États Password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const resetStates = () => {
        setLoading(false);
        setError('');
        setSuccessMsg('');
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleClose = () => {
        resetStates();
        setActiveView('main');
        onClose();
    };

    const navigateTo = (view) => {
        resetStates();
        setActiveView(view);
    };

    // --- Actions API ---

    const handleUpdateUsername = async () => {
        if (!newUsername || !currentPassword) {
            return setError('Tous les champs sont requis.');
        }
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            await userService.updateProfile({ username: newUsername, currentPassword });
            setSuccessMsg('Nom d\'utilisateur mis à jour avec succès !');
            setTimeout(() => { window.location.reload(); }, 1500); // Reload pour voir le changement partout
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return setError('Tous les champs sont requis.');
        }
        if (newPassword !== confirmPassword) {
            return setError('Les nouveaux mots de passe ne correspondent pas.');
        }
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            await userService.updatePassword({ currentPassword, newPassword });
            setSuccessMsg('Mot de passe mis à jour avec succès !');
            setTimeout(() => navigateTo('main'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true); setError('');
        try {
            await userService.deleteAccount();
            localStorage.removeItem('as_chat_user');
            window.location.href = '/login';
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la suppression.');
            setLoading(false);
        }
    };

    // --- Vues ---

    const renderMainView = () => (
        <div className="flex flex-col gap-6 sm:gap-8 text-white mt-4">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4 sm:pb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-2xl sm:text-3xl shadow-lg shrink-0">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        user?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">{user?.username}</h2>
                    <p className="text-white/50 text-xs sm:text-sm">Statut : En ligne</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
                <h3 className="font-semibold text-green-400 uppercase tracking-wider text-xs sm:text-sm">Mon Compte</h3>
                
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/5 gap-3 sm:gap-0">
                    <div className="w-full sm:w-auto">
                        <p className="text-white/50 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">Nom d'utilisateur</p>
                        <p className="font-medium text-base sm:text-lg truncate">{user?.username}</p>
                    </div>
                    <button onClick={() => navigateTo('edit_username')} className="hover:cursor-pointer w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Modifier</button>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/5 gap-3 sm:gap-0">
                    <div className="w-full sm:w-auto">
                        <p className="text-white/50 text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider">Mot de passe</p>
                        <p className="font-medium text-base sm:text-lg tracking-[0.2em] mt-1">••••••••••••</p>
                    </div>
                    <button onClick={() => navigateTo('edit_password')} className="hover:cursor-pointer w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Modifier</button>
                </div>
            </div>

            <div className="flex justify-center mt-2 sm:mt-4">
                <button onClick={() => navigateTo('delete_account')} className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors cursor-pointer">
                    Supprimer le compte
                </button>
            </div>
        </div>
    );

    const renderEditUsername = () => (
        <div className="flex flex-col gap-4 sm:gap-6 text-white mt-4">
            <h2 className="text-lg sm:text-xl font-bold text-green-400">Modifier le nom d'utilisateur</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">{successMsg}</div>}
            
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-white/60 text-xs sm:text-sm font-semibold">Nom d'utilisateur actuel</label>
                    <input type="text" value={user?.username || ''} disabled className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3 text-white/50 cursor-not-allowed outline-none text-sm sm:text-base"/>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-white/80 text-xs sm:text-sm font-semibold">Nouveau nom d'utilisateur</label>
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-2.5 sm:p-3 text-white focus:border-green-500 outline-none transition-colors text-sm sm:text-base"/>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-white/80 text-xs sm:text-sm font-semibold">Mot de passe actuel</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-2.5 sm:p-3 text-white focus:border-green-500 outline-none transition-colors text-sm sm:text-base"/>
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-4">
                <button onClick={() => navigateTo('main')} className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                <button onClick={handleUpdateUsername} disabled={loading} className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
                    {loading ? '...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );

    const renderEditPassword = () => (
        <div className="flex flex-col gap-4 sm:gap-6 text-white mt-4">
            <h2 className="text-lg sm:text-xl font-bold text-green-400">Modifier le mot de passe</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">{successMsg}</div>}
            
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-white/80 text-xs sm:text-sm font-semibold">Mot de passe actuel</label>
                    <input type="password" placeholder="Votre ancien mot de passe" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-2.5 sm:p-3 text-white focus:border-green-500 outline-none transition-colors text-sm sm:text-base"/>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-white/80 text-xs sm:text-sm font-semibold">Nouveau mot de passe</label>
                    <input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-2.5 sm:p-3 text-white focus:border-green-500 outline-none transition-colors text-sm sm:text-base"/>
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-white/80 text-xs sm:text-sm font-semibold">Confirmer le nouveau mot de passe</label>
                    <input type="password" placeholder="Confirmez le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-2.5 sm:p-3 text-white focus:border-green-500 outline-none transition-colors text-sm sm:text-base"/>
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-4">
                <button onClick={() => navigateTo('main')} className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                <button onClick={handleUpdatePassword} disabled={loading} className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
                    {loading ? '...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );

    const renderDeleteAccount = () => (
        <div className="flex flex-col gap-4 sm:gap-6 text-white mt-4">
            <h2 className="text-lg sm:text-xl font-bold text-red-400">Supprimer le compte</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
            
            <p className="text-white/80 text-sm">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et effacera toutes vos données (conversations, amis, etc.).
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-4">
                <button onClick={() => navigateTo('main')} className="hover:cursor-pointer w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                <button onClick={handleDeleteAccount} disabled={loading} className="hover:cursor-pointer w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50">
                    {loading ? '...' : 'Confirmer la suppression'}
                </button>
            </div>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={activeView === 'main' ? "Paramètres du compte" : ""} 
            lgWidth={activeView === 'main' ? "50vw" : "40vw"} 
            lgHeight="auto"
        >
            {activeView === 'main' && renderMainView()}
            {activeView === 'edit_username' && renderEditUsername()}
            {activeView === 'edit_password' && renderEditPassword()}
            {activeView === 'delete_account' && renderDeleteAccount()}
        </Modal>
    );
}

export default SettingsModal;