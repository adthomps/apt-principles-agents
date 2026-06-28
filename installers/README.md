---
title: APT Installers
kind: installer-guide
status: active
owner: APT
last_updated: 2026-06-27
source: APT consolidation
---

# Installers

Both installers accept target and manifest plus dry-run and force flags. Asset installation writes under **.apt/**; platform installation maps content to tool-native locations. Existing files are skipped unless forced; forced replacements are backed up under **.apt-backups/&lt;timestamp&gt;/**.
