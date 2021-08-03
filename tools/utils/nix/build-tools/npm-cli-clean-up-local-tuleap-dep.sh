#!/usr/bin/env bash

set -euo pipefail

npm "$@"

if [[ "$1" =~ ^(install|i|in|ins|inst|insta|instal|isnt|isnta|isntal|add)$ ]] || [[ "$1" =~ ^(update|up|upgrade|udpate)$ ]]; then
    php "$(dirname "$(readlink -f "$0")")"/clean-lockfile-from-local-tuleap-dep.php "$(pwd)"
fi