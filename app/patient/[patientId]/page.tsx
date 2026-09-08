"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import "../../styles/PatientPage.css";

interface PatientData {
  id?: string;
  name?: Array<{ text?: string; family?: string; given?: string[] }>;
  birthDate?: string;
  gender?: string;
  address?: Array<{ text?: string; line?: string[]; city?: string }>;
}

interface ObservationEntry {
  resource: {
    id?: string;
    code?: { text?: string; coding?: Array<{ display?: string; code?: string }> };
    valueQuantity?: { value?: number; unit?: string };
    valueString?: string;
    effectiveDateTime?: string;
  };
}

function PatientContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params?.patientId as string;
  const accessToken = searchParams.get("accessToken");

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [observations, setObservations] = useState<ObservationEntry[]>([]);
  const [loading, setLoading] = useState(Boolean(accessToken && patientId));
  const [errorMsg, setErrorMsg] = useState<string | null>(
    !accessToken
      ? "Access token not found in URL query parameters."
      : !patientId
      ? "Patient ID parameter missing."
      : null
  );

  useEffect(() => {
    if (!accessToken || !patientId) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch patient demographics
        const patientResponse = await axios.get(`/api/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Fetch patient observations (vital signs)
        const observationResponse = await axios.get(
          `/api/observation/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const entries: ObservationEntry[] = observationResponse.data?.entry || [];
        const sorted = [...entries].sort((a, b) => {
          const timeA = new Date(a.resource?.effectiveDateTime || 0).getTime();
          const timeB = new Date(b.resource?.effectiveDateTime || 0).getTime();
          return timeB - timeA;
        });

        if (isMounted) {
          setPatientData(patientResponse.data);
          setObservations(sorted);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const axiosError = err as AxiosError<{ details?: { issue?: Array<{ diagnostics?: string }> }; error?: string }>;
        console.error("Error fetching provider patient data:", axiosError);
        setErrorMsg(
          axiosError.response?.data?.details?.issue?.[0]?.diagnostics ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            "Failed to load patient data"
        );
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [accessToken, patientId]);

  if (loading) {
    return (
      <div className="container">
        <p className="loading">Loading patient records from FHIR server...</p>
      </div>
    );
  }

  const patientName =
    patientData?.name?.[0]?.text ||
    (patientData?.name?.[0]?.given
      ? `${patientData.name[0].given.join(" ")} ${patientData.name[0].family || ""}`
      : "N/A");

  const patientAddress =
    patientData?.address?.[0]?.text ||
    patientData?.address?.[0]?.city ||
    "N/A";

  return (
    <div className="container">
      <div className="top-bar">
        <Link href="/" className="back-link">
          &larr; Return to Provider Portal
        </Link>
        <span className="badge">Provider Mode</span>
      </div>

      {errorMsg && (
        <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", marginBottom: "16px" }}>
          {errorMsg}
        </div>
      )}

      <div className="header">
        <h1>Patient Information</h1>
      </div>

      {patientData && (
        <table className="patient-info">
          <tbody>
            <tr>
              <td><strong>Name:</strong></td>
              <td>{patientName}</td>
            </tr>
            <tr>
              <td><strong>Patient ID:</strong></td>
              <td>{patientData.id}</td>
            </tr>
            <tr>
              <td><strong>Gender:</strong></td>
              <td>{patientData.gender || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Date of Birth:</strong></td>
              <td>{patientData.birthDate || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>{patientAddress}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="header">
        <h1>Observations (Vital Signs)</h1>
      </div>

      {observations.length > 0 ? (
        <table className="observations-table">
          <thead>
            <tr>
              <th>Observation Code / Name</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {observations.map((obs, idx) => {
              const codeDisplay =
                obs.resource.code?.text ||
                obs.resource.code?.coding?.[0]?.display ||
                obs.resource.code?.coding?.[0]?.code ||
                "Unknown";
              const value =
                obs.resource.valueQuantity?.value ??
                obs.resource.valueString ??
                "-";
              const unit = obs.resource.valueQuantity?.unit || "";
              const dateStr = obs.resource.effectiveDateTime
                ? new Date(obs.resource.effectiveDateTime).toLocaleString()
                : "N/A";

              return (
                <tr key={obs.resource.id || idx}>
                  <td>{codeDisplay}</td>
                  <td>{value}</td>
                  <td>{unit}</td>
                  <td>{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="empty-state">No vital sign observations found for this patient.</p>
      )}
    </div>
  );
}

export default function ProviderPatientPage() {
  return (
    <Suspense fallback={<div className="container"><p className="loading">Loading patient records...</p></div>}>
      <PatientContent />
    </Suspense>
  );
}
