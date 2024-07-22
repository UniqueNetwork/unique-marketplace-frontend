export const useRandomColor = () => {
  const randomLightColor = () => {
    const r = Math.floor(200 + Math.random() * 55);
    const g = Math.floor(200 + Math.random() * 55);
    const b = Math.floor(200 + Math.random() * 55);

    return `rgb(${r},${g},${b})`;
  };

  const color = randomLightColor();

  return color;
};