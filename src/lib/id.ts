// Tiny ID generator. Avoids pulling in uuid dep just for this.
export const newId = (prefix = ''): string => {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}${prefix ? '_' : ''}${ts}${rnd}`;
};

let ticketCounter = 1000;
export const setTicketCounter = (n: number) => {
  ticketCounter = n;
};
export const nextTicketNo = (): string => {
  ticketCounter += 1;
  return `RS-${ticketCounter}`;
};
export const peekTicketCounter = () => ticketCounter;

let invoiceCounter = 100;
export const setInvoiceCounter = (n: number) => {
  invoiceCounter = n;
};
export const nextInvoiceNo = (): string => {
  invoiceCounter += 1;
  const yr = new Date().getFullYear().toString().slice(-2);
  return `INV-${yr}-${invoiceCounter}`;
};
export const peekInvoiceCounter = () => invoiceCounter;
