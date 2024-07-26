#!/bin/bash

CONFIG_FILE=".github/issue-type-config.json"
ISSUE_TITLE="$1"

# Function to determine label based on title
determine_label_from_title() {
  local title="$1"
  while IFS= read -r line; do
    prefixes=$(echo "$line" | jq -r '.prefixes[]')
    for prefix in $prefixes; do
      if [[ "$title" == "$prefix"* ]]; then
        echo "$line" | jq -r '.label'
        return 0
      fi
    done
  done < <(jq -c '.types[]' "$CONFIG_FILE")

  jq -r '.defaultType.label' "$CONFIG_FILE"
}

# Determine label based on title
LABEL=$(determine_label_from_title "$ISSUE_TITLE")

# Output result
echo "LABEL=$LABEL" >>$GITHUB_ENV

# Debug output (optional)
echo "Debug: Determined LABEL=$LABEL for title: $ISSUE_TITLE"
