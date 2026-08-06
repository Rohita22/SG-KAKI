import type { CultureTopic } from '@/content/types';

// BACKLOG (not authored this pass — pure data, add anytime by appending here and
// linking a `cultureTopicIds` entry on whichever lesson/mission should unlock them):
// National Day, Chinese New Year etiquette, Hari Raya basics, Deepavali basics,
// shoes inside homes, void decks, wet markets, weather & umbrella culture,
// Singlish vs. Standard English (deeper dive beyond `singlish-code-switching`),
// multicultural awareness.

export const cultureTopics: CultureTopic[] = [
  {
    id: 'hawker-etiquette',
    title: 'Hawker Etiquette',
    icon: '🍜',
    category: 'food',
    summary: 'Self-service, shared tables, and how a hawker centre actually works.',
    explanation:
      "A hawker centre isn't a restaurant with table service — you find (or chope) your own table, then walk to individual stalls to order and pay. It's completely normal to share a large table with strangers, especially at busy hours. Singapore's hawker culture is recognised by UNESCO as intangible cultural heritage: it's a genuine cross-section of daily life, not a tourist novelty.",
    examples: [
      'Find a table first, then split up to order from different stalls.',
      "Sharing a table with strangers at a busy hawker centre is completely normal.",
      'Some stalls are cash-only — small change helps.',
    ],
    aiPrompts: [
      'Is it rude to sit at a table with strangers?',
      'How do I know which stall to queue at first?',
      'Do I need to tip?',
    ],
    missionId: 'eat',
  },
  {
    id: 'chope',
    title: 'Chope (Reserving Seats)',
    icon: '🧻',
    category: 'food',
    summary: "Why a packet of tissues on an empty table means 'taken', not 'free'.",
    explanation:
      "Choping is the widely accepted practice of reserving a seat by leaving a small personal item — a tissue packet, umbrella, or even a name card — on the table before you queue to order. It isn't rudeness or queue-jumping; it's an honesty system almost everyone follows and respects. The word itself comes from the Hokkien for \"seal\" or \"stamp\" — you're literally stamping your claim. It works because everyone silently agrees to the same rule.",
    examples: [
      'A tissue packet on a table means it is reserved — find another seat.',
      'You can chope a seat and then queue at a stall without anyone taking it.',
      "It's considered bad form to move someone's choping item and sit there.",
    ],
    aiPrompts: [
      'Why tissues specifically?',
      'Can I use my bag instead?',
      'Is this rude to people who don\'t know the custom?',
      'Does this happen everywhere in Singapore?',
    ],
    missionId: 'eat',
  },
  {
    id: 'kopi-ordering',
    title: 'Kopi Ordering Code',
    icon: '☕',
    category: 'food',
    summary: 'A compact vocabulary that lets you order almost any coffee/tea combination.',
    explanation:
      "Kopitiam (coffeeshop) drink orders follow a small, learnable code: the base word (kopi = coffee, teh = tea), then a modifier for milk and sugar, then a modifier for temperature. Once you know the pattern, you can decode almost any variation a menu board throws at you — locals treat cracking the code as a genuine rite of passage.",
    examples: [
      'Kopi = coffee with condensed milk. Kopi O = black coffee with sugar. Kopi C = coffee with evaporated milk.',
      'Kosong means no sugar — "kopi O kosong" is black coffee, no sugar at all.',
      '"Siew dai" = less sweet. "Gah dai" = more sugar. "Gao" = extra strong (more powder).',
      'Peng added to any order makes it iced: "teh peng" = iced tea.',
      'Feeling adventurous? A "Milo Dinosaur" is iced Milo topped with a mountain of extra Milo powder.',
    ],
    aiPrompts: [
      "What's the difference between kopi and kopi-C?",
      'How do I order it less sweet?',
      'Can I ask for oat milk?',
      'What on earth is a Milo Dinosaur?',
    ],
    missionId: 'eat',
  },
  {
    id: 'tray-return',
    title: 'Tray Return',
    icon: '🍽️',
    category: 'food',
    summary: 'Clearing your own tray is expected — and in many hawker centres, required by law.',
    explanation:
      "After eating at a hawker centre, you're expected to return your own tray and dishes to a designated tray-return point, not leave them on the table. In many hawker centres this isn't just etiquette — it's an actual regulation, with signage and occasional enforcement. It's a small habit that keeps a high-traffic shared space usable for everyone.",
    examples: [
      'Look for a tray-return point near the exit or along the walls.',
      'Some tables have shelves below them for used trays instead.',
    ],
    aiPrompts: [
      'Is tray return really required by law?',
      'What if there\'s no tray-return point nearby?',
      'Do cleaners mind if I leave it?',
    ],
    missionId: 'eat',
  },
  {
    id: 'mrt-etiquette',
    title: 'MRT Etiquette',
    icon: '🚇',
    category: 'gettingAround',
    summary: 'Let people off first, move in, and mind the priority seats.',
    explanation:
      "Riding the MRT smoothly comes down to a few habits everyone reinforces: let alighting passengers exit before you board, move toward the centre of the carriage to make room, and offer priority seats to elderly, pregnant, or less mobile passengers without being asked. None of it is enforced by staff — it holds together because almost everyone quietly follows it.",
    examples: [
      'Stand aside as doors open so people can get off first — commuters naturally form two lines flanking the doors.',
      'Move away from the doors once inside, to let more people board.',
      'Offer a priority seat to someone who visibly needs it more.',
      'Eating or drinking anywhere in the paid area is fineable — up to $500 — so it\'s taken seriously, not just frowned upon.',
    ],
    aiPrompts: [
      'What if no one offers their seat and I need one?',
      'Is it rude to eat or drink on the MRT?',
      'How strict is the "no durian" rule really?',
      'Is the $500 fine for eating actually enforced?',
    ],
    missionId: 'move',
  },
  {
    id: 'escalator-etiquette',
    title: 'Escalator Etiquette',
    icon: '🛗',
    category: 'gettingAround',
    summary: 'Stand left, walk right — one of the most consistently followed unwritten rules.',
    explanation:
      "Stand on the left side of an escalator, and leave the right side clear for people who want to walk up or down. It's not official policy everywhere, but it's so consistently followed in Singapore that standing on the right (especially during peak hours) will get you pointedly stepped around.",
    examples: [
      'Stand left if you\'re not walking.',
      'Keep the right lane clear, especially near MRT stations at rush hour.',
    ],
    aiPrompts: [
      'Is this rule official or just custom?',
      'What if I\'m standing with luggage or kids?',
    ],
    missionId: 'move',
  },
  {
    id: 'public-transport-bus',
    title: 'Bus Culture',
    icon: '🚌',
    category: 'gettingAround',
    summary: 'Same tap-in/tap-out system as the MRT, but fares are distance-based, so both taps matter.',
    explanation:
      "Buses use the same contactless tap system as the MRT, but because bus fares are calculated by distance, you must tap out when you alight — not just tap in when boarding. Press the bell ahead of your stop, and move toward the back if the bus is filling up so more people can board.",
    examples: [
      'Tap in when you board, tap out when you alight.',
      'Press the bell a stop or two before you need to get off.',
      'Move down the bus to free up space near the doors.',
    ],
    aiPrompts: [
      'What happens if I forget to tap out?',
      'How do I know which bus stop is mine?',
    ],
    missionId: 'move',
  },
  {
    id: 'peak-hour-crowds',
    title: 'Peak Hour Crowds',
    icon: '⏰',
    category: 'gettingAround',
    summary: "Weekday mornings and evenings are genuinely packed — plan around it if you can.",
    explanation:
      "Peak hour (roughly 7:30-9:30am and 5:30-7:30pm on weekdays) means noticeably fuller trains and buses. It's not dangerous or unusual — just tighter. Locals build in a little patience and, when possible, flexibility in departure time to dodge the worst of it.",
    examples: [
      'Trains during peak hour can be standing-room only for several stops.',
      'Shifting a commute by even 20-30 minutes can make a real difference.',
    ],
    aiPrompts: [
      'Is it safe to ride during peak hour?',
      'Are there less crowded alternatives?',
    ],
    missionId: 'move',
  },
  {
    id: 'queue-etiquette',
    title: 'Queue Etiquette',
    icon: '🧍',
    category: 'socialVibes',
    summary: 'Queueing is taken seriously here, marked or not.',
    explanation:
      "Singaporeans queue for almost everything — food stalls, lifts, buses, popular store openings — and take it seriously even without ropes, signs, or staff enforcing it. Cutting a queue, even accidentally, is one of the more reliably irritating things you can do — expect disapproving looks, or even a polite-but-firm correction from a stranger. When in doubt, a quick 'is this the queue?' avoids any awkwardness.",
    examples: [
      'A loose cluster of people near a counter is often still a queue — ask if unsure.',
      'Kiasu-driven queueing (for freebies, new store openings) is a common, self-aware local joke.',
    ],
    aiPrompts: [
      'How do I politely ask if something is a queue?',
      'What if someone cuts the queue?',
    ],
    missionId: 'vibe',
  },
  {
    id: 'shared-spaces',
    title: 'Shared Spaces & Personal Space',
    icon: '🤝',
    category: 'socialVibes',
    summary: 'Dense city living means shared tables, close seating, and small negotiated courtesies.',
    explanation:
      "Singapore is dense, so shared spaces — hawker tables, train seats, queues — come with small, expected courtesies: a polite word to ask someone to shift a bag, a nod when sharing a table, offering a seat when it's clearly needed. None of this requires deep conversation; a brief, friendly exchange is the norm and is always well received.",
    examples: [
      '"Excuse me, can I sit?" is a completely normal, low-friction way to ask.',
      'Sharing a hawker table with strangers doesn\'t obligate conversation.',
      'Enthusiastic hugging isn\'t the default greeting for acquaintances — a handshake or a nod reads warmer here than it might feel to you at first.',
    ],
    aiPrompts: [
      'Is it awkward to ask a stranger to move their bag?',
      'Do I have to make small talk if I share a table?',
      'Is it rude if I don\'t hug someone I just met?',
    ],
    missionId: 'vibe',
  },
  {
    id: 'fines-and-public-rules',
    title: 'Fines & Public Rules',
    icon: '🚯',
    category: 'socialVibes',
    summary: 'Singapore is famously strict about small public behaviours — and that\'s exactly why it stays so clean.',
    explanation:
      "Singapore is sometimes only half-jokingly called a \"fine city\" — littering, jaywalking, spitting, and eating/drinking on the MRT are all genuinely fineable, not just frowned upon. It can feel strict at first, but it's a big part of why public spaces stay so clean and orderly with almost no visible enforcement standing around. Most locals don't think about these rules day to day — they've simply become habits.",
    examples: [
      'Littering can carry a fine (and, for repeat offenders, a public "Corrective Work Order").',
      'Jaywalking near a marked crossing is an offence, even if the road looks empty.',
      'Chewing gum can\'t be commercially sold in Singapore (though bringing a small personal supply in is fine).',
    ],
    aiPrompts: [
      'Are these rules actually enforced or just on paper?',
      'What happens if I accidentally jaywalk?',
      'Why is Singapore so strict about this compared to other cities?',
    ],
    missionId: 'vibe',
  },
  {
    id: 'safe-topics',
    title: 'Small Talk: What to Skip',
    icon: '🙊',
    category: 'socialVibes',
    summary: "Race, religion, and politics are the three topics locals themselves tend to steer around in casual chat.",
    explanation:
      "Singapore is genuinely multi-ethnic and multi-religious — Chinese, Malay, Indian, and other communities living side by side, each with their own faiths. Precisely because of that, race, religion, and politics are treated as poor small-talk material by default, even among friends. It's not a taboo enforced by law in daily conversation, more a shared social reflex: those topics can turn a light chat serious fast, so most people just don't reach for them with someone they don't know well.",
    examples: [
      'Safe defaults: food, weather, weekend plans, where to travel next.',
      "If a local brings up race or religion themselves, it's fine to engage — just don't be the one to open with it.",
      'A joke that leans on ethnic stereotypes lands very differently here than it might elsewhere — best avoided entirely.',
    ],
    aiPrompts: [
      'Is it ever okay to ask about someone\'s religion?',
      'What do I do if a conversation heads there by accident?',
    ],
    missionId: 'vibe',
  },
  {
    id: 'religious-etiquette',
    title: 'Visiting Temples & Mosques',
    icon: '🛕',
    category: 'socialVibes',
    summary: "Dress modestly, remove your shoes where asked, and check before you raise a camera.",
    explanation:
      "Singapore's temples, mosques, and churches are active places of worship, not museums — and they're everywhere, often blocks apart from each other. The baseline expectations are consistent across most of them: cover your shoulders and knees, take your shoes off before stepping onto carpeted or raised prayer areas, and keep your voice down. Photography is usually fine in open courtyards but not always inside the prayer hall itself — a quick glance for a sign, or a quick ask, settles it.",
    examples: [
      'A light scarf or shawl in your bag covers you if you end up somewhere unplanned.',
      'Shoes come off at the entrance of most mosques and many temples — look for a shoe rack.',
      "If in doubt about photos, ask a staff member rather than assuming.",
    ],
    aiPrompts: [
      'What should I wear if I\'m visiting a mosque?',
      'Is it rude to take photos inside a temple?',
    ],
    missionId: 'vibe',
  },
  {
    id: 'singlish-code-switching',
    title: 'Singlish, Not "Broken English"',
    icon: '🗣️',
    category: 'lingo',
    summary: 'Locals fluidly switch between Singlish and standard English depending on context.',
    explanation:
      "Singlish blends English with Malay, Hokkien, Tamil, and other local languages — it's a distinct way of speaking with its own consistent grammar and vocabulary, not a mistake or a simplified version of English. Think of it as a compact, shared shorthand: a little abbreviation secret code that gets the point across fast, built by generations of Singaporeans switching between languages in the same sentence. Most Singaporeans code-switch fluidly: casual Singlish with friends, more standard English in a formal meeting or with a foreign client. Both are 'correct' for their setting.",
    examples: [
      'The same person might say "can lah" to a friend and "certainly, I can do that" to a client.',
      'A single conversation might casually drop in "sian" (bored), "swee" (beautiful), "atas" (posh), and "siao" (crazy) without anyone blinking.',
      'Understanding Singlish when you hear it will get you further than trying to speak it perfectly yourself.',
    ],
    aiPrompts: [
      'Will locals think I\'m mocking them if I try to use Singlish?',
      'When should I switch to more standard English?',
    ],
    missionId: 'speak',
  },
  {
    id: 'punctuality',
    title: 'Punctuality at Work',
    icon: '⏱️',
    category: 'workCulture',
    summary: "'On time' generally means on time — arriving late to a meeting reads as unprofessional.",
    explanation:
      "Singapore workplaces generally treat scheduled start times as firm — arriving on time, or a couple of minutes early, is the baseline expectation for meetings and work commitments. This can vary by industry and team, but as a newcomer, defaulting to punctuality is always the safe choice. It's less about the clock and more about what it signals: showing up on time is read as a basic sign that you take the commitment, and the people waiting on you, seriously.",
    examples: [
      'A 9am meeting is expected to start at 9am, not 9:15.',
      "If you're running late, a quick heads-up message is appreciated.",
      'Being consistently on time is read as a basic signal of reliability, not just politeness.',
    ],
    aiPrompts: [
      'Is a couple of minutes late ever okay?',
      'How do I politely flag that I\'ll be a bit late?',
    ],
    missionId: 'work',
  },
  {
    id: 'lunch-culture',
    title: 'Lunch Culture',
    icon: '🥡',
    category: 'workCulture',
    summary: 'Team hawker-centre lunches are a low-pressure way to build relationships at work.',
    explanation:
      "Lunch, especially a group hawker centre run, is one of the easiest and most common ways colleagues build rapport in Singapore workplaces — often more relaxed than office small talk. Joining when you can (without feeling obligated every single day) is a good way to settle into a new team.",
    examples: [
      'A colleague saying "jio you for lunch" is a genuine, casual invitation.',
      'It\'s fine to occasionally decline — it\'s not a big deal either way.',
    ],
    aiPrompts: [
      'How do I politely decline a lunch invite sometimes?',
      'Who usually pays?',
    ],
    missionId: 'work',
  },
  {
    id: 'workplace-hierarchy',
    title: 'Workplace Hierarchy',
    icon: '🏢',
    category: 'workCulture',
    summary: 'Many Singapore workplaces are hierarchical, multicultural, and channel-conscious.',
    explanation:
      "Singapore offices typically follow a hierarchical structure where seniority is respected and decisions often flow top-down — going over a manager's head, even with good intentions, can land badly. Communication tends to be professional and practical, though the emphasis on group harmony means it can be more indirect than you're used to, especially when something's going wrong. It's also a genuinely multicultural workforce — a single team meeting might code-switch between English, Mandarin, Malay, and Tamil without anyone thinking twice about it.",
    examples: [
      'Raise disagreements through the proper channel — usually your direct manager first, not skipping straight to leadership.',
      'A "no" is often delivered softly ("let me check and get back to you") rather than bluntly.',
      'Formal emails are expected to be precise and well-structured, even in an otherwise casual office.',
    ],
    aiPrompts: [
      'How do I disagree with my manager respectfully?',
      'Is it rude to ask a colleague to clarify something twice?',
      'How formal should my work emails be?',
    ],
    missionId: 'work',
  },
];
