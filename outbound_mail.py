import os
import requests

def send_email(to_email, subject, html, text):
    key = os.getenv('BREVO_API_KEY')
    sender = os.getenv('MAIL_FROM')
    if not key or not sender:
        raise RuntimeError('BREVO_API_KEY and MAIL_FROM must be set')
    r = requests.post(
        'https://api.brevo.com/v3/smtp/email',
        headers={'api-key': key, 'accept': 'application/json', 'content-type': 'application/json'},
        json={'sender': {'name': 'Potsherd', 'email': sender},
              'to': [{'email': to_email}],
              'subject': subject, 'htmlContent': html, 'textContent': text},
        timeout=15)
    r.raise_for_status()
