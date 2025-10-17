export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/funds/:path*", "/admin/:path*"],
};
