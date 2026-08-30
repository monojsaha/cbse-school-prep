"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { queryDocuments, updateDocument, addDocument, COL } from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import type { Question } from "@/types";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    queryDocuments<Question>(COL.QUESTIONS, [orderBy("createdAt", "desc")])
      .catch(() => [] as Question[])
      .then((q) => { setQuestions(q); setLoading(false); });
  }, []);

  const togglePublish = async (q: Question) => {
    await updateDocument(COL.QUESTIONS, q.id, { isPublished: !q.isPublished });
    setQuestions((prev) => prev.map((x) => x.id === q.id ? { ...x, isPublished: !x.isPublished } : x));
  };

  const filtered = questions.filter(
    (q) =>
      search === "" ||
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.subjectId?.toLowerCase().includes(search.toLowerCase())
  );

  const DIFF_VARIANT: Record<string, "success" | "warning" | "error" | "default"> = {
    easy: "success", medium: "warning", hard: "error", challenge: "default",
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-800">Questions ({questions.length})</h2>
        <Button icon={<Plus size={15} />} size="sm" disabled>
          Add Question
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full h-9 rounded-xl border border-neutral-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-400">No questions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((q) => (
              <div key={q.id} className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={DIFF_VARIANT[q.difficulty] ?? "default"} size="sm" className="capitalize">
                      {q.difficulty}
                    </Badge>
                    <Badge variant="default" size="sm" className="uppercase">{q.questionType}</Badge>
                    {q.subjectId && <span className="text-xs text-neutral-400">{q.subjectId}</span>}
                  </div>
                  <p className="text-sm text-neutral-800 leading-snug line-clamp-2">{q.questionText}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => togglePublish(q)}
                    title={q.isPublished ? "Unpublish" : "Publish"}
                    className="text-neutral-400 hover:text-brand-500 transition-colors"
                  >
                    {q.isPublished
                      ? <CheckCircle2 size={18} className="text-success-500" />
                      : <XCircle     size={18} className="text-neutral-300" />
                    }
                  </button>
                  <button type="button" className="text-neutral-400 hover:text-brand-500 transition-colors" disabled>
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
