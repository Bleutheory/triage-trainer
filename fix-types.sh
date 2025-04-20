#!/usr/bin/env bash
set -e
# 10. TriageBoard.tsx: type fixes and localStorage guards
sed -i '' "s|some(i =>|some((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|map(i =>|map((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|find(i =>|find((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|.map(i =>|.map((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|.find(i =>|.find((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|onNotify: (msg)|onNotify: (msg: string)|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|interventions.map(i =>|interventions.map((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|casualty.interventions.find(i =>|casualty.interventions.find((i: Intervention) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|setItem(\"penaltyPoints\", current + 40)|setItem(\"penaltyPoints\", String(current + 40))|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|localStorage.setItem(\"penaltyPoints\", current + 40)|localStorage.setItem(\"penaltyPoints\", String(current + 40))|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|triageOrder\\[a.casualty.triage\\]|triageOrder[a.casualty.triage as keyof typeof triageOrder]|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|triageOrder\\[b.casualty.triage\\]|triageOrder[b.casualty.triage as keyof typeof triageOrder]|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|applyItem={(item) =>|applyItem={(item: string) =>|g" src/components/TriageBoard/TriageBoard.tsx
sed -i '' "s|onTriageChange={(value) =>|onTriageChange={(value: string) =>|g" src/components/TriageBoard/TriageBoard.tsx

echo "Applied bulk fixes. Please re-run npm start or type-check to confirm."