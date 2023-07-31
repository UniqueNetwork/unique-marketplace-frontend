import { Heading, Link } from '@unique-nft/ui-kit';
import { get } from 'api/restApi/base';
import { Button, Text } from 'components/UI';
import { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

type SlideProps = {
  title: string
  description: string
  mediaUrl: string
  link: string
  link2?: string
  buttonTitle: string
  buttonTitle2?: string
  className?: string
}

export const Slide = ({ title, description, buttonTitle, mediaUrl, link, link2, buttonTitle2, className }: SlideProps) => {
  const mediaType = useMemo(() => /(\.mp4|\.webm|\.ogv)$/.test(mediaUrl.toLowerCase())
    ? 'video'
    : /\.html$/.test(mediaUrl.toLowerCase()) ? 'html' : 'image', [mediaUrl]);

  const iFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (mediaType !== 'html' || !iFrameRef) return;

    const doc = iFrameRef.current?.contentWindow?.document;
    if (!doc) return;

    void (async () => {
      const { data } = await get(mediaUrl);
      if (data) {
        doc.open();
        doc.write(data);
        doc.close();
      }
    })();
  }, [mediaType, mediaUrl]);

  return <SlideWrapper className={className}>
    <LeftSide>
      <HeadingStyled >{title}</HeadingStyled>
      <Description><Text size='l'>{description}</Text></Description>
      <ButtonWrapper>
        {buttonTitle && <Link href={link} >
          <Button title={buttonTitle} role='primary' />
        </Link>}
        {buttonTitle2 && <Link href={link2} >
          <Button title={buttonTitle2} role='ghost' />
        </Link>}
      </ButtonWrapper>
    </LeftSide>
    <RightSide>
      {mediaType === 'html' && <IFrame ref={iFrameRef} src='about:blank' />}
      {mediaType === 'image' && <Picture src={mediaUrl} />}
      {mediaType === 'video' && <Video src={mediaUrl} autoPlay loop />}
    </RightSide>
  </SlideWrapper>;
};

const SlideWrapper = styled.div`
  display: flex;
  height: 100%;
  object-fit: cover;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    padding: 0 4px;
  }

  &.previous, &.next {
    h1 {
      opacity: 0;
    }
    .unique-text {
      opacity: 0;
      transform: translate(0, 10px);
    }
    a {
      opacity: 0;
      transform: translate(0, 20px);
    }
    img {
      opacity: 0;
    }
  }

  &.animateIn {
      &.previous,
      &.next {
        h1 {
          opacity: 1;
          transition: opacity 0.4s ease;  
          transition-delay: 0.4s;
        }
        .unique-text {
          opacity: 1;
          transform: translate(0, 0px);
          transition: opacity 0.8s ease, transform 1s ease-in;
          transition-delay: 0.4s;
        }
        a {
          opacity: 1;
          transform: translate(0, 0px);
          transition: opacity 0.6s ease, transform 1s ease-in;
          transition-delay: 0.5s;
        }
        img, video, iframe {
          opacity: 1;
          transition: opacity 0.8s ease;
        }
      }
    }

    &.animateOut {
      &.previous {
        h1 {
          opacity: 0;
          transition: opacity 1s ease;  
        }
        .unique-text {
          opacity: 0;
          transition: opacity 1s ease;
          transform: translate(0, 0) !important;

        }
        a {
          opacity: 0;
          transition: opacity 1s ease;
          transform: translate(0, 0) !important;
        }
        img, video, iframe {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
      }

      &.next {
        h1 {
          opacity: 0;
          transition: opacity 1s ease;
        }
        .unique-text {
          opacity: 0;
          transition: opacity 1s ease;
          transform: translate(0, 0) !important;
        }
        a {
          opacity: 0;
          transition: opacity 1s ease;
          transform: translate(0, 0) !important;
        }
        img, video, iframe {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
      }
    }
`;

const RightSide = styled.div`
  display: flex;
  
  width: calc(50vw - 128px);
  height: calc(37.5vw - 96px);
  @media (min-width: 1920px) {
    height: 478px;
    width: 637px;
    min-width: 637px;
  }

  @media (max-width: 1024px) {
    width: calc(50vw - 64px);
    height: calc(37.5vw - 48px);
  }
  @media (max-width: 768px) {
    width: 100vw;
    height: calc(75vw);
    flex: auto;
  }
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap) * 2);
  padding: 40px 96px 40px 48px;
  justify-content: center;
  width: calc(50vw - 256px);

  @media (max-width: 1378px) {
    padding: 16px;
    width: calc(50vw - 144px);
  }
  @media (max-width: 1278px) {
    padding: 0 16px;
    gap: calc(var(--gap) * 1);
  }
  @media (max-width: 1024px) {
    width: calc(50vw - 64px);
    height: calc(37.5vw - 48px);
  }
  @media (max-width: 768px) {
    padding: 16px;
    width: calc(100vw - 32px);
    height: 200px;
  }
`;

const HeadingStyled = styled(Heading)`
  display: flex;
  font-size: 64px !important;
  font-weight: 700;
  line-height: 64px !important;

  margin-bottom: 0 !important;
  opacity: 1;

  @media (max-width: 1395px) {
    font-size: 48px !important;
    line-height: 32px !important;
  }
  @media (max-width: 1278px) {
    font-size: 30px !important;
    line-height: 30px !important;
  }
`;
const Description = styled.div`
  display: -webkit-box;
  margin-bottom: var(--gap);
  width: 100%;
  height: auto;
  overflow: hidden; 
  -webkit-line-clamp: 3;
  opacity: 1;
  &>span {
    text-overflow: ellipsis;   
    font-size: 18px !important;
  }
  @media (max-width: 1280px) {
    &>span {
      font-size: 14px;
      font-size: 14px !important;
    }
  }
  @media (max-width: 1024px) {
    max-height: 108px;
    -webkit-box-orient: vertical;
  }
  @media (max-width: 768px) {
    max-height: 84px;
    -webkit-box-orient: vertical;
  }
`;
const Picture = styled.img`
  display: flex;
  width: 100%;
  object-fit: cover;
  @media (max-width: 768px) {
  }
`;
const Video = styled.video`
  display: flex;
  width: 100%;
  object-fit: cover;
  @media (max-width: 768px) {
  }
`;
const IFrame = styled.iframe`
  display: flex;
  border: none;
  width: 100%;
  object-fit: cover;
  @media (max-width: 768px) {
  }
`;
const ButtonWrapper = styled.div`
  display: flex;
  gap: 32px;
`;
