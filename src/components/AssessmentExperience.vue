<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { questions, responseOptions } from '../data/questions';

type ScoreBand = {
  title: string;
  eyebrow: string;
  description: string;
  emphasis: string;
};

type CategoryProgress = {
  id: string;
  label: string;
  count: number;
  answered: number;
  score: number;
  max: number;
  strength: number;
};

const storageKey = 'autism-signals-progress-v1';
const maxScore = questions.length * 4;

const bands: Array<{ min: number; band: ScoreBand }> = [
  {
    min: 0,
    band: {
      eyebrow: 'Lower alignment',
      title: 'Few traits surfaced in this check-in',
      description:
        "This reflection did not surface many of the traits it looks for today. That still is not proof either way, because lived experience can be more nuanced than a short questionnaire.",
      emphasis:
        'If a specific area still feels important, trust that signal and explore it further instead of dismissing yourself.',
    },
  },
  {
    min: 20,
    band: {
      eyebrow: 'Mixed pattern',
      title: 'Some autistic traits surfaced',
      description:
        'Several responses lined up with traits that many autistic adults describe, but the overall pattern is mixed. Context, masking, burnout, and overlap with other experiences all matter here.',
      emphasis:
        'Keep the parts that felt uncannily familiar. Those details are usually more helpful than the score alone.',
    },
  },
  {
    min: 36,
    band: {
      eyebrow: 'Notable pattern',
      title: 'A meaningful spectrum-like pattern surfaced',
      description:
        'Many of your answers lined up with themes commonly described in autistic adults and autism-focused writing. This is still an informal, non-validated result meant for reflection only.',
      emphasis:
        'If masking, sensory overload, or lifelong differences stood out strongly, those are useful themes to keep noticing and journaling.',
    },
  },
  {
    min: 50,
    band: {
      eyebrow: 'Strong pattern',
      title: 'A strong pattern surfaced',
      description:
        'Your responses showed a strong concentration of themes often discussed by autistic adults and autism educators. This is still not a validated or official screen, but it may highlight themes worth exploring thoughtfully.',
      emphasis:
        'A good next step is usually reading more, reflecting on patterns over time, and noticing what kinds of support or accommodations help.',
    },
  },
];

const answers = ref<Array<number | null>>(questions.map(() => null));
const currentIndex = ref(0);
const stage = ref<'quiz' | 'results'>('quiz');
const reflectionNotes = ref('');
const copied = ref(false);

const currentQuestion = computed(() => questions[currentIndex.value]);
const currentAnswer = computed(() => answers.value[currentIndex.value]);
const answeredCount = computed(() => answers.value.filter((value) => value !== null).length);
const percentComplete = computed(() =>
  Math.round((answeredCount.value / questions.length) * 100),
);

const score = computed(() =>
  answers.value.reduce((total, value) => total + (value ?? 0), 0),
);

const scorePercent = computed(() => Math.round((score.value / maxScore) * 100));

const categoryProgress = computed<CategoryProgress[]>(() => {
  const byCategory = new Map<string, CategoryProgress>();

  questions.forEach((question, index) => {
    const current = byCategory.get(question.categoryId) ?? {
      id: question.categoryId,
      label: question.categoryLabel,
      count: 0,
      answered: 0,
      score: 0,
      max: 0,
      strength: 0,
    };

    current.count += 1;
    current.max += 4;

    if (answers.value[index] !== null) {
      current.answered += 1;
      current.score += answers.value[index] ?? 0;
    }

    current.strength = current.max === 0 ? 0 : current.score / current.max;
    byCategory.set(question.categoryId, current);
  });

  return [...byCategory.values()];
});

const topCategories = computed(() =>
  [...categoryProgress.value]
    .sort((left, right) => right.strength - left.strength)
    .slice(0, 3),
);

const highSignalItems = computed(() =>
  questions
    .map((question, index) => ({
      prompt: question.prompt,
      categoryLabel: question.categoryLabel,
      value: answers.value[index] ?? 0,
    }))
    .filter((item) => item.value >= 3)
    .sort((left, right) => right.value - left.value)
    .slice(0, 5),
);

const band = computed<ScoreBand>(() => {
  let current = bands[0].band;

  for (const entry of bands) {
    if (score.value >= entry.min) {
      current = entry.band;
    }
  }

  return current;
});

