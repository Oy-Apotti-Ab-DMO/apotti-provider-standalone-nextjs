# Apotti Provider Standalone App (Next.js)

This project is a standalone healthcare-provider-facing application that allows clinicians to review patient records and observations. It interacts with an Apotti/Epic FHIR server using the SMART on FHIR protocol (Standalone Provider Launch with `launch/patient`).

## Architecture & SMART Workflow

1. **Launch**: The practitioner clicks "Sign In as Healthcare Provider".
2. **SMART Authorization**: The app redirects to Apotti OAuth2 endpoint requesting scopes:
   `openid profile fhirUser launch/patient patient/*.read user/*.read`
3. **Epic Patient Picker**: Apotti/Epic prompts the authenticated practitioner to select a patient.
4. **Token Exchange**: Epic returns an authorization code, exchanged server-side for an `access_token` and the selected `patient` ID.
5. **Clinical Data**:
   - Patient demographics retrieved via `/api/patient/[patientId]`.
   - Vital signs / observations retrieved via `/api/observation/[patientId]`.

## Configuration (`.env`)

```bash
NEXT_PUBLIC_FHIR_SERVER=https://gw.apottiekosysteemi.fi/Interconnect-FHIR-EKO01/api/FHIR/R4
NEXT_PUBLIC_FHIR_SERVER_A=https://gw.apottiekosysteemi.fi/Interconnect-EKO01/oauth2
NEXT_PUBLIC_CLIENT_ID=<your_provider_client_id>
```

## Running the App

```bash
bun dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Reference Implementation
The patient standalone counterpart is referenced at [`ref-patient`](./ref-patient).
