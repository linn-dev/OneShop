export const PUBLIC_MEETUP_PLACES = [
  "the mall food court",
  "the public library lobby",
  "a busy café",
  "the supermarket entrance",
  "the police station parking lot",
] as const;

export type PublicMeetupPlace = (typeof PUBLIC_MEETUP_PLACES)[number];

export function safeMeetupTemplate(place: PublicMeetupPlace = PUBLIC_MEETUP_PLACES[0]): string {
  return `Let's meet at ${place} during the day — it's public and easy to find. Please don't share a home address. You can inspect the item before paying.`;
}