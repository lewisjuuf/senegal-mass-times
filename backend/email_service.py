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


def _wrap_html(body: str) -> str:
    """Wrap email body in a proper HTML document with inline styles for better deliverability."""
    return f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background-color:#4F46E5;padding:24px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;">✝ Messes au Sénégal</span>
        </td></tr>
        <tr><td style="padding:32px 24px;color:#1f2937;font-size:16px;line-height:1.6;">
          {body}
        </td></tr>
        <tr><td style="padding:16px 24px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;">
          Horaires des Messes au Sénégal &mdash; {FRONTEND_URL}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _btn(href: str, label: str) -> str:
    """Generate an HTML button-style link for emails."""
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">'
        f'<tr><td style="background-color:#4F46E5;border-radius:8px;text-align:center;">'
        f'<a href="{href}" target="_blank" style="display:inline-block;padding:14px 28px;'
        f'color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;">{label}</a>'
        f'</td></tr></table>'
    )


def _send_email(to: str, subject: str, html: str):
    if not _is_configured():
        logger.warning("Email non configuré (RESEND_API_KEY ou FROM_EMAIL manquant). Email ignoré.")
        return

    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": _wrap_html(html),
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
    <h2 style="color:#1f2937;margin-top:0;">Nouvelle demande d'inscription</h2>
    <p>Une nouvelle paroisse souhaite s'inscrire sur la plateforme :</p>
    <ul>
        <li><strong>Nom :</strong> {parish_name}</li>
        <li><strong>Ville :</strong> {parish_city}</li>
        <li><strong>Email admin :</strong> {admin_email}</li>
    </ul>
    <p>Connectez-vous au tableau de bord pour approuver ou rejeter cette demande.</p>
    {_btn(FRONTEND_URL + "/admin/login", "Accéder au tableau de bord")}
    """
    _send_email(MASTER_ADMIN_EMAIL, subject, html)


def notify_parish_approved(admin_email: str, parish_name: str):
    subject = f"Inscription approuvée : {parish_name}"
    html = f"""
    <h2 style="color:#1f2937;margin-top:0;">Votre inscription a été approuvée !</h2>
    <p>Bonne nouvelle ! Votre paroisse <strong>{parish_name}</strong> a été approuvée
    sur la plateforme Horaires des Messes au Sénégal.</p>
    <p>Vous pouvez maintenant vous connecter pour gérer vos horaires de messe et vos actualités paroissiales.</p>
    {_btn(FRONTEND_URL + "/admin/login", "Se connecter")}
    <p>Utilisez l'adresse email <strong>{admin_email}</strong> et le mot de passe que vous avez choisi lors de l'inscription.</p>
    """
    _send_email(admin_email, subject, html)


def notify_password_reset(admin_email: str, reset_link: str):
    subject = "Réinitialisation de votre mot de passe"
    html = f"""
    <h2 style="color:#1f2937;margin-top:0;">Réinitialisation de mot de passe</h2>
    <p>Vous avez demandé la réinitialisation de votre mot de passe sur la plateforme Horaires des Messes au Sénégal.</p>
    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
    {_btn(reset_link, "Réinitialiser mon mot de passe")}
    <p style="color:#6b7280;font-size:14px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    """
    _send_email(admin_email, subject, html)


def notify_parish_rejected(admin_email: str, parish_name: str):
    subject = f"Inscription non approuvée : {parish_name}"
    html = f"""
    <h2 style="color:#1f2937;margin-top:0;">Votre demande d'inscription n'a pas été approuvée</h2>
    <p>Nous sommes désolés de vous informer que la demande d'inscription pour la paroisse
    <strong>{parish_name}</strong> n'a pas été approuvée.</p>
    <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur principal.</p>
    """
    _send_email(admin_email, subject, html)
