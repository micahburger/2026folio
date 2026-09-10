import type { Project } from "./types";

import messagingList from "../assets/messaging/list.png";
import messagingConversation from "../assets/messaging/conversation.png";
import messagingDetail from "../assets/messaging/detail.png";
import applicantList from "../assets/applicant-experience/applications-list.png";
import applicantChecklist from "../assets/applicant-experience/checklist.png";
import applicantPetForm from "../assets/applicant-experience/pet-form.png";
import assistantWelcome from "../assets/ai-assistant/welcome.png";
import assistantConversation from "../assets/ai-assistant/conversation.png";
import assistantAddressSearch from "../assets/ai-assistant/address-search.png";
import rentspreeLogo from "../assets/workhistory/rentspree.png";
import opendoorLogo from "../assets/workhistory/opendoor.png";
import raytheonLogo from "../assets/workhistory/raytheon.png";
import hudsonRougeLogo from "../assets/workhistory/hudson-rouge.png";
import codeAndTheoryLogo from "../assets/workhistory/code-and-theory.png";
import profilePhoto from "../assets/workhistory/profile.png";

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
    pillTheme: "blue",
    body: [
      "RentSpree connects agents, landlords, and applicants, but the conversation lived in personal texts and email, disconnected from the property and application.",
      "I designed the messaging platform around that missing context: a responsive three-column hub where every conversation is tied to a property, its participants, and application activity. The foundation was built to support future milestones, templates, notifications, and automated workflows without redesigning the core experience.",
    ],
    backgroundColor: "#222222",
    textColor: "#F5F4F1",
    layout: "bleed",
    // Desktop sizes below are exact — given in CSS px at a 2030px-wide
    // reference desktop (source PNGs are exported at 1.5x those numbers),
    // same convention established for Applicant experience.
    media: [
      {
        id: "messaging-list",
        label: "Messages list",
        treatment: "card",
        src: messagingList,
        width: 767,
        height: 820,
        verticalAlign: "bottom",
      },
      {
        id: "messaging-conversation",
        label: "Conversation hub (desktop)",
        treatment: "desktop",
        overflow: true,
        src: messagingConversation,
        width: 880,
        height: 718,
      },
      {
        id: "messaging-detail",
        label: "Messages (mobile)",
        treatment: "phone",
        src: messagingDetail,
        width: 400,
        height: 933,
        // TODO: placeholder inset — sits closer to the text than the other
        // two (edge-flush) examples, per request; refine the exact value.
        edgeInset: 160,
      },
    ],
  },
  {
    id: "applicant-experience",
    slug: "applicant-experience",
    title: "Applicant experience",
    disciplines: ["Mobile UX", "Information architecture", "Content design"],
    headline: "Making a high-friction application feel finishable",
    pillTheme: "green",
    body: [
      "Applying for a rental is long, sensitive, mostly completed on a phone, and ends with a payment. The existing experience felt like one continuous wall of questions with little context about what was left or why information was being requested.",
      "I restructured the application into clear chapters that follow the applicant’s mental model, created natural save and resume points, and rewrote the experience to explain sensitive asks as they happen. The result is a flow designed around confidence and momentum instead of simply getting applicants through more screens.",
    ],
    backgroundColor: "#E3E4D7",
    textColor: "#141414",
    layout: "panel",
    // Desktop sizes below are exact — given in CSS px at a 2030px-wide
    // reference desktop (source PNGs are exported at 1.5x those numbers).
    media: [
      {
        id: "applicant-list",
        label: "Applications list (mobile)",
        treatment: "phone",
        src: applicantList,
        width: 400,
        height: 788,
      },
      {
        id: "applicant-checklist",
        label: "Application checklist",
        treatment: "card",
        src: applicantChecklist,
        width: 620,
        height: 591,
      },
      {
        id: "applicant-pet-form",
        label: "Household details — pets",
        treatment: "card",
        src: applicantPetForm,
        width: 510,
        height: 763,
      },
    ],
  },
  {
    id: "ai-assistant",
    slug: "ai-assistant",
    title: "Rental Assistant",
    disciplines: ["AI product design", "Conversational UX", "Product analytics"],
    headline: "Finding the right role for AI in a complex workflow",
    pillTheme: "blue",
    body: [
      "Screening an applicant or listing a property meant learning RentSpree’s navigation before getting anything done. I designed a conversational layer that lets agents start those jobs directly.",
      "The workflows themselves worked: 79% of people who started creating an ApplyLink finished one, while 514 reviewed conversations produced zero compliance failures. But adoption exposed a more interesting problem. After reviewing all 1,083 sessions, I found that more than half of users disappeared when we asked for a property address.",
      "The next iteration is in the works.",
    ],
    backgroundColor: "#FFFFFF",
    textColor: "#141414",
    layout: "open",
    // Widths given directly in CSS px (not the 1.5x-source convention used
    // for Applicant experience / Messaging); heights follow from each
    // source PNG's own aspect ratio.
    media: [
      {
        id: "assistant-welcome",
        label: "Assistant welcome",
        treatment: "card",
        src: assistantWelcome,
        width: 670,
        height: 522,
      },
      {
        id: "assistant-conversation",
        label: "Assistant conversation",
        treatment: "card",
        src: assistantConversation,
        width: 650,
        height: 679,
      },
      {
        id: "assistant-address-search",
        label: "Assistant address search",
        treatment: "card",
        src: assistantAddressSearch,
        width: 610,
        height: 389,
      },
    ],
  },
  {
    id: "resume",
    slug: "resume",
    title: "Resume",
    backgroundColor: "#FFFFFF",
    textColor: "#141414",
    layout: "resume",
    workHistory: [
      {
        id: "rentspree",
        company: "Rentspree",
        role: "Sr. Staff Product Designer",
        logo: rentspreeLogo,
        dateRange: "Mar 2025 - Present",
        location: "New York, NY",
      },
      {
        id: "opendoor",
        company: "Opendoor",
        role: "Staff Product Designer",
        logo: opendoorLogo,
        dateRange: "Feb 2022 - Dec 2024",
        location: "New York, NY",
      },
      {
        id: "raytheon",
        company: "Raytheon Technologies",
        role: "Product Design Manager",
        logo: raytheonLogo,
        dateRange: "Sept 2018 - Jan 2022",
        location: "Brooklyn, NY",
      },
      {
        id: "hudson-rouge",
        company: "Hudson Rouge",
        role: "Design Director",
        logo: hudsonRougeLogo,
        dateRange: "Apr 2017 - Sept 2018",
        location: "New York, NY",
      },
      {
        id: "code-and-theory",
        company: "Code & Theory",
        role: "Senior Product Designer",
        logo: codeAndTheoryLogo,
        dateRange: "Feb 2013 - Mar 2017",
        location: "NYC, New York",
      },
    ],
    contact: {
      photo: profilePhoto,
      email: "micahmicahdesign@gmail.com",
      linkedin: "https://www.linkedin.com/in/micahburger/",
      store: "https://cornerbodega.pub/",
      storeLabel: "store [taking a break]",
    },
  },
];
