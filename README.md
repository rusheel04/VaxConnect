# VaxConnect

AI-powered vaccination planning, travel guidance, and verified vaccine availability using CALL-E.

## What it does

VaxConnect helps users:

- Check child vaccination requirements
- Check travel vaccination guidance
- Find vaccine availability
- Get vaccination information and guidance through an AI assistant powered by Google Gemini
- Request appointment assistance through an AI phone agent powered by CALL-E

## AI safety and scope

VaxConnect is a demonstration application.

The Gemini-powered assistant provides general vaccination information and guidance for informational purposes. It is not a medical professional and does not provide medical diagnoses, treatment decisions, or personalized medical advice. Users should confirm vaccination decisions and requirements with a qualified healthcare professional or the relevant official health authority.

CALL-E is used to contact explicitly authorized recipients for the demonstration. Real calls are disabled by default.

## Setup

1. Install dependencies.
2. Create a `.env.local` file.
3. Add the required API credentials and configuration.
4. Never commit `.env.local` or other credentials to the repository.

For a safe default configuration:

```env
CALLE_ENABLE_REAL_CALLS=false
CALLE_ALLOWED_RECIPIENTS=
CALLE_INTERNAL_SECRET=your-local-secret

## Call outcomes

The application distinguishes between:

- `yes` — the provider explicitly confirmed that the appointment was booked.
- `no` — the provider explicitly indicated that the appointment was not booked.
- `unknown` — the call did not produce a reliable booking outcome.

An `unknown` result is never treated as a confirmed appointment.

## Appointment limitations

VaxConnect does not guarantee that a provider will accept or complete an appointment request.

If a provider accepts an appointment, cancellation or modification may need to be handled directly with that provider. The application does not assume that it can automatically cancel an appointment that has already been accepted.

## Development

Run the application locally with:

```bash
npm install
npm run dev
