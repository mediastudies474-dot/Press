# Architecture rules
- Global news is fetched through an authenticated Cloud function with a shared database cache, keeping provider credentials private and usage bounded.
- Global News has a dedicated navigation view; provider headlines are never labelled as live video streams.