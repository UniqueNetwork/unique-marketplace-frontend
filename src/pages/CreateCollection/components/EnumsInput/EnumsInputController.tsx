import { Controller, useFormContext, ControllerProps } from 'react-hook-form';
import { useEffect } from 'react';
import { EnumsInput, EnumsInputProps } from './EnumsInput';

export type BaseControllerProps<T> = Omit<T, 'name'> &
  Pick<ControllerProps, 'name' | 'control' | 'rules' | 'defaultValue'>;

export const EnumsInputController: React.FC<
  BaseControllerProps<EnumsInputProps<string>>
> = ({ name, control: userControl, rules, defaultValue, ...enumsProps }) => {
  const { control, register } = useFormContext();

  useEffect(() => {
    register(name, rules);
  }, [name, register, rules]);

  return (
    <Controller
      control={userControl || control}
      render={({ field: { ...enumsField } }) => (
        <EnumsInput {...enumsField} {...enumsProps} />
      )}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
    />
  );
};