const historyStrength = computed(() => {
  const historyCategory = categoryProgress.value.find((item) => item.id === 'history');
  return historyCategory?.strength ?? 0;
});

const nextSteps = computed(() => {
  if (score.value >= 50) {
    return [
      'Save the themes that felt most accurate and notice when they show up in daily life.',
      'Read a few trusted adult-autism resources and compare your experience with care, especially around masking, sensory profile, and routine.',
      'Notice which supports, boundaries, routines, or accommodations seem to make life easier.',
    ];
  }

  if (score.value >= 36) {
    return [
      'Read a few trusted adult-autism resources and notice which descriptions feel precise versus generic.',
      'Keep a short log of social fatigue, sensory overload, need for routine, and communication patterns for a week or two.',
      'Talk the themes through with someone you trust if that helps you process what is resonating.',
    ];
  }

  if (score.value >= 20) {
    return [
      'Keep the questions that resonated most strongly and ignore the ones that did not. That pattern is often more useful than the total score.',
      'Compare your experience with trusted descriptions of adult autism, especially around masking and sensory profile.',
      'If you are still unsure, compare the themes with trusted resources instead of treating repeated online tests as definitive.',
    ];
  }

  return [
    'Treat this as one data point, not a verdict. Short tools can miss nuance, especially when people have learned to adapt.',
    'If a small number of questions felt deeply familiar, explore those areas further before ruling anything out.',
    'If your main difficulties are recent or tied to burnout, trauma, anxiety, or attention issues, give yourself room to explore those possibilities too.',
  ];
});

const summaryText = computed(() => {
  const categoryLines = topCategories.value
    .map((item) => `${item.label}: ${Math.round(item.strength * 100)}%`)
    .join('\n');

  const signalLines = highSignalItems.value.length
    ? highSignalItems.value
        .map((item) => `- ${item.prompt}`)
        .join('\n')
    : '- No single item was endorsed at the highest levels.';

  const historyLine =
    historyStrength.value < 0.45
      ? 'Note: long-standing patterns usually matter more in this kind of reflection than short-term stress alone.'
      : 'Note: your answers suggest these experiences may be long-standing, which can be helpful context for personal understanding.';

  return [
    'Autism Signals reflection summary',
    `Score: ${scorePercent.value}% (${score.value} / ${maxScore})`,
    `Result: ${band.value.title}`,
    '',
    'Top categories',
    categoryLines,
    '',
    'Strongly endorsed prompts',
    signalLines,
    '',
    historyLine,
    '',
    reflectionNotes.value ? `My notes:\n${reflectionNotes.value}` : 'My notes:\nNone added.',
    '',
    'Reminder: this is an informational, non-validated self-check, not a diagnosis or official screen.',
  ].join('\n');
});

function setAnswer(value: number) {
  answers.value[currentIndex.value] = value;
}

function goBack() {
  if (stage.value === 'results') {
    stage.value = 'quiz';
    currentIndex.value = questions.length - 1;
    return;
  }

  currentIndex.value = Math.max(0, currentIndex.value - 1);
}

function continueForward() {
  if (currentAnswer.value === null) {
    return;
  }

  if (currentIndex.value === questions.length - 1) {
    stage.value = 'results';
    return;
  }

  currentIndex.value += 1;
}

function reviewAnswers() {
  stage.value = 'quiz';
  const firstUnanswered = answers.value.findIndex((value) => value === null);
  currentIndex.value = firstUnanswered === -1 ? 0 : firstUnanswered;
}

function resetAll() {
  answers.value = questions.map(() => null);
  currentIndex.value = 0;
  stage.value = 'quiz';
  reflectionNotes.value = '';
  copied.value = false;
  localStorage.removeItem(storageKey);
}

async function copySummary() {
  await navigator.clipboard.writeText(summaryText.value);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2200);
}

