# Changelog

## [2.6] - 2025-06-06
### Fixed
- Targeted seller name extraction to look for h1 with class `PX7EseE2` instead of generic tags
- Improves consistency across seller profile variations

## [2.5] - 2025-06-06
### Fixed
- Improved Business Name detection by scanning DOM label pairs instead of raw text search
- Ensures Business Name is not returned until modal is visibly open
- Added fallback for unclear sellerName match during step 2

## [2.4] - 2025-06-06
### Major
- Implements true phased scraping: product info → seller profile → ⓘ modal
- Uses sessionStorage to preserve state across phases
- Alerts user at each step for smoother experience