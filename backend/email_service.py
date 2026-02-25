"""
Service de notification par email via Resend.
Tous les emails sont en français. L'envoi est best-effort : les erreurs sont loguées, jamais levées.
"""

import os
import logging
import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
MASTER_ADMIN_EMAIL = os.getenv("MASTER_ADMIN_EMAIL", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "") or "Horaires Messes Sénégal <onboarding@resend.dev>"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

resend.api_key = RESEND_API_KEY


def _is_configured() -> bool:
    return bool(RESEND_API_KEY and FROM_EMAIL)


def _send_email(to: str, subject: str, html: str):
    if not _is_configured():
        logger.warning("Email non configuré (RESEND_API_KEY ou FROM_EMAIL manquant). Email ignoré.")
        return

    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info(f"Email envoyé à {to}: {subject}")
    except Exception as e:
        logger.error(f"Échec d'envoi d'email à {to}: {e}")


def notify_new_registration(parish_name: str, parish_city: str, admin_email: str):
    if not MASTER_ADMIN_EMAIL:
        logger.warning("MASTER_ADMIN_EMAIL non défini. Notification ignorée.")
        return

    subject = f"Nouvelle inscription : {parish_name}"
    html = f"""
    <h2>Nouvelle demande d'inscription</h2>
    <p>Une nouvelle paroisse souhaite s'inscrire sur la plateforme :</p>
    <ul>
        <li><strong>Nom :</strong> {parish_name}</li>
        <li><strong>Ville :</strong> {parish_city}</li>
        <li><strong>Email admin :</strong> {admin_email}</li>
    </ul>
    <p>Connectez-vous au tableau de bord pour approuver ou rejeter cette demande.</p>
    <p><a href="{FRONTEND_URL}/admin">Accéder au tableau de bord</a></p>
    """
    _send_email(MASTER_ADMIN_EMAIL, subject, html)


def notify_parish_approved(admin_email: str, parish_name: str):
    subject = f"Inscription approuvée : {parish_name}"
    html = f"""
    <h2>Votre inscription a été approuvée !</h2>
    <p>Bonne nouvelle ! Votre paroisse <strong>{parish_name}</strong> a été approuvée
    sur la plateforme Horaires des Messes au Sénégal.</p>
    <p>Vous pouvez maintenant vous connecter pour gérer vos horaires de messe et vos actualités paroissiales.</p>
    <p><a href="{FRONTEND_URL}/admin/login">Se connecter</a></p>
    <p>Utilisez l'adresse email <strong>{admin_email}</strong> et le mot de passe que vous avez choisi lors de l'inscription.</p>
    """
    _send_email(admin_email, subject, html)


def notify_parish_rejected(admin_email: str, parish_name: str):
    subject = f"Inscription non approuvée : {parish_name}"
    html = f"""
    <h2>Votre demande d'inscription n'a pas été approuvée</h2>
    <p>Nous sommes désolés de vous informer que la demande d'inscription pour la paroisse
    <strong>{parish_name}</strong> n'a pas été approuvée.</p>
    <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur principal.</p>
    """
    _send_email(admin_email, subject, html)