onMounted(() => {
  const raw = localStorage.getItem(storageKey);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as {
      answers?: Array<number | null>;
      currentIndex?: number;
      notes?: string;
      stage?: 'quiz' | 'results';
    };

    if (parsed.answers?.length === questions.length) {
      answers.value = parsed.answers.map((value) =>
        typeof value === 'number' && value >= 0 && value <= 4 ? value : null,
      );
    }

    if (typeof parsed.currentIndex === 'number') {
      currentIndex.value = Math.min(Math.max(parsed.currentIndex, 0), questions.length - 1);
    }

    if (typeof parsed.notes === 'string') {
      reflectionNotes.value = parsed.notes;
    }

    if (parsed.stage === 'results' && answeredCount.value === questions.length) {
      stage.value = 'results';
    }
  } catch {
    localStorage.removeItem(storageKey);
  }
});

watch(
  [answers, currentIndex, reflectionNotes, stage],
  () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers: answers.value,
        currentIndex: currentIndex.value,
        notes: reflectionNotes.value,
        stage: stage.value,
      }),
    );
  },
  { deep: true },
);
</script>

<template>
  <section class="assessment-frame" id="assessment">
    <aside class="assessment-sidebar">
      <p class="sidebar-kicker">Guided self-check</p>
      <h2>Private, paced, and built for adult nuance.</h2>
      <p class="sidebar-copy">
        This tool uses current autism spectrum language. If you searched for
        Asperger&apos;s, that diagnosis is now generally folded into autism spectrum
        disorder, though some people still use the older term for identity or context.
        It is an informal, non-validated self-check rather than an official screen.
      </p>

      <div class="sidebar-stat">
        <span>Completion</span>
        <strong>{{ percentComplete }}%</strong>
      </div>
      <div class="progress-track" aria-hidden="true">
        <span :style="{ width: `${percentComplete}%` }" />
      </div>

      <div class="sidebar-meta">
        <span>{{ answeredCount }} of {{ questions.length }} answered</span>
        <span>About 4 minutes</span>
      </div>

      <div class="category-list">
        <article v-for="category in categoryProgress" :key="category.id" class="category-card">
          <div class="category-head">
            <strong>{{ category.label }}</strong>
            <span>{{ category.answered }}/{{ category.count }}</span>
          </div>
          <div class="mini-track" aria-hidden="true">
            <span :style="{ width: `${(category.answered / category.count) * 100}%` }" />
          </div>
        </article>
      </div>

      <div class="privacy-note">
        <strong>Privacy note</strong>
        <p>
          Your responses stay in this browser unless you choose to copy the summary out.
        </p>
      </div>
    </aside>

    <div class="assessment-main">
      <transition name="panel" mode="out-in">
        <article v-if="stage === 'quiz'" :key="currentQuestion.id" class="question-card">
          <div class="question-meta">
            <p>Question {{ currentIndex + 1 }} of {{ questions.length }}</p>
            <span class="category-pill">{{ currentQuestion.categoryLabel }}</span>
          </div>

          <header class="question-header">
            <h3>{{ currentQuestion.prompt }}</h3>
            <p>{{ currentQuestion.detail }}</p>
          </header>

          <fieldset class="answer-grid">
            <legend class="sr-only">Choose how much this feels like you</legend>

            <label
              v-for="option in responseOptions"
              :key="option.value"
              class="answer-option"
              :class="{ selected: currentAnswer === option.value }"
            >
              <input
                class="sr-only"
                type="radio"
                :name="currentQuestion.id"
                :checked="currentAnswer === option.value"
                @change="setAnswer(option.value)"
              />
              <span class="answer-label">{{ option.label }}</span>
              <span class="answer-caption">{{ option.caption }}</span>
            </label>
          </fieldset>

          <div class="question-actions">
            <button class="button button--ghost" type="button" @click="goBack" :disabled="currentIndex === 0">
              Back
            </button>
            <button
              class="button button--primary"
              type="button"
              @click="continueForward"
              :disabled="currentAnswer === null"
            >
              {{ currentIndex === questions.length - 1 ? 'See reflection' : 'Continue' }}
            </button>
          </div>
        </article>

        <article v-else key="results" class="results-card">
          <header class="results-hero">
            <div class="score-ring" :style="{ '--score': `${scorePercent}%` }">
              <strong>{{ scorePercent }}%</strong>
            </div>

            <div class="results-copy">
              <p class="results-kicker">{{ band.eyebrow }}</p>
              <h3>{{ band.title }}</h3>
              <p>{{ band.description }}</p>
              <p class="results-emphasis">{{ band.emphasis }}</p>
            </div>
          </header>

          <div class="results-grid">
            <section class="result-panel">
              <h4>Strongest themes</h4>
              <div
                v-for="category in topCategories"
                :key="category.id"
                class="strength-row"
              >
                <div class="strength-head">
                  <span>{{ category.label }}</span>
                  <span>{{ Math.round(category.strength * 100) }}%</span>
                </div>
                <div class="mini-track mini-track--strength" aria-hidden="true">
                  <span :style="{ width: `${Math.round(category.strength * 100)}%` }" />
                </div>
              </div>
            </section>

            <section class="result-panel">
              <h4>Most strongly endorsed prompts</h4>
              <ul class="signal-list">
                <li v-for="item in highSignalItems" :key="item.prompt">
                  <strong>{{ item.categoryLabel }}:</strong> {{ item.prompt }}
                </li>
                <li v-if="highSignalItems.length === 0">
                  No single item landed in the highest response bands, which can still happen with mixed results.
                </li>
              </ul>
            </section>

            <section class="result-panel">
              <h4>Suggested next steps</h4>
              <ul class="signal-list">
                <li v-for="step in nextSteps" :key="step">{{ step }}</li>
              </ul>
              <p v-if="historyStrength < 0.45" class="history-note">
                Long-standing patterns usually matter more in this kind of reflection than
                changes that only appeared recently during stress or burnout.
              </p>
            </section>
          </div>

          <section class="summary-panel">
            <div class="summary-head">
              <div>
                <p class="summary-kicker">Optional reflection notes</p>
                <h4>Add personal notes before you copy your summary</h4>
              </div>
              <button class="button button--soft" type="button" @click="copySummary">
                {{ copied ? 'Copied' : 'Copy summary' }}
              </button>
            </div>

            <textarea
              v-model="reflectionNotes"
              class="notes-field"
              rows="5"
              placeholder="Examples that stood out: social fatigue after work dinners, strong clothing sensitivities, childhood routines, masking in meetings..."
            />
          </section>

          <div class="results-actions">
            <button class="button button--ghost" type="button" @click="reviewAnswers">
              Review answers
            </button>
            <button class="button button--soft" type="button" @click="resetAll">
              Start over
            </button>
          </div>
        </article>
      </transition>
    </div>
  </section>
