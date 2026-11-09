# E-MEDIA 

PROJECT TITLE: Eswatini Media Hub Mobile App

PROJECT OVERVIEW:
Build a cross-platform mobile application (Android + iOS) that aggregates all major media outlets in Eswatini, including TV, radio, and newspapers, into a single clean, modern interface. The app should support live streaming, news browsing, and low-data usage modes.

1. CORE FEATURES

1.1 Media Categories

TV (live streaming support)

Radio (live audio streaming)

Newspapers (webview or in-app articles)

1.2 Media List (Initial Data)

Provide structured JSON-based data:

TV:
- Eswatini TV (stream URL placeholder)
- Channel YemaSwati (stream URL placeholder)

Radio:
- EBIS Siswati (stream URL placeholder)
- EBIS English (stream URL placeholder)

Newspapers:
- Eswatini Observer (website URL)
- Times of Swaziland (website URL)
- Swaziland News (website URL)


2. UI / UX REQUIREMENTS

2.1 Home Screen

Header with:

App name: “SwaziMedia Hub”

Eswatini flag icon

Search icon

Search bar for filtering media

2.2 Slideshow (Top Section)

Auto-scrolling carousel

Displays:

Trending news

Featured media

Includes:

Pagination dots

“View All” button

2.3 Category Sections

Each category displayed as a card:

TV

Radio

Newspapers

Each item should include:

Icon

Name

Action button:

Play (for TV/Radio)

Open (for newspapers)

3. FOOTER NAVIGATION

Bottom navigation bar with 4 tabs:

Home

Favorites

Live

More

4. SETTINGS PANEL (INSIDE "MORE")

4.1 Theme Toggle

Light Mode (default)

Dark Mode

System-based option (optional)

4.2 Data Saver Mode

Toggle ON/OFF

When ON:

Disable autoplay video

Reduce image quality

Stream audio in low bitrate

5. ADDITIONAL FEATURES

5.1 Favorites

Users can save:

TV stations

Radio stations

Newspapers

5.2 Live Indicator

Show red “LIVE” badge for active streams

5.3 Offline Handling

Graceful fallback when no internet

Cache last viewed content

6. TECHNICAL REQUIREMENTS

Recommended Stack:

Frontend: Flutter or React Native

Backend: Firebase / Supabase (for simplicity)

Streaming: HLS (.m3u8) support

State Management: Provider / Redux / Zustand

Performance:

Optimize for low-end Android devices

Fast load times

Minimal data usage

7. DESIGN GUIDELINES

Color palette:

Primary: Deep Blue

Accent: Yellow/Gold (Eswatini flag inspired)

UI Style:

Clean, modern cards

Rounded corners

Soft shadows

Icons:

TV, Radio, Newspaper icons

Responsive layout

8. FUTURE SCALABILITY

Design system should allow:

Adding more African countries

Adding podcasts

Adding user accounts (optional later)

9. DELIVERABLES

Fully functional mobile app

Clean, modular codebase

API-ready structure for media data

Documentation for adding new media sources

GOAL:
Deliver a lightweight, fast, and user-friendly “all-in-one media app” tailored for Eswatini users, with strong offline support and low data consumption. use attached image for ui reference

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://e-media.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/36a2de0d-4f0c-43bf-a9a7-22d49549bff2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitLab and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
