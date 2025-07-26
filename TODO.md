# TODO

## Completed Tasks

### OTP Verification System
- ✅ Create a reusable OTP verification screen that takes in 4 digits, to be used for signup and password reset flows.
- ✅ Integrate the OTP verification screen into the signup and reset password flows, ensuring navigation and state handling are correct.

## In Progress

## Pending

## Notes
- The OTP verification screen accepts `email` and `onSuccessRoute` parameters via router
- Demo code "1234" is accepted for testing purposes
- Resend functionality has a 30-second cooldown
- Back button added for better UX
- Integration supports both signup flow (→ home) and password reset flow (→ reset-password) 