</template>

<style scoped>
.assessment-frame {
  display: grid;
  grid-template-columns: minmax(270px, 340px) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.assessment-sidebar,
.question-card,
.results-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(18, 42, 56, 0.1);
  box-shadow: 0 24px 48px rgba(16, 31, 43, 0.1);
}

.assessment-sidebar {
  position: sticky;
  top: 2rem;
  padding: 1.6rem;
  border-radius: 1.5rem;
}

.sidebar-kicker,
.results-kicker,
.summary-kicker,
.question-meta p {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #0e4e4d;
}

.assessment-sidebar h2 {
  margin: 0.7rem 0 0.85rem;
  font-size: clamp(1.25rem, 2.2vw, 1.7rem);
  line-height: 1.1;
  color: #152330;
}

.sidebar-copy {
  margin: 0;
  color: #586776;
  line-height: 1.65;
}

.sidebar-stat {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-top: 1.4rem;
  color: #152330;
}

.sidebar-stat strong {
  font-size: 2rem;
  line-height: 1;
}

.progress-track,
.mini-track {
  width: 100%;
  height: 0.62rem;
  margin-top: 0.8rem;
  border-radius: 999px;
  background: rgba(14, 78, 77, 0.12);
  overflow: hidden;
}

.progress-track span,
.mini-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0e4e4d, #2d8c82);
}

.sidebar-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.8rem;
  color: #586776;
  font-size: 0.95rem;
}

.category-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.3rem;
}

.category-card {
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(18, 42, 56, 0.08);
}

.category-head,
.strength-head,
.summary-head,
.question-meta,
.results-actions,
.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.category-head span,
.category-head strong,
.strength-head span {
  font-size: 0.94rem;
}

.question-actions {
  margin-top: 1.75rem;
  padding-top: 0.35rem;
}

.privacy-note {
  margin-top: 1.4rem;
  padding: 1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(14, 78, 77, 0.1), rgba(197, 127, 68, 0.09));
  color: #22313e;
}

