import { Text } from 'components/UI';

import { AttributesTable } from './AttributesTable';
import { Heading } from '@unique-nft/ui-kit';
import { FormBody, FormHeader } from '../components/FormComponents';

export const NFTAttributes = () => {
  return (
    <>
      <FormHeader>
        <Heading size='2'>Token attributes</Heading>
        <Text>
          Customize your token — define your NFTs traits: name, accessory, gender,
          background, face, body, tier, etc.
        </Text>
      </FormHeader>
      <FormBody>
        <AttributesTable />
      </FormBody>
    </>
  );
};
