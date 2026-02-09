"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLine, ArrowLeft } from "lucide-react";
import { MentalHealthDisclaimer } from "@/components/wellness/mental/mental-health-disclaimer";
import { JournalPromptCard } from "@/components/wellness/mental/journal-prompt-card";
import { JournalForm } from "@/components/wellness/mental/journal-form";
import { JournalList } from "@/components/wellness/mental/journal-list";

export default function JournalPage() {
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>();

  function handleSelectPrompt(prompt: string) {
    setSelectedPrompt(prompt);
    setIsWriting(true);
  }

  function handleSuccess() {
    setIsWriting(false);
    setSelectedPrompt(undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Journal</h2>
          <p className="text-muted-foreground">
            Tu espacio para reflexionar y escribir
          </p>
        </div>
        {isWriting ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsWriting(false);
              setSelectedPrompt(undefined);
            }}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsWriting(true)}
          >
            <PenLine className="mr-2 size-4" />
            Nueva entrada
          </Button>
        )}
      </div>

      <MentalHealthDisclaimer />

      {isWriting ? (
        <div className="space-y-6">
          {!selectedPrompt && (
            <JournalPromptCard onSelectPrompt={handleSelectPrompt} />
          )}
          <Card>
            <CardHeader>
              <CardTitle>Nueva entrada</CardTitle>
            </CardHeader>
            <CardContent>
              <JournalForm
                initialPrompt={selectedPrompt}
                onSuccess={handleSuccess}
                onCancel={() => {
                  setIsWriting(false);
                  setSelectedPrompt(undefined);
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <JournalList />
      )}
    </div>
  );
}
