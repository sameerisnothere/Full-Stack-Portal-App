from django.utils.log import AdminEmailHandler
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


class CustomAdminEmailHandler(AdminEmailHandler):
    """Send error emails using a custom template instead of Django's default."""

    def send_mail(self, subject, message, *args, **kwargs):
        # Context passed to template
        context = {
            "subject": subject,
            "message": message,
        }

        # Render your custom templates
        html_body = render_to_string("error_email.html", context)
        text_body = render_to_string("error_email.txt", context)

        mail = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=self.from_email,
            to=[admin_email for _, admin_email in self.admins],
        )
        mail.attach_alternative(html_body, "text/html")

        mail.send(fail_silently=True)
