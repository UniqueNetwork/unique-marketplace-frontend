import objectToGetParams from './objectToGetParams';
import createShareButton from './createShareButton';

function telegramLink(url: string, { title }: { title?: string }) {
  return (
    'https://telegram.me/share/url' +
    objectToGetParams({
      url,
      text: title
    })
  );
}

const TelegramShareButton = createShareButton<{ title?: string }>(
  'telegram',
  telegramLink,
  (props) => ({
    title: props.title
  }),
  {
    windowWidth: 550,
    windowHeight: 400
  }
);

export default TelegramShareButton;
