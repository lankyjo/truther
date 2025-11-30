import { scrapePage } from "@/lib/scrape";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json(
        { success: false, error: "URL is required." },
        { status: 400 }
      );
    }

    const result = await scrapePage(url);

    return Response.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
