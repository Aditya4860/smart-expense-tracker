import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.logging import logger

def send_enquiry_email(name: str, email: str, query: str):
    # Default to Gmail SMTP settings if not provided in env
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    admin_email = "mad.developer15@gmail.com"
    smtp_user = os.getenv("SMTP_USER", admin_email)

    subject = f"Zenith Wealth - User Enquiry from {name}"
    body = f"New enquiry received from Zenith Wealth landing page.\n\nName: {name}\nEmail: {email}\n\nQuery:\n{query}"

    if not smtp_password:
        logger.warning(
            "SMTP_PASSWORD is not set in the environment variables. "
            "Logging the email content instead of sending it."
        )
        logger.info(f"--- MOCK EMAIL TO {admin_email} ---\nSubject: {subject}\n\n{body}\n---------------------------")
        return

    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = admin_email
        msg["Subject"] = subject
        msg["Reply-To"] = email

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, admin_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent enquiry email from {email} to admin.")
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {e}")
