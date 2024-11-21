import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendSendEmail(
	to: string,
	subject: string,
	html: string,
) {
	try {
		return await resend.emails.send({
			from: "Evame <noreply@mail.reimei.dev>",
			to,
			subject,
			html,
		});
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
}
