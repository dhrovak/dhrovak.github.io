export interface ContactLink {
  label: string;
  href: string;
  text: string;
}

export interface Role {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  points: string[];
}

export const site = {
  name: "Dhruv Bhat",
  tagline: "Minimal on the front, Complex in the back",
  description:
    "Dhruv Bhat — developer building AI/ML tooling. Experience, open-source projects, skills and contact.",
  url: "https://dhrovak.github.io",
  githubUser: "dhrovak",
  jobTitle: "Developer",
  email: "dhruvmohanbhat@gmail.com",
  contacts: [
    { label: "Email", href: "mailto:dhruvmohanbhat@gmail.com", text: "dhruvmohanbhat@gmail.com" },
    { label: "GitHub", href: "https://github.com/dhrovak", text: "github.com/dhrovak" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dhruvbhat03/", text: "in/dhruvbhat03" },
    { label: "X", href: "https://x.com/dhrovak", text: "@dhrovak" },
  ] satisfies ContactLink[],
  experience: [
    {
      title: "Developer L1",
      company: "Wipro Limited",
      location: "Bengaluru, KA",
      start: "Aug 2025",
      end: "Present",
      points: [
        "Presently working for Ford Motor Company client under AI/ML domain.",
        "Developing a Log Analyzer tool using LangChain’s DeepAgents Harness.",
        "Previously developed a self-healing regression tool for testers using Qwen embeddings and Ford’s internally trained private models.",
        "Previously automated various Python scripts for applications in Ford’s infotainment systems mainly Digital Owner’s Manual and Alexa.",
      ],
    },
  ] satisfies Role[],
};
