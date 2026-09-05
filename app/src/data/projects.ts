import type { Project } from "./types";

import messagingList from "../assets/messaging/list.png";
import messagingConversation from "../assets/messaging/conversation.png";
import messagingDetail from "../assets/messaging/detail.png";
import applicantChecklist from "../assets/applicant-experience/checklist.png";
import applicantList from "../assets/applicant-experience/list.png";
import assistantConversation from "../assets/ai-assistant/conversation.png";
import assistantSuggestions from "../assets/ai-assistant/suggestions.png";

/**
 * Panel colors are eyeballed from the shared design screenshots, not exact
 * hex values from Figma — swap for real tokens once available.
 *
 * The third example for Applicant Experience and AI Assistant has no real
 * asset yet: the "3.png" provided for both looked like it belongs to a
 * different product (a meeting-notes / video-call screen, not RentSpree) —
 * left as a placeholder rather than shipping a mismatched image.
 */
export const projects: Project[] = [
  {
    id: "messaging",
    slug: "messaging",
    title: "Messaging",
    disciplines: ["Platform design", "Responsive systems", "Cross-product architecture"],
    headline: "Turning messaging into part of the rental workflow",
    body: [
      "RentSpree connects agents, landlords, and applicants, but the conversation lived in personal texts and email, disconnected from the property and application.",
      "I designed the messaging platform around that missing context: a responsive three-column hub where every conversation is tied to a property, its participants, and application activity. The foundation was built to support future milestones, templates, notifications, and automated workflows without redesigning the core experience.",
    ],
    backgroundColor: "#FFFFFF",
    textColor: "#141414",
    layout: "bleed",
    media: [
      {
        id: "messaging-list",
        label: "Messages list",
        treatment: "card",
        src: messagingList,
      },
      {
        id: "messaging-conversation",
        label: "Conversation hub (desktop)",
        treatment: "desktop",
        overflow: true,
        src: messagingConversation,
      },
      {
        id: "messaging-detail",
        label: "Messages (mobile)",
        treatment: "phone",
        src: messagingDetail,
      },
    ],
  },
  {
    id: "applicant-experience",
    slug: "applicant-experience",
    title: "Applicant experience",
    disciplines: ["Mobile UX", "Information architecture", "Content design"],
    headline: "Making a high-friction application feel finishable",
    body: [
      "Applying for a rental is long, sensitive, mostly completed on a phone, and ends with a payment. The existing experience felt like one continuous wall of questions with little context about what was left or why information was being requested.",
      "I restructured the application into clear chapters that follow the applicant’s mental model, created natural save and resume points, and rewrote the experience to explain sensitive asks as they happen. The result is a flow designed around confidence and momentum instead of simply getting applicants through more screens.",
    ],
    backgroundColor: "#ACAF56",
    textColor: "#141414",
    layout: "panel",
    media: [
      {
        id: "applicant-checklist",
        label: "Application checklist",
        treatment: "card",
        backgroundColor: "#E67E4D",
        textColor: "#141414",
        src: applicantChecklist,
      },
      {
        id: "applicant-list",
        label: "Applications list (mobile)",
        treatment: "phone",
        backgroundColor: "#ACAF56",
        textColor: "#141414",
        src: applicantList,
      },
      {
        id: "applicant-review",
        label: "Review summary — pending real asset",
        treatment: "desktop",
        backgroundColor: "#ACAF56",
        textColor: "#141414",
      },
    ],
  },
  {
    id: "ai-assistant",
    slug: "ai-assistant",
    title: "AI Assistant",
    titleLines: ["AI", "Assistant"],
    disciplines: ["AI product design", "Conversational UX", "Product analytics"],
    headline: "Finding the right role for AI in a complex workflow",
    body: [
      "Screening an applicant or listing a property meant learning RentSpree’s navigation before getting anything done. I designed a conversational layer that lets agents start those jobs directly.",
      "The workflows themselves worked: 79% of people who started creating an ApplyLink finished one, while 514 reviewed conversations produced zero compliance failures. But adoption exposed a more interesting problem. After reviewing all 1,083 sessions, I found that more than half of users disappeared when we asked for a property address.",
      "The next iteration starts there.",
    ],
    backgroundColor: "#F2E9DA",
    textColor: "#141414",
    layout: "open",
    media: [
      {
        id: "assistant-conversation",
        label: "Assistant conversation (mobile)",
        treatment: "phone",
        src: assistantConversation,
      },
      {
        id: "assistant-suggestions",
        label: "Assistant suggestions",
        treatment: "card",
        src: assistantSuggestions,
      },
      {
        id: "assistant-panel",
        label: "Assistant panel — pending real asset",
        treatment: "desktop",
      },
    ],
  },
];
