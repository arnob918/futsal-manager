import type { MetadataRoute } from "next";

// Read at request time, not baked in at build. Flipping BETA_MODE still needs a
// Vercel redeploy to take effect, but this keeps `next start` honest locally.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  // Closed beta unless explicitly switched off.
  if (process.env.BETA_MODE !== "off") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/funds/"] },
  };
}
