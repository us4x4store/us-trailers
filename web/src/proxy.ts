import { NextResponse, type NextRequest } from "next/server";
import { decodeBuild } from "@/trailer/pricing";

/** A share link with a code that isn't a real build gets a true 404 (no soft 404s for search engines). */
export function proxy(req: NextRequest) {
  const code = req.nextUrl.pathname.split("/")[2] ?? "";
  if (!decodeBuild(code)) {
    const url = req.nextUrl.clone();
    url.pathname = "/_not-a-build";
    return NextResponse.rewrite(url, { status: 404 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/b/:code*" };
