"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
export const neonAuthClient = authClient;
