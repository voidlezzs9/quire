import { createFileRoute } from "@tanstack/react-router";
import { Notebook } from "@/components/vellum/notebook";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Notebook />;
}
