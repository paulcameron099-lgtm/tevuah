
import { NextResponse } from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ApplicantInput = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  positionTitle?: unknown;
};

export async function POST(request: Request) {
  try {
    // Authenticate the current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    // Only administrators can create staff applicants
    if (
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to manage staff applicants.",
        },
        { status: 403 },
      );
    }

    // Parse the incoming request
    let body: ApplicantInput;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid applicant information." },
        { status: 400 },
      );
    }

    // Normalize form values
    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const positionTitle =
      typeof body.positionTitle === "string"
        ? body.positionTitle.trim()
        : "";

    // Required field validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !positionTitle
    ) {
      return NextResponse.json(
        {
          error:
            "First name, last name, email, and position are required.",
        },
        { status: 400 },
      );
    }

    // Field length validation
    if (
      firstName.length > 100 ||
      lastName.length > 100 ||
      email.length > 254 ||
      positionTitle.length > 150
    ) {
      return NextResponse.json(
        {
          error:
            "One or more fields exceed the maximum allowed length.",
        },
        { status: 400 },
      );
    }

    // Email format validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Insert the applicant into Supabase
    const { data, error } = await admin
      .from("staff_applicants")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        position_title: positionTitle,
        recruitment_status: "new",
      })
      .select(
        "id,first_name,last_name,email,position_title,recruitment_status,created_at",
      )
      .single();

    if (error) {
      console.error(
        "[ADMIN STAFF] Failed to create applicant",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save staff applicant. Please try again.",
        },
        { status: 500 },
      );
    }

    // Return the newly created applicant
    return NextResponse.json(
      {
        success: true,
        applicant: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "[ADMIN STAFF] Unexpected error",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected server error occurred.",
      },
      { status: 500 },
    );
  }
}
