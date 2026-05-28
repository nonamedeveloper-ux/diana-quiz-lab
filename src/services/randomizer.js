'use strict';

// Fisher-Yates shuffle — in-place
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffle answer options and recalculate correct answer letter
function shuffleAnswers(question) {
  const original = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  };
  const correctText = original[question.correctAnswer];

  const options = [
    { key: 'A', text: original.A },
    { key: 'B', text: original.B },
    { key: 'C', text: original.C },
    { key: 'D', text: original.D },
  ];
  shuffle(options);

  const newCorrect = ['A', 'B', 'C', 'D'][options.findIndex(o => o.text === correctText)];

  return {
    shuffledA: options[0].text,
    shuffledB: options[1].text,
    shuffledC: options[2].text,
    shuffledD: options[3].text,
    correctAnswer: newCorrect,
  };
}

/**
 * Generate `variantCount` test variants, each with `questionsPerVariant` questions.
 *
 * Algorithm:
 *  1. Maintain a usage-count map per question.
 *  2. For each variant, sort questions by usage count (ascending) then add random
 *     noise so ties are broken randomly — this maximises inter-variant diversity.
 *  3. Take the first `questionsPerVariant` entries, shuffle their order.
 *  4. Shuffle each question's answer choices and recalculate the correct letter.
 */
function generateVariants(questions, variantCount, questionsPerVariant) {
  if (questions.length < questionsPerVariant) {
    throw new Error(
      `Savollar yetarli emas. Mavjud: ${questions.length}, kerakli: ${questionsPerVariant}`
    );
  }

  const usageCount = new Map(questions.map(q => [q.id, 0]));
  const variants = [];

  for (let v = 1; v <= variantCount; v++) {
    // Sort by usage count + random noise for tie-breaking
    const sorted = [...questions].sort((a, b) => {
      const diff = usageCount.get(a.id) - usageCount.get(b.id);
      return diff !== 0 ? diff : Math.random() - 0.5;
    });

    const selected = sorted.slice(0, questionsPerVariant);
    shuffle(selected);   // randomise order within variant

    const variantQuestions = selected.map((q, idx) => {
      const answers = shuffleAnswers(q);
      usageCount.set(q.id, usageCount.get(q.id) + 1);
      return {
        questionId: q.id,
        questionText: q.text,
        position: idx + 1,
        ...answers,
      };
    });

    variants.push({ variantNumber: v, questions: variantQuestions });
  }

  return variants;
}

/**
 * Build a compact answer-key string for one variant.
 * e.g. ["1-A", "2-C", "3-B", ...]
 */
function buildAnswerKey(variantQuestions) {
  return variantQuestions
    .sort((a, b) => a.position - b.position)
    .map(q => `${q.position}-${q.correctAnswer}`);
}

module.exports = { generateVariants, buildAnswerKey };
