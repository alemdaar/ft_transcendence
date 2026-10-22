#!/bin/bash

# Your API endpoint
URL="http://localhost:3000/request-peer"

# Random values
topics=(
  "Web Development"
  "Artificial Intelligence"
  "Cybersecurity"
  "Data Science"
  "Cloud Computing"
)

descriptions=(
  "Introduction to modern technologies"
  "Advanced practical workshop"
  "Beginner training session"
  "Technical skills development"
  "Hands-on learning experience"
)

campuses=(
  "Rabat"
  "Tetouan"
  "Benguerir"
  "Khouribga"
)

modes=("online" "insite")
statuses=("open")

# Choose a random value from each array
random_item() {
  local items=("$@")
  echo "${items[$((RANDOM % ${#items[@]}))]}"
}

# Generate random JSON values
topic=$(random_item "${topics[@]}")
description=$(random_item "${descriptions[@]}")
campus=$(random_item "${campuses[@]}")
mode=$(random_item "${modes[@]}")
status=$(random_item "${statuses[@]}")

# Send POST request
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5OCIsImlhdCI6MTUxNjIzOTAyMn0.VydxFhLup7-DJKW0fL5GccTaVGB3h6MfXlCpuof7kqw" \
  -d "$(jq -n \
    --arg topic "$topic" \
    --arg description "$description" \
    --arg campus "$campus" \
    --arg mode "$mode" \
    --arg status "$status" \
    '{
      topic: $topic,
      description: $description,
      campus: $campus,
      mode: $mode,
      status: $status
    }')"

echo