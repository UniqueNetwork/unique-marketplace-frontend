import React from 'react';
import styled from 'styled-components';
import { useCalculateTimeLeft } from '../../hooks/useCalculateTimeLeft';
import { Heading } from 'components/UI';

interface Props {
  time: string;
  testid?: string;
}

function Timer({ time, testid }: Props): React.ReactElement<Props> {
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

  return (
    <TimerStyled>
      {daysLeft >= 0 && <>
        <ShortTimer data-testid={`${testid}-auction-ends-text`}>
          {`Auction ends ${months[monthNumber]} ${day}, ${year} at  ${hoursFormat}:${minutes} ${suffix} ${timezone}`}
        </ShortTimer>
        <DetailedTimer>
          <Cell>
            <Heading size='4' testid={`${testid}-days`}>{checkTime(daysLeft.toString())}</Heading>
            <Description data-testid={`${testid}-days-label`}>{daysLeft > 1 ? 'days' : 'day'}</Description>
          </Cell>
          <Heading size='4'>:</Heading>
          <Cell>
            <Heading size='4' testid={`${testid}-hours`}>{checkTime(hoursLeft.toString())}</Heading>
            <Description data-testid={`${testid}-hours-label`}>{hoursLeft > 1 ? 'hours' : 'hour'}</Description>
          </Cell>
          <Heading size='4'>:</Heading>
          <Cell>
            <Heading size='4' testid={`${testid}-minutes`}>{checkTime(minutesLeft.toString())}</Heading>
            <Description data-testid={`${testid}-minutes-label`}>{minutesLeft > 1 ? 'minutes' : 'minute'}</Description>
          </Cell>
          <Heading size='4'>:</Heading>
          <Cell>
            <Heading size='4' testid={`${testid}-seconds`}>{checkTime(secondsLeft.toString())}</Heading>
            <Description data-testid={`${testid}-seconds-label`}>{secondsLeft > 1 ? 'seconds' : 'second'}</Description>
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
  font-weight: 400;
  font-family: var(--font-inter);
  color: #81858E;
  margin-bottom: 16px;
`;

const DetailedTimer = styled.div`
  display: flex;
  align-items: baseline;
  column-gap: 8px;
  margin-bottom: 4px;
`;

const Cell = styled.div`
  && {
    display: flex;
    flex-direction: column;   

    h4 {
      margin-bottom: 4px;
      border: 1px solid #D2D3D6;
      border-radius: 8px;
      width: 28px;
      height: 28px;
      padding: 13px;
      text-align: center;
    }
  }
`;

const Description = styled.div`
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  font-family: var(--font-inter);
`;

export default React.memo(Timer);
