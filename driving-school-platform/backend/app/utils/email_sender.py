import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List

class EmailSender:
    def __init__(self, smtp_server: str = "localhost", smtp_port: int = 587):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
    
    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        body: str,
        from_email: str = "noreply@drivingschool.com"
    ) -> bool:
        try:
            # Mock email sending for now
            print(f"Mock Email Sent:")
            print(f"To: {to_emails}")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False