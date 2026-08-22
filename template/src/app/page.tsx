import { submitAuthFormAction } from "./auth/actions";
import { ClubhouseEntry } from "./clubhouse-entry";

export default function Home() {
  return <ClubhouseEntry authAction={submitAuthFormAction} />;
}
