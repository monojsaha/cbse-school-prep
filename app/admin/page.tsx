import Link from "next/link";
import { BookOpen, FileText, BookMarked } from "lucide-react";

const SECTIONS = [
  {
    href:   "/admin/questions",
    icon:   <BookOpen className="text-math-500" size={24} />,
    title:  "Questions",
    desc:   "Add, edit, and publish practice questions across subjects.",
    color:  "bg-math-50 border-math-200",
  },
  {
    href:   "/admin/writing",
    icon:   <FileText className="text-writing-500" size={24} />,
    title:  "Writing Prompts",
    desc:   "Manage creative writing and essay prompts.",
    color:  "bg-writing-50 border-writing-200",
  },
  {
    href:   "/admin/vocabulary",
    icon:   <BookMarked className="text-vocab-500" size={24} />,
    title:  "Vocabulary",
    desc:   "Curate vocabulary word lists by class and difficulty.",
    color:  "bg-vocab-50 border-vocab-200",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-800">Dashboard</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`block rounded-2xl border p-5 hover:shadow-card-hover transition-shadow ${s.color}`}
          >
            <div className="mb-3">{s.icon}</div>
            <p className="font-bold text-neutral-900 mb-1">{s.title}</p>
            <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
