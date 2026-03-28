"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFaq, deleteFaq, type FAQ, listFaqs, updateFaq } from "@/lib/content-admin-api";

type Lang = "en" | "fr" | "ar";
type QuestionKey = "question_en" | "question_fr" | "question_ar";
type AnswerKey = "answer_en" | "answer_fr" | "answer_ar";

function LangBox({
  label,
  lang,
  faq,
  onChange,
}: {
  label: string;
  lang: Lang;
  faq: FAQ;
  onChange: (patch: Partial<FAQ>) => void;
}) {
  const qKey = `question_${lang}` as QuestionKey;
  const aKey = `answer_${lang}` as AnswerKey;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            className="min-h-[80px]"
            value={(faq[qKey] ?? "") as string}
            onChange={(e) => onChange({ [qKey]: e.target.value } as Partial<FAQ>)}
          />
        </div>
        <div className="space-y-2">
          <Label>Answer</Label>
          <Textarea
            className="min-h-[120px]"
            value={(faq[aKey] ?? "") as string}
            onChange={(e) => onChange({ [aKey]: e.target.value } as Partial<FAQ>)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      setFaqs(await listFaqs());
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch(id: string, p: Partial<FAQ>) {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...p } : f)));
  }

  async function onAdd() {
    setLoading(true);
    setMessage(null);
    try {
      await createFaq({
        order: faqs.length + 1,
        is_active: true,
        question_en: "",
        question_fr: "",
        question_ar: "",
        answer_en: "",
        answer_fr: "",
        answer_ar: "",
      });
      setMessage("Created.");
      await load();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  async function onSave(f: FAQ) {
    setLoading(true);
    setMessage(null);
    try {
      await updateFaq(f.id, {
        order: Number(f.order) || 1,
        is_active: !!f.is_active,
        question_en: f.question_en ?? "",
        question_fr: f.question_fr ?? "",
        question_ar: f.question_ar ?? "",
        answer_en: f.answer_en ?? "",
        answer_fr: f.answer_fr ?? "",
        answer_ar: f.answer_ar ?? "",
      });
      setMessage("Saved.");
      await load();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    setLoading(true);
    setMessage(null);
    try {
      await deleteFaq(id);
      setMessage("Deleted.");
      await load();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">FAQs</h1>
          <p className="text-muted-foreground text-sm">Add professional Q&A entries in English, French, and Arabic.</p>
        </div>
        <Button onClick={onAdd} disabled={loading}>
          Add FAQ
        </Button>
      </div>

      {message ? (
        <Card>
          <CardContent className="pt-6 text-sm">{message}</CardContent>
        </Card>
      ) : null}

      <div className="space-y-6">
        {faqs.map((f) => (
          <Card key={f.id}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-1">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    className="w-[120px]"
                    value={f.order ?? 1}
                    onChange={(e) => patch(f.id, { order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6 md:pt-0">
                  <Checkbox
                    checked={!!f.is_active}
                    onCheckedChange={(v) => patch(f.id, { is_active: !!v })}
                    id={`active_${f.id}`}
                  />
                  <Label htmlFor={`active_${f.id}`}>Active</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" onClick={() => onSave(f)} disabled={loading}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => onDelete(f.id)} disabled={loading}>
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <LangBox label="English" lang="en" faq={f} onChange={(p) => patch(f.id, p)} />
                <LangBox label="French" lang="fr" faq={f} onChange={(p) => patch(f.id, p)} />
                <LangBox label="Arabic" lang="ar" faq={f} onChange={(p) => patch(f.id, p)} />
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && faqs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-muted-foreground text-sm">No FAQs yet. Click “Add FAQ”.</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
