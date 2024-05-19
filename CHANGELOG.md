# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.0

### Added

- Added `!w ranking` command which displays top 10 users with most messages, if the user who invoked the message is outside of the top 10 it will also display his message count and position in the ranking
- Added public route `/api/v2/public/messages` which returns global message count

### Changed

- Migrated to Supabase
- When checking someone's essa and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference
- When checking someone's essa chart and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference
- When checking someone's message count and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference
- When checking someone's JJJ and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference
- Changed `/api/v2/public/messages` to return today's message count as well

### Fixed

- Fixed github actions to work with bun to automatically build and push image to docker hub

### Removed

- Removed `!ranking` command, moved it to `!essa ranking`
- Removed ability to check bot's essa (when mentioning the bot it's skipped and we default to the author of essa check)
- Removed ability to check bot's essa chart count (when mentioning the bot it's skipped and we default to the author of essa chart check)
- Removed ability to check bot's jjj (when mentioning the bot it's skipped and we default to the author of jjj check)
- Removed ability to check bot's message count (when mentioning the bot it's skipped and we default to the author of message count check)
