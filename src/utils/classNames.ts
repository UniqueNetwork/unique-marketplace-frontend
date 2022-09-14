export const classNames = (classes: Record<string, boolean | string | undefined>) => {
  return Object.keys(classes)
    .reduce<string[]>((acc, className) => {
      if (!classes[className]) return acc;

      acc.push(typeof classes[className] === 'string' ? classes[className] as string : className);
      return acc;
    }, [])
    .join(' ');
};
