import objectToGetParams from './objectToGetParams';
import createShareButton from './createShareButton';

function redditLink(url: string, { title }: { title?: string }) {
  return (
    'https://www.reddit.com/submit' +
    objectToGetParams({
      url,
      title
    })
  );
}

const RedditShareButton = createShareButton<{ title?: string }>(
  'reddit',
  redditLink,
  (props) => ({
    title: props.title
  }),
  {
    windowWidth: 660,
    windowHeight: 460,
    windowPosition: 'windowCenter'
  }
);

export default RedditShareButton;
