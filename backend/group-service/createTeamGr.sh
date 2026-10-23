#!/bin/bash

# Your API endpoint
URL="http://localhost:8080/groups"

# Random values
names=(
  "Code Masters"
  "Study Hub"
  "Dev Team"
  "Tech Minds"
  "Web Wizards"
  "Peer Learners"
  "Backend Crew"
  "Frontend Squad"
  "Project Builders"
  "Digital Lab"
)

types=("team")

descriptions=(
  "Looking for people to study together"
  "Let's build projects and learn"
  "Searching for teammates"
  "A group for sharing knowledge"
  "Collaborate and improve our skills"
)

campuses=(
  "Rabat"
  "Tetouan"
  "Benguerir"
  "Khouribga"
)

# Choose a random value from each array
random_item() {
  local items=("$@")
  echo "${items[$((RANDOM % ${#items[@]}))]}"
}

# Generate random JSON values
name=$(random_item "${names[@]}")
type=$(random_item "${types[@]}")
description=$(random_item "${descriptions[@]}")
campus=$(random_item "${campuses[@]}")
memberLimit=$((RANDOM % 5 + 2))

# Send POST request
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQyLCJjYW1wdXMiOiJUZXRvdWFuIiwiaWF0IjoxNTE2MjM5MDIyfQ.XrWZcdrKvmphVWmCoBZ7eo1PxiNDmQ1sVg13XjMSGzk" \
  -d "$(jq -n \
  --arg name "$name" \
  --arg description "$description" \
  --arg campus "$campus" \
  --arg type "$type" \
  --argjson memberLimit "$memberLimit" \
  '{
    name: $name,
    type: $type,
    description: $description,
    campus: $campus,
    memberLimit: $memberLimit
  }')"

echo