import compound from "compound-calc";
import Chart from "chart.js/auto";

type Inputs = {
  initialAmount: HTMLInputElement;
  goalAmount: HTMLInputElement;
  contributionAmount: HTMLInputElement;
  interestRate: HTMLInputElement;
  timeToSave: HTMLInputElement;
};

type Goal = Record<keyof Inputs, number>;

let inputs: Inputs;
let ctx: CanvasRenderingContext2D;
let goal: Goal;
let savingsChart: Chart;

function getElementById(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Could not find element with id ${id}`);
  }
  return el;
}

function initChart(ctx: CanvasRenderingContext2D) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Savings Over Time",
          data: [],
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Months",
          },
        },
        y: {
          title: {
            display: true,
            text: "Savings Amount ($)",
          },
        },
      },
    },
  });
}

function init() {
  inputs = {
    initialAmount: getElementById("initialAmount") as HTMLInputElement,
    goalAmount: getElementById("goalAmount") as HTMLInputElement,
    contributionAmount: getElementById(
      "contributionAmount"
    ) as HTMLInputElement,
    interestRate: getElementById("interestRate") as HTMLInputElement,
    timeToSave: getElementById("timeToSave") as HTMLInputElement,
  };

  const canvas = getElementById("savingsChart") as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (context) {
    ctx = context;
  } else {
    throw new Error("Could not get canvas context");
  }

  goal = {} as Goal;
  updateGoal(goal);
  savingsChart = initChart(ctx);

  updateChart();
}

function updateGoal(goal: Goal) {
  if (!goal) {
  }
  if (inputs) {
    for (const key in inputs) {
      goal[key] = parseFloat(inputs[key].value);
    }
  }
}

function updateValue(id: string, value: string) {
  getElementById(id + "Value").innerText = value;

  goal[id as keyof Inputs] = parseFloat(value);
}

function setValue(id: keyof Inputs, value: number) {
  inputs[id].value = value.toString();
  getElementById(id + "Value").innerText = value.toString();
}

// function calculateSavings(goal: Goal) {
//   let savings: number[] = [];
//   let monthlyRate = goal.interestRate / 100 / 12;
//   let monthlyDeposit =
//     goal.goalAmount /
//     ((Math.pow(1 + monthlyRate, goal.timeToSave) - 1) / monthlyRate);
//   for (let month = 1; month <= goal.timeToSave; month++) {
//     let amount =
//       monthlyDeposit * ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate);
//     savings.push(amount);
//   }
//   return savings;
// }

function calculateSavings(goal: Goal): number[] {
  let savings: number[] = [];
  let monthlyRate = goal.interestRate / 100 / 12;
  let currentAmount = goal.initialAmount;
  let monthlyDeposit = goal.contributionAmount / 12;
  let month = 0;

  while (currentAmount < goal.goalAmount) {
    //(initial, amount, years, interest, accrualPeriod = 1, contributionPeriod = 1, contributeBeforeInterest = false)
    // currentAmount = compound(currentAmount, monthlyRate, 1);
    currentAmount += monthlyDeposit;
    currentAmount += currentAmount * monthlyRate;
    savings.push(currentAmount);
    month++;
  }

  goal.timeToSave = month; // Update the time to save in the goal object
  setValue("timeToSave", month);

  return savings;
}

function updateChart() {
  let savings = calculateSavings(goal);
  console.log("savings", savings);
  savingsChart.data.labels = Array.from(
    { length: goal.timeToSave },
    (_, i) => i + 1
  );
  savingsChart.data.datasets[0].data = savings;
  savingsChart.update();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  const inputEls = document.querySelectorAll('input[type="range"]');
  for (const input of inputEls) {
    input.addEventListener("input", (ev) => {
      const target = ev!.target as HTMLInputElement;
      updateValue(target.id, target.value);
      updateChart();
    });
  }
});
