export type Assessment = 'ia' | 'ee';
export type Mode = 'explore' | 'refine';
export type Draft = { assessment: Assessment; mode: Mode; subject: string; level: string; topic: string; resources: string };
export type Direction = { title: string; question: string; approach: string; evidence: string; nextStep: string };
export type Report = { id: string; title: string; createdAt: string; expiresAt: string; directions: Direction[] };
export type Account = { remaining: number; dailyLimit: number };

export const content = {
  ia: {
    label: 'Internal Assessment',
    subjects: ['Biology', 'Chemistry', 'Economics', 'Geography', 'Mathematics AA', 'Mathematics AI', 'Physics'],
    topic: 'e.g. I’m interested in how growing conditions affect plants.',
    resources: 'e.g. I have two weeks, a kitchen scale and space to grow plants at home.',
    benefit: 'See possible methods, materials and data you could collect.',
    sample: [
      { title: 'Salt and seed germination', question: 'How does salt concentration affect the percentage of radish seeds that germinate over seven days?', approach: 'Compare germination across a small set of salt concentrations.', evidence: 'Record germination counts for each group using seeds from the same batch.', nextStep: 'Check whether you can keep light, temperature and water volume consistent.' },
      { title: 'Light and seedling growth', question: 'How does daily light exposure affect radish seedling height over seven days?', approach: 'Compare groups given different durations of light exposure.', evidence: 'Record seedling height at the same time each day.', nextStep: 'Check how you will keep temperature consistent across groups.' },
      { title: 'Water and germination', question: 'How does the amount of water supplied affect radish germination over seven days?', approach: 'Compare germination across controlled water volumes.', evidence: 'Record the number of seeds that germinate in each group.', nextStep: 'Confirm that your containers can hold the same number of seeds.' }
    ]
  },
  ee: {
    label: 'Extended Essay',
    subjects: ['Biology', 'Chemistry', 'Economics', 'English A', 'Geography', 'History', 'Mathematics', 'Physics'],
    topic: 'e.g. I’m interested in decision-making during the Cuban Missile Crisis.',
    resources: 'e.g. I’ve found several declassified US documents and a history book on the crisis.',
    benefit: 'See what sources you’d need and where your evidence might be thin.',
    sample: [
      { title: 'The US naval blockade', question: 'To what extent did the US naval blockade influence the Soviet decision to withdraw missiles from Cuba in 1962?', approach: 'Compare explanations that emphasize the blockade with those that emphasize diplomacy.', evidence: 'Look for evidence of Soviet decisions and historical accounts with different interpretations.', nextStep: 'Check what Soviet records or reliable translations you can access.' },
      { title: 'Back-channel diplomacy', question: 'How significant was back-channel diplomacy in resolving the Cuban Missile Crisis?', approach: 'Compare accounts of private negotiations with public statements from the same period.', evidence: 'Use diplomatic correspondence and historical studies of the negotiations.', nextStep: 'Identify a specific set of exchanges to keep the question manageable.' },
      { title: 'Cuba’s role in the crisis', question: 'How did Cuban leaders respond to the Soviet decision to remove missiles in October 1962?', approach: 'Focus on a brief period and compare official responses with later interpretations.', evidence: 'Look for Cuban statements, diplomatic records and historical commentary.', nextStep: 'Confirm that you can access sources that represent Cuban perspectives.' }
    ]
  }
};
