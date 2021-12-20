export const shortcutAccountId = (accountId: string) => {
  //Cut it to the first and last 5 symbols
  const [_, start, end] = /^(.{5}).*(.{5})$/.exec(accountId) || []
  return start && end ? `${start}...${end}` : accountId
}
