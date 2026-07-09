/**
 * Renders upcoming Google Calendar events into .event-card elements
 * inside #events-grid, matching the existing site markup/styles.
 *
 * SETUP:
 * 1. In Google Calendar settings for the calendar, make it public
 *    ("Access permissions" → "Make available to public").
 * 2. Copy the Calendar ID (Settings → "Integrate calendar" →
 *    looks like abc123@group.calendar.google.com, or your Gmail
 *    address if it's your primary calendar).
 * 3. In Google Cloud Console, enable the "Google Calendar API" and
 *    create an API key (restrict it to the Calendar API + your
 *    site's domain for safety).
 * 4. Fill in CALENDAR_CONFIG below.
 *
 * CONVENTIONS (optional, used to populate the card badge/RSVP link):
 * - Prefix an event title with "#Tag " (e.g. "#Canvass Knock Doors
 *   with Chelsey") to set the badge text. Defaults to "Event".
 * - Put a URL anywhere in the event description to use it as the
 *   RSVP/Sign Up/Get Tickets link. Defaults to the Google Calendar
 *   event page.
 */
 
const CALENDAR_CONFIG = {
  calendarId: 'def2ddc33d373b6f5f5391a009259743a3705145caee8e10b9bcb55c4f56cea5@group.calendar.google.com',
  apiKey: 'AIzaSyDhgoROOC-2KzNOxSOCXeszJxjcmRhKk1I',
  maxResults: 6
};
 
async function loadEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
 
  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_CONFIG.calendarId)}/events` +
    `?key=${CALENDAR_CONFIG.apiKey}` +
    `&timeMin=${encodeURIComponent(timeMin)}` +
    `&singleEvents=true` +
    `&orderBy=startTime` +
    `&maxResults=${CALENDAR_CONFIG.maxResults}`;
 
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);
    const data = await res.json();
    renderEvents(data.items || []);
  } catch (err) {
    console.error('Failed to load events:', err);
    grid.innerHTML = emptyState('Unable to load upcoming events right now.');
  }
}
 
function renderEvents(events) {
  const grid = document.getElementById('events-grid');
 
  if (!events.length) {
    grid.innerHTML = emptyState('No upcoming events scheduled. Check back soon.');
    return;
  }
 
  grid.innerHTML = events.map(eventToCardHtml).join('');
}
 
function eventToCardHtml(event) {
  const isAllDay = !event.start.dateTime;
  const startDate = new Date(event.start.dateTime || event.start.date);
  const endDate = new Date(event.end.dateTime || event.end.date);
 
  const month = startDate.toLocaleDateString('en-US', { month: 'short' });
  const day = startDate.getDate();
 
  const { tag, title } = extractTag(event.summary || 'Untitled Event');
  const timeLabel = isAllDay ? 'All Day' : `${formatTime(startDate)} – ${formatTime(endDate)}`;
  const location = event.location || 'Location TBA';
  const link = extractRsvpLink(event);
  const linkLabel = event.description && /https?:\/\//.test(event.description) ? 'RSVP' : 'View Event';
 
  return `
    <div class="event-card">
      <div class="event-date-row">
        <div class="event-date-box">
          <div class="month">${month}</div>
          <div class="day">${day}</div>
        </div>
        <span class="event-type-badge">${escapeHtml(tag)}</span>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <div class="event-meta">
        <span><strong>${timeLabel}</strong></span>
        <span>${escapeHtml(location)}</span>
      </div>
      <a href="${link}" class="event-link" target="_blank" rel="noopener">${linkLabel} →</a>
    </div>
  `;
}
 
// "#Canvass Knock Doors with Chelsey" -> { tag: "Canvass", title: "Knock Doors with Chelsey" }
function extractTag(summary) {
  const match = summary.match(/^#(\w+)\s+(.*)/);
  return match ? { tag: match[1], title: match[2] } : { tag: 'Event', title: summary };
}
 
function extractRsvpLink(event) {
  const desc = event.description || '';
  const urlMatch = desc.match(/https?:\/\/[^\s<"]+/);
  return urlMatch ? urlMatch[0] : event.htmlLink;
}
 
function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
 
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
 
function emptyState(message) {
  return `<p style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.6);">${message}</p>`;
}
 
document.addEventListener('DOMContentLoaded', loadEvents);