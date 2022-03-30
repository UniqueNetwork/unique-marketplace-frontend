import React from 'react';
import styled from 'styled-components';
import { Heading } from '@unique-nft/ui-kit';
import { useCalculateTimeLeft } from '../../hooks/useCalculateTimeLeft';

interface Props {
  time: string;
}

function Timer({ time }: Props): React.ReactElement<Props> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function checkTime(i: string) {
    if (Number(i) < 10) {
      i = '0' + i;
    }
    return i;
  }

  const localeDate = new Date(time);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'];
  const year = localeDate.getFullYear();
  const monthNumber = localeDate.getMonth();
  const day = localeDate.getDate();

  const hours = localeDate.getHours();
  const minutes = checkTime(localeDate.getMinutes().toString());

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hoursFormat = ((hours + 11) % 12 + 1);

  const { secondsLeft, minutesLeft, hoursLeft, daysLeft } = useCalculateTimeLeft(time);
  console.log('daysLeft', daysLeft);

  return (
    <TimerStyled>
      {daysLeft >= 0 && <>
        <ShortTimer>
          {`Auction ends ${months[monthNumber]} ${day}, ${year} at  ${hoursFormat}:${minutes} ${suffix} ${timezone}`}
        </ShortTimer>
        <DetailedTimer>
          <Cell>
            <Heading size='4'>{checkTime(daysLeft.toString())}</Heading>
            <Description>{daysLeft > 1 ? 'Days' : 'Day'}</Description>
          </Cell>
          <Cell>
            <Heading size='4'>{checkTime(hoursLeft.toString())}</Heading>
            <Description>{hoursLeft > 1 ? 'Hours' : 'Hour'}</Description>
          </Cell>
          <Cell>
            <Heading size='4'>{checkTime(minutesLeft.toString())}</Heading>
            <Description>{minutesLeft > 1 ? 'Minutes' : 'Minute'}</Description>
          </Cell>
          <Cell>
            <Heading size='4'>{checkTime(secondsLeft.toString())}</Heading>
            <Description>{secondsLeft > 1 ? 'Seconds' : 'Second'}</Description>
          </Cell>
        </DetailedTimer>
      </>}
      {daysLeft < 0 &&
        <ShortTimer>
          Auction is over
        </ShortTimer>}
    </TimerStyled>
  );
}

const TimerStyled = styled.div`
`;

const ShortTimer = styled.div`
  font-size: 16px;
  line-height: 24px;
  font-weight:400px;
  font-family: var(--font-inter);
  color: #81858E;
  margin-bottom: 16px;
`;

const DetailedTimer = styled.div`
  display: flex;
`;

const Cell = styled.div`
  && {
    display: flex;
    flex-direction: column;
    margin-right: 24px;

    h4 {
      margin-bottom: 0;
    }
  }
`;

const Description = styled.div`
  font-size: 16px;
  line-height: 24px;
  font-weight:400px;
  font-family: var(--font-inter);
  color: #81858E;
`;

export default React.memo(Timer);
