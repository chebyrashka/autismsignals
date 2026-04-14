export type CategoryId =
  | 'communication'
  | 'social-energy'
  | 'flexibility'
  | 'sensory'
  | 'focus'
  | 'history';

export type Question = {
  id: string;
  categoryId: CategoryId;
  categoryLabel: string;
  prompt: string;
  detail: string;
};

export const responseOptions = [
  {
    value: 0,
    label: 'Rarely or never',
    caption: 'This hardly fits me.',
  },
  {
    value: 1,
    label: 'Occasionally',
    caption: 'It shows up once in a while.',
  },
  {
    value: 2,
    label: 'Sometimes',
    caption: 'It depends on the situation.',
  },
  {
    value: 3,
    label: 'Often',
    caption: 'This is a common experience for me.',
  },
  {
    value: 4,
    label: 'Very often',
    caption: 'This is strongly true for me.',
  },
] as const;

export const questions: Question[] = [
  {
    id: 'direct-language',
    categoryId: 'communication',
    categoryLabel: 'Communication',
    prompt:
      'I work best when people say exactly what they mean instead of hinting, implying, or expecting me to read between the lines.',
    detail:
      'Indirect expectations, sarcasm, or shifting social rules can take extra effort to decode.',
  },
  {
    id: 'conversation-rhythm',
    categoryId: 'communication',
    categoryLabel: 'Communication',
    prompt:
      'I sometimes need extra effort to judge when to speak, how much detail to give, or what response is expected in conversation.',
    detail:
      'Conversation can feel less automatic than it seems to for other people.',
  },
  {
    id: 'rehearsal',
    categoryId: 'communication',
    categoryLabel: 'Communication',
    prompt:
      'I rehearse conversations in advance or replay them afterward to understand what happened.',
    detail:
      'Planning, reviewing, or scripting can help conversations feel safer or clearer.',
  },
  {
    id: 'social-recovery',
    categoryId: 'social-energy',
    categoryLabel: 'Social energy',
    prompt:
      'Even positive social events can leave me unusually drained and needing recovery time.',
    detail:
      'The effort of processing people, noise, and expectations can add up quickly.',
  },
  {
    id: 'masking',
    categoryId: 'social-energy',
    categoryLabel: 'Social energy',
    prompt:
      'I study, copy, or carefully manage my social behavior so that I seem more natural, polished, or acceptable.',
    detail:
      'Some adults describe this as masking or camouflaging.',
  },
  {
    id: 'out-of-step',
    categoryId: 'social-energy',
    categoryLabel: 'Social energy',
    prompt:
      'I often feel out of step socially, even when I want connection and care about other people.',
    detail:
      'Feeling socially different does not mean lacking empathy or interest.',
  },
  {
    id: 'change-stress',
    categoryId: 'flexibility',
    categoryLabel: 'Flexibility',
    prompt:
      'Unexpected changes to plans, routines, or environments can feel more upsetting than other people expect.',
    detail:
      'Even small changes can create a disproportionate sense of friction or stress.',
  },
  {
    id: 'routine-calming',
    categoryId: 'flexibility',
    categoryLabel: 'Flexibility',
    prompt:
      'Predictable routines, rituals, or familiar systems help me feel steady and in control.',
    detail:
      'Structure can reduce uncertainty and free up mental energy.',
  },
  {
    id: 'task-switching',
    categoryId: 'flexibility',
    categoryLabel: 'Flexibility',
    prompt:
      'Starting, stopping, or switching tasks can take more energy than it seems like it should.',
    detail:
      'Transitions may feel unusually effortful, even when I want to change gears.',
  },
  {
    id: 'sensory-overload',
    categoryId: 'sensory',
    categoryLabel: 'Sensory profile',
    prompt:
      'Noise, lighting, crowds, textures, temperature, or smells can become overwhelming or distracting.',
    detail:
      'Sensory intensity can affect mood, concentration, or how long I can stay in a space.',
  },
  {
    id: 'sensory-avoidance',
    categoryId: 'sensory',
    categoryLabel: 'Sensory profile',
    prompt:
      'I avoid certain clothes, foods, spaces, or situations because of how intense they feel physically.',
    detail:
      'Comfort, texture, and sensory predictability matter a lot in daily life.',
  },
  {
    id: 'self-regulation',
    categoryId: 'sensory',
    categoryLabel: 'Sensory profile',
    prompt:
      'Repetitive movements or small self-soothing habits help me regulate stress, emotion, or focus.',
    detail:
      'This might look like fidgeting, pacing, tapping, squeezing, or another steadying routine.',
  },
  {
    id: 'deep-interests',
    categoryId: 'focus',
    categoryLabel: 'Focus and patterns',
    prompt:
      'I can become deeply absorbed in a topic, hobby, or system for long stretches of time.',
    detail:
      'Focused interests can feel energizing, grounding, and deeply rewarding.',
  },
  {
    id: 'pattern-noticing',
    categoryId: 'focus',
    categoryLabel: 'Focus and patterns',
    prompt:
      'I regularly notice patterns, details, or inconsistencies that other people miss.',
    detail:
      'This can be a strength, especially in technical, creative, or analytical work.',
  },
  {
    id: 'lifelong',
    categoryId: 'history',
    categoryLabel: 'Lifelong pattern',
    prompt:
      'The patterns in these questions feel like they have been part of my life for a long time, not something that only showed up recently during stress or burnout.',
    detail:
      'These kinds of patterns often feel more meaningful when they started earlier in life, even if they became more noticeable later.',
  },
  {
    id: 'childhood-signs',
    categoryId: 'history',
    categoryLabel: 'Lifelong pattern',
    prompt:
      'People who knew me as a child would probably recognize at least some of these traits or sensitivities, even if they were explained differently at the time.',
    detail:
      'Traits may have been masked, misunderstood, or framed as personality rather than neurotype.',
  },
];
