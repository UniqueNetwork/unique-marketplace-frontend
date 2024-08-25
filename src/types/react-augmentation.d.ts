// react-augmentation.d.ts
import 'react';
import { PropsWithChildren } from 'react';

declare module 'react' {
    interface FunctionComponent<P = {}> {
        (props: PropsWithChildren<P>, context?: any): React.ReactElement<any, any> | null;
    }

    type FCC<P = {}> = (props: PropsWithChildren<P>, context?: any) => React.ReactElement<any, any> | null;
}
