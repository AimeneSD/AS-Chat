import { useState } from "react";
import Modal from "../ui/Modal";
import { userService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

function formatHiddenEmail(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [localPart, domain] = parts;
    const firstChar = localPart.charAt(0);
    const hiddenPart = '●'.repeat(Math.max(localPart.length - 1, 7)); 
    return `${firstChar}${hiddenPart}@${domain}`;
}

function SettingsModal({ isOpen, onClose, user }) {
    // Il faut utiliser useAuth() si on veut rafraîchir l'utilisateur global après update
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
    
    // États Email (3 étapes : 'send_code' -> 'enter_code' -> 'new_email')
    const [emailStep, setEmailStep] = useState('send_code');
    const [verificationCode, setVerificationCode] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const resetStates = () => {
        setLoading(false);
        setError('');
        setSuccessMsg('');
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setNewEmail('');
        setEmailStep('send_code');
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

    // --- Flux E-mail ---
    const handleRequestCode = async () => {
        setLoading(true); setError('');
        try {
            await userService.requestEmailChange();
            setEmailStep('enter_code');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'envoi du code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndChangeEmail = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            return setError('Veuillez entrer une adresse e-mail valide.');
        }
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            await userService.updateEmail({ code: verificationCode, newEmail });
            setSuccessMsg('E-mail mis à jour avec succès !');
            setTimeout(() => { window.location.reload(); }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Code incorrect ou erreur.');
        } finally {
            setLoading(false);
        }
    };

    // --- Vues ---

    const renderMainView = () => (
        <div className="flex flex-col gap-8 text-white mt-4">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-3xl shadow-lg">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        user?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{user?.username}</h2>
                    <p className="text-white/50 text-sm">Statut : En ligne</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-green-400 uppercase tracking-wider text-sm">Mon Compte</h3>
                
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                        <p className="text-white/50 text-xs font-semibold mb-1 uppercase tracking-wider">Nom d'utilisateur</p>
                        <p className="font-medium text-lg">{user?.username}</p>
                    </div>
                    <button onClick={() => navigateTo('edit_username')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Modifier</button>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                        <p className="text-white/50 text-xs font-semibold mb-1 uppercase tracking-wider">Adresse E-mail</p>
                        <p className="font-medium text-lg">{formatHiddenEmail(user?.email)}</p>
                    </div>
                    <button onClick={() => navigateTo('edit_email')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Modifier</button>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                        <p className="text-white/50 text-xs font-semibold mb-1 uppercase tracking-wider">Mot de passe</p>
                        <p className="font-medium text-lg tracking-[0.2em] mt-1">••••••••••••</p>
                    </div>
                    <button onClick={() => navigateTo('edit_password')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Modifier</button>
                </div>
            </div>
        </div>
    );

    const renderEditUsername = () => (
        <div className="flex flex-col gap-6 text-white mt-4">
            <h2 className="text-xl font-bold text-green-400">Modifier le nom d'utilisateur</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">{successMsg}</div>}
            
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-sm font-semibold">Nom d'utilisateur actuel</label>
                    <input type="text" value={user?.username || ''} disabled className="bg-white/5 border border-white/10 rounded-xl p-3 text-white/50 cursor-not-allowed outline-none"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-white/80 text-sm font-semibold">Nouveau nom d'utilisateur</label>
                    <input type="text" placeholder="Nouveau pseudo" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:border-green-500 outline-none transition-colors"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-white/80 text-sm font-semibold">Mot de passe actuel</label>
                    <input type="password" placeholder="Pour des raisons de sécurité" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:border-green-500 outline-none transition-colors"/>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => navigateTo('main')} className="px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                <button onClick={handleUpdateUsername} disabled={loading} className="px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
                    {loading ? '...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );

    const renderEditEmail = () => (
        <div className="flex flex-col gap-6 text-white mt-4">
            <h2 className="text-xl font-bold text-green-400">Modifier l'adresse e-mail</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">{successMsg}</div>}

            {emailStep === 'send_code' && (
                <>
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-200 text-sm leading-relaxed">
                        Pour modifier votre adresse e-mail, nous devons d'abord vérifier votre identité. Un code de vérification à 6 chiffres va être envoyé à votre adresse actuelle : <br/><strong className="text-white text-base mt-2 inline-block">{formatHiddenEmail(user?.email)}</strong>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => navigateTo('main')} className="px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                        <button onClick={handleRequestCode} disabled={loading} className="px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
                            {loading ? 'Envoi...' : 'Envoyer le code'}
                        </button>
                    </div>
                </>
            )}

            {emailStep === 'enter_code' && (
                <>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-white/80 text-sm font-semibold text-center">Étape 1 : Entrez le code reçu</label>
                            <input 
                                type="text" placeholder="000000" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-xl p-4 text-white text-center text-2xl tracking-[0.5em] focus:border-green-500 outline-none transition-colors mx-auto w-48 font-mono"
                            />
                        </div>
                        {verificationCode.length === 6 && (
                            <div className="flex flex-col gap-2 mt-4 animate-fade-in">
                                <label className="text-white/80 text-sm font-semibold text-center text-green-400">Étape 2 : Nouvelle adresse e-mail</label>
                                <input 
                                    type="email" placeholder="nouvelle@adresse.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                                    className="bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:border-green-500 outline-none transition-colors text-center"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button onClick={handleRequestCode} className="text-sm text-white/40 hover:text-white transition-colors underline underline-offset-4">Renvoyer le code</button>
                        <div className="flex gap-3">
                            <button onClick={() => navigateTo('main')} className="px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                            <button 
                                onClick={handleVerifyAndChangeEmail} 
                                disabled={loading || verificationCode.length !== 6 || !newEmail} 
                                className="px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                            >
                                {loading ? '...' : 'Valider le changement'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderEditPassword = () => (
        <div className="flex flex-col gap-6 text-white mt-4">
            <h2 className="text-xl font-bold text-green-400">Modifier le mot de passe</h2>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm border border-green-500/30">{successMsg}</div>}
            
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-white/80 text-sm font-semibold">Mot de passe actuel</label>
                    <input type="password" placeholder="Votre ancien mot de passe" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:border-green-500 outline-none transition-colors"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-white/80 text-sm font-semibold">Nouveau mot de passe</label>
                    <input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:border-green-500 outline-none transition-colors"/>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-white/80 text-sm font-semibold">Confirmer le nouveau mot de passe</label>
                    <input type="password" placeholder="Confirmez le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:border-green-500 outline-none transition-colors"/>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => navigateTo('main')} className="px-5 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors">Annuler</button>
                <button onClick={handleUpdatePassword} disabled={loading} className="px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
                    {loading ? '...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={activeView === 'main' ? "Paramètres du compte" : "Retour"} 
            lgWidth={activeView === 'main' ? "50vw" : "40vw"} 
            lgHeight="auto"
        >
            {activeView === 'main' && renderMainView()}
            {activeView === 'edit_username' && renderEditUsername()}
            {activeView === 'edit_email' && renderEditEmail()}
            {activeView === 'edit_password' && renderEditPassword()}
        </Modal>
    );
}

export default SettingsModal;