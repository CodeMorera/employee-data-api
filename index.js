//Import sample data
import { error } from "node:console";
import fs from "node:fs/promises";
// Global variables ----------------------------------------

let employees = [];
let currencyData;

// CurrencyData ---------------------------------------------
const getCurrencyConversionData = async () => {
  const headers = new Headers();
  headers.append("apikey", "15480e98d8e772824d830821");
  const options = {
    method: "GET",
    redirect: "follow",
    headers,
  };
  const response = await fetch(
    "https://v6.exchangerate-api.com/v6/15480e98d8e772824d830821/latest/USD?base=USD",
    options
  );
  if (!response.ok) {
    throw new Error("Cannot fetch-currency data.");
  }
  currencyData = await response.json();
};

const getSalary = (amountUSD, currency) => {
  const amount =
    (currency === "USD") ? amountUSD : amountUSD * currencyData.conversion_rates[currency];
  const formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(amount);
};

// Loading and writing data to the filesystem----------------

const loadData = async () => {
  console.log("Loading employees.....");
  try {
    const fileData = await fs.readFile("./data.json");
    employees = JSON.parse(fileData);
  } catch (err) {
    console.error("Cannot load in employees");
    throw err;
  }
};
const writeData = async () => {
  console.log("Writing employees.....");
  try {
    await fs.writeFile("./data.json", JSON.stringify(employees, null, 2));
  } catch (err) {
    console.error("Cannot write employees data");
    throw err;
  }
};

import createPrompt from "prompt-sync";
let prompt = createPrompt();

const logEmployee = (employee) => {
  Object.entries(employee).forEach((entry) => {
    if (entry[0] !== "salaryUSD" || entry[0] !== "localCurrency")
    {
      console.log(`${entry[0]}: ${entry[1]}`);
    }
  });
  console.log(`Salary USD: ${getSalary(employee.salaryUSD, "USD")}`);
  console.log(`Local Salary: ${getSalary(employee.salaryUSD, employee.localCurrency)}`);
};

function getInput(promptText, validator, transformer) {
  let value = prompt(promptText);
  if (validator && !validator(value)) {
    console.error("--Invalid Input--");
    return getInput(promptText, validator, transformer);
  }
  if (transformer) {
    return transformer(value);
  }
  return value;
}

const getMaxEmployeeId = () => {
  const maxID = Math.max(...employees.map((e) => e.id));
  return maxID + 1;
};

//Validator Functions -----------------------------------------
const isCurrencyCodeValid = function (code) {
  const currencyCodes = Object.keys(currencyData.conversion_rates);
  return (currencyCodes.indexOf(code) > -1);
};

const isStringInputValid = function (input) {
  return input ? true : false;
  //If input return true else false
};

const isBooleanInputValid = function (input) {
  return input === "yes" || input === "no";
};

const isIntegerValid = (min, max) => {
  return (input) => {
    let numValue = Number(input);
    if (!Number.isInteger(numValue) || numValue < min || numValue > max) {
      return false;
    }
    return true;
  };
};

//Application commands: ---------------------------------------
function listEmployees() {
  console.log(`Employee List -------------------------`);
  console.log("");
  employees.forEach((e) => {
    logEmployee(e);
    prompt("Press enter to continue...");
  });
  console.log("Employee list completed.");
}

async function addEmployee() {
  console.log("Add Employee --------------------------");
  console.log("");
  const employee = {};
  employee.id = getMaxEmployeeId();
  employee.firstName = getInput("First Name: ", isStringInputValid); //not passing the function, just passing it as a parameter
  employee.lastName = getInput("Last Name: ", isStringInputValid);
  let startDateYear = getInput(
    "Employee Start Year (1990-2025): ",
    isIntegerValid(1990, 2025)
  );
  let startDateMonth = getInput(
    "Employee Start Month (1-12): ",
    isIntegerValid(1, 12)
  );
  let startDateDay = getInput(
    "Employee Start Day (1-31): ",
    isIntegerValid(1, 31)
  );
  employee.startDate = new Date(
    startDateYear,
    startDateMonth - 1,
    startDateDay
  );
  employee.isActive = getInput(
    "Is employee active (yes or no): ",
    isBooleanInputValid,
    (input) => input === "yes"
  );
  employee.salaryUSD = getInput(
    "Annual salary in USD: ",
    isIntegerValid(10_000, 1_000_000)
  );
  employee.localCurrency = getInput(
    "Local currency (3 letter code): ",
    isCurrencyCodeValid
  );

  employees.push(employee);
  await writeData();
}

//Search for employees by id
function searchId() {
  const id = getInput("Employee ID: ", null, Number);
  const result = employees.find((e) => e.id === id);
  if (result) {
    console.log("");
    logEmployee(result);
  } else {
    console.log("No results...");
  }
}
//Search for employees by name
function searchByName() {
  const firstNameSearch = getInput("First Name: ").toLowerCase();
  const lastNameSearch = getInput("Last Name: ").toLowerCase();
  const results = employees.filter((e) => {
    if (
      firstNameSearch &&
      !e.firstName.toLowerCase().includes(firstNameSearch)
    ) {
      return false;
    }
    if (lastNameSearch && !e.lastName.toLowerCase().includes(lastNameSearch)) {
      return false;
    }
    return true;
  });
  if (results === "false") {
    console.log("No results.");
  } else {
    results.forEach((e, idx) => {
      console.log("");
      console.log(`Search Result ${idx + 1}-----------------------------`);
      logEmployee(e);
    });
  }
}

const main = async () => {
  //Get the command the user wants to exercise
  const command = process.argv[2].toLowerCase();
  switch (command) {
    case "list":
      listEmployees();
      break;
    case "add":
      await addEmployee();
      break;
    case "search-by-id":
      searchId();
      break;
    case "search-by-name":
      searchByName();
      break;
    default:
      console.log("Unsupported command. Exiting....");
      process.exit(1);
  }
};

Promise.all([loadData(),getCurrencyConversionData()])
  .then(main)
  .catch((err) => {
    console.error("Cannot complete startup");
    throw err;
  });