.privacy-note p {
  margin: 0.4rem 0 0;
  line-height: 1.55;
}

.question-card,
.results-card {
  border-radius: 1.7rem;
  padding: 1.8rem;
}

.question-header {
  margin-top: 1.2rem;
}

.question-header h3,
.results-copy h3 {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.95rem);
  line-height: 1.12;
  color: #152330;
}

.question-header p,
.results-copy p,
.history-note {
  margin: 0.9rem 0 0;
  color: #586776;
  line-height: 1.7;
}

.category-pill {
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(14, 78, 77, 0.1);
  color: #0e4e4d;
  font-size: 0.9rem;
  font-weight: 600;
}

.answer-grid {
  display: grid;
  gap: 0.85rem;
  margin: 1.6rem 0 0;
  padding: 0;
  border: 0;
}

.answer-option {
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.05rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(18, 42, 56, 0.1);
  background: rgba(248, 250, 252, 0.9);
  cursor: pointer;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.answer-option:hover {
  transform: translateY(-1px);
  border-color: rgba(14, 78, 77, 0.35);
}

.answer-option.selected {
  border-color: rgba(14, 78, 77, 0.5);
  background: linear-gradient(135deg, rgba(14, 78, 77, 0.12), rgba(45, 140, 130, 0.08));
  box-shadow: 0 12px 24px rgba(14, 78, 77, 0.12);
}

.answer-label {
  color: #152330;
  font-weight: 700;
}

.answer-caption {
  color: #586776;
}

.button {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1.25rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 180ms ease,
    opacity 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.button--primary {
  background: linear-gradient(135deg, #0e4e4d, #1d6a66);
  color: #f7f3eb;
}

.button--soft {
  background: rgba(14, 78, 77, 0.1);
  color: #0e4e4d;
}

.button--ghost {
  background: transparent;
  color: #586776;
  border: 1px solid rgba(18, 42, 56, 0.12);
}

.results-hero {
  display: grid;
  grid-template-columns: minmax(170px, 220px) minmax(0, 1fr);
  gap: 1.6rem;
  align-items: center;
}

.score-ring {
  --score: 0%;
  display: grid;
  place-items: center;
  width: min(100%, 220px);
  aspect-ratio: 1;
  border-radius: 50%;
  mix-blend-mode: darken;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 1) 56%, transparent 57%),
    conic-gradient(#0e4e4d var(--score), rgba(14, 78, 77, 0.12) var(--score));
  color: #152330;
  box-shadow: inset 0 0 0 1px rgba(18, 42, 56, 0.08);
}

.score-ring strong {
  display: block;
  font-size: clamp(3rem, 5vw, 3.8rem);
  line-height: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.results-emphasis {
  color: #152330 !important;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.7rem;
}

.result-panel,
.summary-panel {
  padding: 1.15rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(18, 42, 56, 0.08);
  background: rgba(248, 250, 252, 0.9);
}

.result-panel h4,
.summary-panel h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #152330;
}

.strength-row {
  margin-top: 1rem;
}

.mini-track--strength {
  margin-top: 0.45rem;
}

.signal-list {
  margin: 0.9rem 0 0;
  padding-left: 1.1rem;
  color: #4e5d6a;
  line-height: 1.65;
}

.summary-panel {
  margin-top: 1rem;
}

.notes-field {
  width: 100%;
  min-height: 7rem;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(18, 42, 56, 0.12);
  background: rgba(255, 255, 255, 0.88);
  font: inherit;
  color: #152330;
  resize: vertical;
}

.results-actions {
  margin-top: 1rem;
  justify-content: flex-end;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 960px) {
  .assessment-frame,
  .results-grid,
  .results-hero {
    grid-template-columns: 1fr;
  }

  .assessment-sidebar {
    position: static;
  }

  .summary-head,
  .results-actions,
  .question-actions {
    flex-wrap: wrap;
  }

  .score-ring {
    width: 160px;
  }
}

@media (max-width: 640px) {
  .assessment-sidebar,
  .question-card,
  .results-card {
    padding: 1.2rem;
    border-radius: 1.25rem;
  }

  .question-meta,
  .category-head,
  .strength-head {
    align-items: start;
  }

  .question-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .button {
    width: 100%;
    justify-content: center;
  }
}
</style>
