export const getRandImage = () => {
  const imagePath = `img${Math.floor(Math.random() * 4 + 1)}.png`;
  return imagePath;
};
