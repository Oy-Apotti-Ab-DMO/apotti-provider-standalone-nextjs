"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import "./styles/HomePage.css";

export default function HomePage() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const patientId = searchParams.get("patientId");

  const [manualPatientId, setManualPatientId] = useState<string>("");

  const handleSignIn = () => {
    let origin = process.env.NEXT_PUBLIC_APP_URL;
    if (!origin && typeof window !== "undefined") {
      origin = window.location.origin;
    }
    if (!origin) origin = "http://localhost:3000";

    const redirectUri = encodeURIComponent(`${origin}/api/auth/callback`);
    
    // SMART on FHIR standalone provider launch:
    // includes 'launch/patient' so Epic prompts the provider to select a patient.
    // Epic OAuth scopes typically: openid fhirUser launch/patient patient/*.read user/*.read
    const scopes = encodeURIComponent(
      "openid profile fhirUser launch/patient patient/*.read user/*.read"
    );

    const authorizeUrl = `${process.env.NEXT_PUBLIC_FHIR_SERVER_A}/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scopes}`;
    // Redirect to external Apotti OAuth authorization page
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(authorizeUrl);
  };

  return (
    <div className="container">
      <div className="image-container">
        <Image
          src="/apottilabs.png"
          alt="Apotti Labs Logo"
          width={200}
          height={100}
          priority
        />
      </div>

      <h1>Welcome to Apotti Provider Standalone App</h1>
      <p className="subtitle">SMART on FHIR Provider Portal</p>

      {!accessToken ? (
        <button className="sign-in-button" onClick={handleSignIn}>
          Sign In as Healthcare Provider
        </button>
      ) : (
        <div className="selected-patient">
          {patientId ? (
            <div>
              <h2>Selected Patient ID: {patientId}</h2>
              <Link
                className="patient-link"
                href={`/patient/${patientId}?accessToken=${accessToken}`}
              >
                View Patient Chart & Observations &rarr;
              </Link>
            </div>
          ) : (
            <div>
              <p>Signed in successfully.</p>
              <div style={{ marginTop: "16px" }}>
                <input
                  type="text"
                  placeholder="Enter Patient ID"
                  value={manualPatientId}
                  onChange={(e) => setManualPatientId(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginRight: "8px",
                  }}
                />
                {manualPatientId.trim() ? (
                  <Link
                    className="patient-link"
                    href={`/patient/${manualPatientId.trim()}?accessToken=${accessToken}`}
                  >
                    Open Patient Chart
                  </Link>
                ) : (
                  <span style={{ color: "#888" }}>Enter an ID to proceed</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
