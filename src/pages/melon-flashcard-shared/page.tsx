import { useParams } from "react-router-dom";
import { SharedFlashcardViewer } from "@/pages/melon-flashcard/ShareFlashcardModal";

export default function MelonFlashcardSharedPage() {
  const { shareId } = useParams<{ shareId: string }>();
  return <SharedFlashcardViewer shareId={shareId ?? ""} />;
}
