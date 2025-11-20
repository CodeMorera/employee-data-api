// CurrencyData ---------------------------------------------
export const getCurrencyConversionData = async () => {
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
  return await response.json();
};

export const getSalary = (amountUSD, currency, currencyData) => {
  const amount =
    (currency === "USD") ? amountUSD : amountUSD * currencyData.conversion_rates[currency];
  const formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(amount);
};