let time = Date.now();
const DeltaTime = () => {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;
  return deltaTime / 1000;
};
export default DeltaTime;