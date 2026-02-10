"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentalHealthDisclaimer } from "@/components/wellness/mental/mental-health-disclaimer";
import { MoodCheckinForm } from "@/components/wellness/mental/mood-checkin-form";

export default function CheckinPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Check-in emocional</h2>
        <p className="text-muted-foreground">
          Como te sentis en este momento?
        </p>
      </div>

      <MentalHealthDisclaimer />

      <Card>
        <CardHeader>
          <CardTitle>Registra tu estado de animo</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodCheckinForm />
        </CardContent>
      </Card>
    </div>
  );
}
