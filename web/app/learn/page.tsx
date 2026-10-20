import { redirect } from "next/navigation";

export default function LearnIndexPage() {
  // Redirect to seeded demo course: CS 201 Binary Search Trees
  redirect("/learn/00000000-0000-0000-0000-000000000002");
}
