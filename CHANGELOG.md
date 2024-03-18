# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- When checking someone's essa and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference.
- When checking someone's essa chart and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference.
- When checking someone's message count and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference.
- When checking someone's JJJ and replying to a message at the same time will now correctly take mentioned `userId` instead of the `userId` from the reply reference.

### Removed

- Removed ability to check bot's essa (when mentioning the bot it's skipped and we default to the author of essa check)
- Removed ability to check bot's essa chart count (when mentioning the bot it's skipped and we default to the author of essa chart check)
- Removed ability to check bot's jjj (when mentioning the bot it's skipped and we default to the author of jjj check)
- Removed ability to check bot's message count (when mentioning the bot it's skipped and we default to the author of message count check)
