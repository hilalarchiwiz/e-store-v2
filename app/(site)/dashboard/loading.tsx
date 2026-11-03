import PageLoader from "@/components/v2/PageLoader";

export default function Loading() {
  // Keep the loader in normal document flow so the footer never appears in the
  // initial viewport and then jumps when streamed page content arrives.
  return <PageLoader overlay={false} />;
}
