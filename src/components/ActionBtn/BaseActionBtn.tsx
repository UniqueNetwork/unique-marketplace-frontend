import { Button, TooltipWrapper } from 'components/UI';
import { ButtonProps } from 'components/UI/Button/Button';
import { IconProps } from 'components/UI/Icon/Icon';

export const BaseActionBtn = ({
  actionEnabled,
  actionText,
  ...props
}: ButtonProps & {
  actionEnabled: boolean;
  actionText: string | null;
  tooltip?: string | null;
}) => {
  const iconRender = (icon?: IconProps) => {
    return icon ? { ...icon, color: 'currentColor' } : undefined;
  };

  return actionEnabled
? (
    props.tooltip
? (
  <TooltipWrapper message={props.tooltip}>
    <Button {...props} />
  </TooltipWrapper>
    )
: (
  <Button {...props} />
    )
  )
: (
  <TooltipWrapper message={actionText}>
    <Button
      className={props.className}
      title={props.title}
      role={props.role}
      iconLeft={iconRender(props.iconLeft)}
      iconRight={iconRender(props.iconRight)}
      disabled={true}
    />
  </TooltipWrapper>
  );
};
