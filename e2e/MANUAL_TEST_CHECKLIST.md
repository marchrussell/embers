# Live Session Manual Test Checklist

Run this before every session or after changes to Daily.co integration, edge functions, or `LiveSessionRoom.tsx`.

---

## Prerequisites

- [ ] Local dev server running (`pnpm dev`)
- [ ] Supabase project accessible (local or staging)
- [ ] Two browsers open: one as **Admin**, one as **Member**
- [ ] Audio/mic available for host testing

---

## 1. Create a Session

As **Admin** (`/admin/live-sessions`):

- [ ] Create a new session (title, description, start/end time, recording off)
- [ ] Click "Create Room" — confirm `daily_room_url` populates in the table
- [ ] Session status shows `scheduled`

---

## 2. Host Private Testing (before going live)

As **Admin**, open the host link (`/live/{id}?role=host`):

- [ ] Pre-join shows "Join to Test Setup" (not "Join Live Session")
- [ ] Info text says session is not live yet and this is a private test
- [ ] Click join — Daily iframe loads
- [ ] Host can unmute mic and enable camera
- [ ] **Participant bar is visible** for host only
- [ ] Leave session — pre-join screen returns

---

## 3. Audience Waiting Room

As **Member**, open `/live/{id}` (session still `scheduled`):

- [ ] Waiting room screen appears: clock icon, "Waiting for the session to begin..."
- [ ] "Return to Studio" button navigates back to `/online`
- [ ] No participant UI visible

---

## 4. Go Live & Auto-Transition

As **Admin** in admin panel:

- [ ] Click **Go Live** — status changes to `live`

As **Member** in waiting room:

- [ ] Within ~5 seconds, page auto-advances to pre-join screen
- [ ] Toast: "Session is starting now!" fires
- [ ] Join button now reads "Join Live Session"

---

## 5. Audience Join

As **Member**, click "Join Live Session":

- [ ] Daily iframe loads
- [ ] Camera and mic are **off** by default
- [ ] **Participant bar is NOT visible** (privacy requirement)
- [ ] Host can see the audience member in their participant list
- [ ] "Open in New Tab" opens Daily room in new tab with the token appended
- [ ] "Leave Session" disconnects and returns to pre-join

---

## 6. Guest Teacher Flow

As **Admin**, generate a guest link for the session:

- [ ] Copy the guest link (`/live/{id}?role=guest&token=…`)
- [ ] Open the link in a private/incognito window (no account needed)

In the guest window:

- [ ] Pre-join shows "You'll join as a guest presenter with video and audio enabled."
- [ ] Click join — camera/mic are **on** by default
- [ ] **Participant bar is NOT visible** (privacy requirement)
- [ ] Host can see the guest in their participant list
- [ ] Guest can see their own video tile

---

## 7. End Session

As **Admin** in admin panel:

- [ ] Click **End**
- [ ] Session status changes to `ended`
- [ ] Audience and guest members receive disconnect from Daily room

---

## 8. Access Control

### Expired Guest Token
- [ ] Generate a guest link, then manually expire it in the DB (`guest_link_expires_at = now() - interval '1 hour'`)
- [ ] Visit the link → click Join → error: "Guest link has expired"

### Non-Member on Members-Only Session
- [ ] Set session `access_level = 'members'`
- [ ] Visit `/live/{id}` as a logged-out user
- [ ] Click Join → error about membership displayed

### Invalid Session
- [ ] Visit `/live/00000000-0000-0000-0000-000000000000`
- [ ] "Session not found" error screen shown

---

## Notes

- Cloud recording: if `recording_enabled = true`, verify a recording starts in the Daily dashboard after the session ends
- The participant count is never shown to guests or audience — verify this in the Daily iframe (no participant count badge visible)
