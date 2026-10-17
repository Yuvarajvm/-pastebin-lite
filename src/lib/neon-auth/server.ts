import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ||
  "https://ep-dawn-sunset-azr6rgd1.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  "p4st3b1n_l1t3_n30n_4uth_s3cur3_s3cr3t_k3y_99_secure";

if (!baseUrl || !cookieSecret) {
  throw new Error("Neon Auth environment variables are missing.");
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300
  }
});

export const neonAuth = auth;
