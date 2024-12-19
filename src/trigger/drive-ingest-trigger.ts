import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { getLatestDriveCredential } from "@/app/api/integrations/googledrive/oauth";
import { iteratePages } from "@/app/api/integrations/googledrive/ingest-files";

export const digestFiles = task({
  id: "Drive-File-Ingestion",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: any, { ctx }) => {
    //    const driveCreds = await getLatestDriveCredential(payload.email);
    //    const headers = new Headers();
    //    headers.append("Content-Type", "application/json");
    //    headers.append("Authorization", "Bearer " + driveCreds[0].access_token);
    //
    //    const params = new URLSearchParams({
    //      pageSize: "20",
    //    }).toString();
    //    const googleResponse = await fetch("https://www.googleapis.com/drive/v3/files?" + params, {
    //      method: "GET",
    //      headers: headers
    //    });
    //    const body = await googleResponse.json()
    //
    //    const successful = await iteratePages(body, payload.email);
    //
    //    if (successful) {
    //      return { status: 200 };
    //    } else {
    //      console.error("[Google Drive Trigger]", body);
    //      return { status: 400, error: body }
    //    }
  },
});
