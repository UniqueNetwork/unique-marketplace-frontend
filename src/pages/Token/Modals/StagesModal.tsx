const StagesModal = (props: any) => {
  const stages = [{ title: 'debug' }];
  return (
    <div>
      {stages.map((stage) => (<div>{stage.title}</div>))}
    </div>
  );
};

export default StagesModal;
