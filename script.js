const defaults = {
  quotedPrice: 2500,
  estimatedHours: 20,
  internalCost: 50,
  softwareCosts: 100,
  revisionBuffer: 15,
  overhead: 10,
  targetMargin: 30,
};

const ids = Object.keys(defaults);
const elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));

const output = {
  deliveryCost: document.getElementById('deliveryCost'),
  totalCost: document.getElementById('totalCost'),
  expectedProfit: document.getElementById('expectedProfit'),
  profitMargin: document.getElementById('profitMargin'),
  effectiveHourlyRate: document.getElementById('effectiveHourlyRate'),
  minimumQuote: document.getElementById('minimumQuote'),
  recommendedQuote: document.getElementById('recommendedQuote'),
  dealScoreLabel: document.getElementById('dealScoreLabel'),
  dealScoreMessage: document.getElementById('dealScoreMessage'),
  scoreCard: document.getElementById('scoreCard'),
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const pct = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function num(id) {
  const value = parseFloat(elements[id].value);
  return Number.isFinite(value) ? value : 0;
}

function clampTargetMargin(value) {
  return Math.min(Math.max(value, 1), 95);
}

function calculate() {
  const quotedPrice = num('quotedPrice');
  const estimatedHours = num('estimatedHours');
  const internalCost = num('internalCost');
  const softwareCosts = num('softwareCosts');
  const revisionBuffer = num('revisionBuffer') / 100;
  const overhead = num('overhead') / 100;
  const targetMargin = clampTargetMargin(num('targetMargin')) / 100;

  const deliveryCost = estimatedHours * internalCost;
  const revisionCost = deliveryCost * revisionBuffer;
  const overheadCost = (deliveryCost + revisionCost + softwareCosts) * overhead;
  const totalRealCost = deliveryCost + revisionCost + softwareCosts + overheadCost;
  const expectedProfit = quotedPrice - totalRealCost;
  const profitMargin = quotedPrice > 0 ? expectedProfit / quotedPrice : 0;
  const effectiveHourlyRate = estimatedHours > 0 ? expectedProfit / estimatedHours : 0;
  const minimumQuote = totalRealCost;
  const recommendedQuote = (1 - targetMargin) > 0 ? totalRealCost / (1 - targetMargin) : totalRealCost;

  output.deliveryCost.textContent = money.format(deliveryCost);
  output.totalCost.textContent = money.format(totalRealCost);
  output.expectedProfit.textContent = money.format(expectedProfit);
  output.profitMargin.textContent = pct.format(profitMargin);
  output.effectiveHourlyRate.textContent = money.format(effectiveHourlyRate);
  output.minimumQuote.textContent = money.format(minimumQuote);
  output.recommendedQuote.textContent = money.format(recommendedQuote);

  let label = 'Healthy deal';
  let message = 'Worth taking.';
  let className = 'card score-card';

  if (expectedProfit <= 0 || effectiveHourlyRate < 25) {
    label = 'Bad deal';
    message = 'Do not take this deal at current pricing.';
    className = 'card score-card danger';
  } else if (profitMargin < targetMargin) {
    label = 'Tight deal';
    message = 'Tight margin — raise price or reduce scope.';
    className = 'card score-card warning';
  }

  output.dealScoreLabel.textContent = label;
  output.dealScoreMessage.textContent = message;
  output.scoreCard.className = className;
}

ids.forEach((id) => {
  elements[id].addEventListener('input', calculate);
});

document.getElementById('resetDefaults').addEventListener('click', () => {
  ids.forEach((id) => {
    elements[id].value = defaults[id];
  });
  calculate();
});

calculate();