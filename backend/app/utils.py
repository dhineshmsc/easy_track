import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

# Global store for OTPs in-memory (email -> otp)
otp_store = {}

def generate_otp(email: str) -> str:
    """Generates a 6-digit OTP and stores it in-memory."""
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp
    print(f"\n[OTP DEBUG] Generated OTP for {email}: {otp}\n")
    return otp

def verify_stored_otp(email: str, submitted_otp: str) -> bool:
    """Verifies the submitted OTP against the stored OTP."""
    stored_otp = otp_store.get(email)
    if stored_otp and stored_otp == submitted_otp.strip():
        return True
    return False

def send_otp_email(email: str, otp: str, name: str = None) -> bool:
    """Sends an OTP to the specified email."""
    if not all([settings.SMTP_USERNAME, settings.SMTP_PASSWORD, settings.SENDER_EMAIL]):
        print(f"\n==================================================")
        print(f" MOCK OTP SENT TO: {email}")
        print(f" OTP CODE: {otp}")
        print(f"==================================================\n")
        return True

    msg = MIMEMultipart()
    msg['From'] = settings.SENDER_EMAIL
    msg['To'] = email
    msg['Subject'] = "Your Easy Track Verification Code"

    greeting_name = name if name else "there"
    body = f"Hello {greeting_name},\n\nYour 6-digit verification code is: {otp}\n\nPlease enter this code to verify your email.\n\nThanks,\nEasy Track Team"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_welcome_email(email: str, password: str, name: str) -> bool:
    """Sends a welcome email with the generated password to the new user."""
    if not all([settings.SMTP_USERNAME, settings.SMTP_PASSWORD, settings.SENDER_EMAIL]):
        print(f"\n==================================================")
        print(f" MOCK WELCOME EMAIL SENT TO: {email}")
        print(f" GENERATED PASSWORD: {password}")
        print(f"==================================================\n")
        return True

    msg = MIMEMultipart()
    msg['From'] = settings.SENDER_EMAIL
    msg['To'] = email
    msg['Subject'] = "Welcome to Easy Track - Your Account Details"

    greeting_name = name if name else "there"
    
    body = (
        f"Welcome to Easy Track, {greeting_name}!\n\n"
        f"Your account has been successfully created. You can now log in to the portal using your email address and the auto-generated password below.\n\n"
        f"Email: {email}\n"
        f"Password: {password}\n\n"
        f"We recommend changing this password after your first login.\n\n"
        f"Best regards,\n"
        f"The Easy Track Team"
    )
    
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
        return False

