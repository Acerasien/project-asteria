import { verifySession } from "@/lib/dal";
import { ImportForm } from "./import-form";

export const dynamic = "force-dynamic";

export default async function ImportGuestsPage() {
  // Authorize session to manage guests
  await verifySession("guests:manage");

  return <ImportForm />;
}
